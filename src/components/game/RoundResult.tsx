import { MapPin, Navigation, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RoundResultProps {
  roundNumber: number;
  distance: number;
  score: number;
  totalScore: number;
  isLastRound: boolean;
  onNextRound: () => void;
  onNewGame: () => void;
}

export function RoundResult({
  roundNumber,
  distance,
  score,
  totalScore,
  isLastRound,
  onNextRound,
  onNewGame,
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

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-20">
      <div className="result-card text-center max-w-md">
        <h2 className="font-display text-2xl font-bold mb-2">
          {isLastRound ? 'Game Complete!' : `Round ${roundNumber} Complete`}
        </h2>
        
        <p className="text-xl mb-6">{getScoreMessage()}</p>

        <div className="grid grid-cols-2 gap-6 mb-8">
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
          <div className="bg-primary/10 rounded-xl p-6 mb-8">
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
