import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { getRandomLocation, resetUsedLocations } from '@/lib/locations';
import { reverseGeocode, LocationInfo } from '@/lib/geocoding';

interface Location {
  lat: number;
  lng: number;
}

interface RoundResult {
  roundNumber: number;
  actualLocation: Location;
  guessLocation: Location | null;
  distance: number;
  score: number;
  locationInfo: LocationInfo | null;
}

interface GameState {
  gameId: string | null;
  currentRound: number;
  totalRounds: number;
  totalScore: number;
  currentLocation: Location | null;
  guessLocation: Location | null;
  roundResults: RoundResult[];
  isRoundComplete: boolean;
  isGameComplete: boolean;
}

const TOTAL_ROUNDS = 5;

function calculateDistance(loc1: Location, loc2: Location): number {
  const R = 6371; // Earth's radius in km
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function calculateScore(distance: number): number {
  // Max score is 5000, decreases based on distance
  // 0 km = 5000 points, 5000+ km = 0 points
  const maxDistance = 5000;
  const maxScore = 5000;
  const score = Math.max(0, Math.round(maxScore * (1 - distance / maxDistance)));
  return score;
}

export function useGame() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState>({
    gameId: null,
    currentRound: 1,
    totalRounds: TOTAL_ROUNDS,
    totalScore: 0,
    currentLocation: null,
    guessLocation: null,
    roundResults: [],
    isRoundComplete: false,
    isGameComplete: false,
  });

  const startNewGame = useCallback(async () => {
    // Reset used locations for a fresh game
    resetUsedLocations();
    const newLocation = getRandomLocation();
    
    let gameId: string | null = null;
    
    if (user) {
      const { data, error } = await supabase
        .from('games')
        .insert({ user_id: user.id })
        .select('id')
        .single();
      
      if (!error && data) {
        gameId = data.id;
      }
    }

    setGameState({
      gameId,
      currentRound: 1,
      totalRounds: TOTAL_ROUNDS,
      totalScore: 0,
      currentLocation: newLocation,
      guessLocation: null,
      roundResults: [],
      isRoundComplete: false,
      isGameComplete: false,
    });
  }, [user]);

  const setGuess = useCallback((location: Location) => {
    setGameState(prev => ({ ...prev, guessLocation: location }));
  }, []);

  const submitGuess = useCallback(async () => {
    if (!gameState.currentLocation || !gameState.guessLocation) return;

    const distance = calculateDistance(gameState.currentLocation, gameState.guessLocation);
    const score = calculateScore(distance);

    // Get location info via reverse geocoding
    const locationInfo = await reverseGeocode(
      gameState.currentLocation.lat,
      gameState.currentLocation.lng
    );

    const roundResult: RoundResult = {
      roundNumber: gameState.currentRound,
      actualLocation: gameState.currentLocation,
      guessLocation: gameState.guessLocation,
      distance,
      score,
      locationInfo,
    };

    // Save round to database
    if (user && gameState.gameId) {
      await supabase.from('game_rounds').insert({
        game_id: gameState.gameId,
        round_number: gameState.currentRound,
        actual_lat: gameState.currentLocation.lat,
        actual_lng: gameState.currentLocation.lng,
        guess_lat: gameState.guessLocation.lat,
        guess_lng: gameState.guessLocation.lng,
        distance_km: distance,
        score,
      });
    }

    const newTotalScore = gameState.totalScore + score;
    const isLastRound = gameState.currentRound >= gameState.totalRounds;

    setGameState(prev => ({
      ...prev,
      totalScore: newTotalScore,
      roundResults: [...prev.roundResults, roundResult],
      isRoundComplete: true,
      isGameComplete: isLastRound,
    }));

    // Complete game in database
    if (isLastRound && user && gameState.gameId) {
      await supabase
        .from('games')
        .update({
          total_score: newTotalScore,
          rounds_played: TOTAL_ROUNDS,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', gameState.gameId);
    }
  }, [gameState, user]);

  const nextRound = useCallback(() => {
    if (gameState.isGameComplete) return;

    const newLocation = getRandomLocation();
    
    setGameState(prev => ({
      ...prev,
      currentRound: prev.currentRound + 1,
      currentLocation: newLocation,
      guessLocation: null,
      isRoundComplete: false,
    }));
  }, [gameState.isGameComplete]);

  return {
    gameState,
    startNewGame,
    setGuess,
    submitGuess,
    nextRound,
  };
}
