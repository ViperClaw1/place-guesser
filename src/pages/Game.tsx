import { useEffect } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useGame } from '@/hooks/useGame';
import { StreetView } from '@/components/game/StreetView';
import { GuessMap } from '@/components/game/GuessMap';
import { ScoreDisplay } from '@/components/game/ScoreDisplay';
import { GameControls } from '@/components/game/GameControls';
import { RoundResult } from '@/components/game/RoundResult';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Game() {
  const { isLoaded, error } = useGoogleMaps();
  const { gameState, startNewGame, setGuess, submitGuess, nextRound } = useGame();

  useEffect(() => {
    if (isLoaded && !gameState.currentLocation) {
      startNewGame();
    }
  }, [isLoaded, gameState.currentLocation, startNewGame]);

  if (error) {
    return (
      <div className="game-container flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-display font-bold text-destructive mb-4">
            Failed to load Google Maps
          </h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link to="/" className="game-button inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!gameState.currentLocation) {
    return (
      <div className="game-container flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-display">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <StreetView
        lat={gameState.currentLocation.lat}
        lng={gameState.currentLocation.lng}
        isLoaded={isLoaded}
      />

      <Link
        to="/"
        className="absolute top-6 right-6 z-10 p-3 bg-card/90 backdrop-blur-md rounded-xl hover:bg-card transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <ScoreDisplay
        currentRound={gameState.currentRound}
        totalRounds={gameState.totalRounds}
        totalScore={gameState.totalScore}
      />

      <GuessMap
        isLoaded={isLoaded}
        onGuess={(lat, lng) => setGuess({ lat, lng })}
        guessLocation={gameState.guessLocation}
        disabled={gameState.isRoundComplete}
      />

      {!gameState.isRoundComplete && (
        <GameControls
          hasGuess={!!gameState.guessLocation}
          onSubmit={submitGuess}
          disabled={gameState.isRoundComplete}
        />
      )}

      {gameState.isRoundComplete && gameState.roundResults.length > 0 && (
        <RoundResult
          roundNumber={gameState.currentRound}
          distance={gameState.roundResults[gameState.roundResults.length - 1].distance}
          score={gameState.roundResults[gameState.roundResults.length - 1].score}
          totalScore={gameState.totalScore}
          isLastRound={gameState.isGameComplete}
          onNextRound={nextRound}
          onNewGame={startNewGame}
        />
      )}
    </div>
  );
}
