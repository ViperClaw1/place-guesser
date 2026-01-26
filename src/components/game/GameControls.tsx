import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface GameControlsProps {
  hasGuess: boolean;
  onSubmit: () => void;
  disabled: boolean;
}

export function GameControls({ hasGuess, onSubmit, disabled }: GameControlsProps) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
      <Button
        onClick={onSubmit}
        disabled={!hasGuess || disabled}
        className="game-button flex items-center gap-2 text-lg"
      >
        <Send className="w-5 h-5" />
        Confirm Guess
      </Button>
    </div>
  );
}
