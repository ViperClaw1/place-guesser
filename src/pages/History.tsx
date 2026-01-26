import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { ArrowLeft, Trophy, Calendar, Target, ChevronRight } from 'lucide-react';

interface GameWithRounds {
  id: string;
  total_score: number;
  rounds_played: number;
  status: string;
  created_at: string;
  completed_at: string | null;
}

export default function History() {
  const { user } = useAuth();
  const [games, setGames] = useState<GameWithRounds[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchGames = async () => {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setGames(data);
      }
      setLoading(false);
    };

    fetchGames();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="font-display text-2xl font-bold mb-4">Sign in Required</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to view your game history
          </p>
          <Link to="/login" className="game-button inline-block">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/"
            className="p-2 bg-card rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display text-3xl font-bold text-gradient">Game History</h1>
            <p className="text-muted-foreground">Review your past adventures</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold mb-2">No games yet</h2>
            <p className="text-muted-foreground mb-6">Start exploring the world!</p>
            <Link to="/game" className="game-button inline-block">
              Play Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {games.map((game) => (
              <Link
                key={game.id}
                to={`/history/${game.id}`}
                className="block bg-card rounded-xl p-6 hover:bg-card/80 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(game.created_at), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-display font-bold text-xl text-primary">
                          {game.total_score.toLocaleString()} pts
                        </span>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Target className="w-4 h-4" />
                          {game.rounds_played} rounds
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
