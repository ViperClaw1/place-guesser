import { Trophy, Target } from 'lucide-react';

interface ScoreDisplayProps {
  currentRound: number;
  totalRounds: number;
  totalScore: number;
}

export function ScoreDisplay({ currentRound, totalRounds, totalScore }: ScoreDisplayProps) {
  return (
    <div className="score-display">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <span className="font-display font-semibold">
            Round {currentRound}/{totalRounds}
          </span>
        </div>
        <div className="w-px h-6 bg-border" />
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-score-gold" />
          <span className="font-display font-bold text-lg">
            {totalScore.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
