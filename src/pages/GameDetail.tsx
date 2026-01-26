/// <reference types="@types/google.maps" />
import { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { format } from 'date-fns';
import { ArrowLeft, MapPin, Navigation, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GameRound {
  id: string;
  round_number: number;
  actual_lat: number;
  actual_lng: number;
  guess_lat: number | null;
  guess_lng: number | null;
  distance_km: number | null;
  score: number;
}

interface GameData {
  id: string;
  total_score: number;
  rounds_played: number;
  created_at: string;
}

export default function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isLoaded } = useGoogleMaps();
  const [game, setGame] = useState<GameData | null>(null);
  const [rounds, setRounds] = useState<GameRound[]>([]);
  const [selectedRound, setSelectedRound] = useState(0);
  const [loading, setLoading] = useState(true);
  const streetViewRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const panoramaInstanceRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!user || !id) {
      setLoading(false);
      return;
    }

    const fetchGame = async () => {
      const [gameResult, roundsResult] = await Promise.all([
        supabase
          .from('games')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('game_rounds')
          .select('*')
          .eq('game_id', id)
          .order('round_number', { ascending: true })
      ]);

      if (!gameResult.error && gameResult.data) {
        setGame(gameResult.data);
      }
      if (!roundsResult.error && roundsResult.data) {
        setRounds(roundsResult.data);
      }
      setLoading(false);
    };

    fetchGame();
  }, [user, id]);

  useEffect(() => {
    if (!isLoaded || rounds.length === 0) return;
    
    const round = rounds[selectedRound];
    if (!round) return;

    // Initialize Street View
    if (streetViewRef.current) {
      panoramaInstanceRef.current = new google.maps.StreetViewPanorama(streetViewRef.current, {
        position: { lat: round.actual_lat, lng: round.actual_lng },
        pov: { heading: 0, pitch: 0 },
        zoom: 0,
        addressControl: false,
        showRoadLabels: false,
        linksControl: false,
        panControl: false,
        enableCloseButton: false,
        fullscreenControl: false,
      });
    }

    // Initialize Map
    if (mapRef.current) {
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 20, lng: 0 },
        zoom: 2,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#6b7280' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
        ]
      });

      mapInstanceRef.current = map;

      // Actual location marker (green)
      new google.maps.Marker({
        position: { lat: round.actual_lat, lng: round.actual_lng },
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#22c55e',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        title: 'Actual Location'
      });

      // Guess location marker (red)
      if (round.guess_lat && round.guess_lng) {
        new google.maps.Marker({
          position: { lat: round.guess_lat, lng: round.guess_lng },
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#ef4444',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
          title: 'Your Guess'
        });

        // Draw line between guess and actual
        new google.maps.Polyline({
          path: [
            { lat: round.actual_lat, lng: round.actual_lng },
            { lat: round.guess_lat, lng: round.guess_lng }
          ],
          geodesic: true,
          strokeColor: '#22c55e',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          map
        });

        // Fit bounds to show both markers
        const bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: round.actual_lat, lng: round.actual_lng });
        bounds.extend({ lat: round.guess_lat, lng: round.guess_lng });
        map.fitBounds(bounds, 50);
      }
    }
  }, [isLoaded, rounds, selectedRound]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="font-display text-2xl font-bold mb-4">Sign in Required</h2>
          <p className="text-muted-foreground mb-6">Please sign in to view game details</p>
          <Link to="/login" className="game-button inline-block">Sign In</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!game || rounds.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="font-display text-2xl font-bold mb-4">Game not found</h2>
          <Link to="/history" className="game-button inline-block">Back to History</Link>
        </div>
      </div>
    );
  }

  const currentRound = rounds[selectedRound];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/history" className="p-2 bg-card rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-display text-2xl font-bold">Game Review</h1>
              <p className="text-muted-foreground text-sm">
                {format(new Date(game.created_at), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-primary/20 px-4 py-2 rounded-xl">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-xl">{game.total_score.toLocaleString()}</span>
          </div>
        </div>

        {/* Round Navigation */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedRound(Math.max(0, selectedRound - 1))}
            disabled={selectedRound === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex gap-2">
            {rounds.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedRound(idx)}
                className={`w-10 h-10 rounded-lg font-display font-bold transition-colors ${
                  idx === selectedRound
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card hover:bg-secondary'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedRound(Math.min(rounds.length - 1, selectedRound + 1))}
            disabled={selectedRound === rounds.length - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Round Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <Navigation className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Distance</p>
              <p className="font-display font-bold text-xl">
                {currentRound.distance_km 
                  ? currentRound.distance_km < 1 
                    ? `${Math.round(currentRound.distance_km * 1000)} m` 
                    : `${currentRound.distance_km.toFixed(1)} km`
                  : 'N/A'}
              </p>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="font-display font-bold text-xl text-primary">
                +{currentRound.score.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Street View and Map */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-display font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Actual Location
              </h3>
            </div>
            <div ref={streetViewRef} className="h-80" />
          </div>
          
          <div className="bg-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-semibold">Your Guess</h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-success" />
                  Actual
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-destructive" />
                  Guess
                </span>
              </div>
            </div>
            <div ref={mapRef} className="h-80" />
          </div>
        </div>
      </div>
    </div>
  );
}
