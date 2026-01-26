import { MapPin, Navigation, Trophy, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResultMap } from './ResultMap';
import { LocationInfo } from '@/lib/geocoding';

interface RoundResultProps {
  roundNumber: number;
  distance: number;
  score: number;
  totalScore: number;
  isLastRound: boolean;
  onNextRound: () => void;
  onNewGame: () => void;
  isLoaded: boolean;
  actualLocation: { lat: number; lng: number };
  guessLocation: { lat: number; lng: number };
  locationInfo: LocationInfo | null;
}

export function RoundResult({
  roundNumber,
  distance,
  score,
  totalScore,
  isLastRound,
  onNextRound,
  onNewGame,
  isLoaded,
  actualLocation,
  guessLocation,
  locationInfo,
}: RoundResultProps) {
  const getScoreColor = () => {
    if (score >= 4000) return 'text-score-gold';
    if (score >= 2500) return 'text-primary';
    if (score >= 1000) return 'text-score-bronze';
    return 'text-destructive';
  };

  const getScoreMessage = () => {
    if (score >= 4500) return 'Perfect! 🎯';
    if (score >= 4000) return 'Excellent! 🌟';
    if (score >= 3000) return 'Great job! 👍';
    if (score >= 2000) return 'Good guess! 👏';
    if (score >= 1000) return 'Not bad! 🤔';
    return 'Keep trying! 💪';
  };

  const formatLocationName = () => {
    if (!locationInfo) return null;
    const parts: string[] = [];
    if (locationInfo.city) parts.push(locationInfo.city);
    if (locationInfo.country) parts.push(locationInfo.country);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  const locationName = formatLocationName();

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-20 p-4 overflow-y-auto">
      <div className="result-card text-center max-w-lg w-full my-4">
        <h2 className="font-display text-2xl font-bold mb-2">
          {isLastRound ? 'Game Complete!' : `Round ${roundNumber} Complete`}
        </h2>
        
        <p className="text-xl mb-4">{getScoreMessage()}</p>

        {/* Location Info */}
        {locationName && (
          <div className="bg-score-gold/10 border border-score-gold/20 rounded-xl p-3 mb-4 flex items-center justify-center gap-2">
            <Globe className="w-5 h-5 text-score-gold" />
            <span className="font-medium text-score-gold">{locationName}</span>
          </div>
        )}

        {/* Result Map showing both pins */}
        <div className="mb-4">
          <ResultMap
            isLoaded={isLoaded}
            actualLocation={actualLocation}
            guessLocation={guessLocation}
          />
          <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-score-gold" />
              <span>Actual location</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span>Your guess</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-secondary/50 rounded-xl p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Navigation className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Distance</span>
            </div>
            <p className="font-display text-2xl font-bold">
              {distance < 1 
                ? `${Math.round(distance * 1000)} m` 
                : `${distance.toFixed(1)} km`}
            </p>
          </div>

          <div className="bg-secondary/50 rounded-xl p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Score</span>
            </div>
            <p className={`font-display text-2xl font-bold ${getScoreColor()}`}>
              +{score.toLocaleString()}
            </p>
          </div>
        </div>

        {isLastRound && (
          <div className="bg-primary/10 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-6 h-6 text-score-gold" />
              <span className="text-muted-foreground">Final Score</span>
            </div>
            <p className="font-display text-4xl font-bold text-gradient">
              {totalScore.toLocaleString()}
            </p>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          {isLastRound ? (
            <Button onClick={onNewGame} className="game-button">
              Play Again
            </Button>
          ) : (
            <Button onClick={onNextRound} className="game-button">
              Next Round
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
