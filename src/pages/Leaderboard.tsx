import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, User, ArrowLeft } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  username: string;
  avatar_url: string | null;
  total_games: number;
  total_score: number;
  best_score: number;
  rank: number;
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .limit(100);

      if (!error && data) {
        setEntries(data as LeaderboardEntry[]);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return 'bg-secondary';
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return <Trophy className="w-4 h-4" />;
    return <span className="text-sm font-bold">{rank}</span>;
  };

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
            <h1 className="font-display text-3xl font-bold text-gradient">Leaderboard</h1>
            <p className="text-muted-foreground">Top explorers from around the world</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold mb-2">No scores yet</h2>
            <p className="text-muted-foreground mb-6">Be the first to complete a game!</p>
            <Link to="/game" className="game-button inline-block">
              Start Playing
            </Link>
          </div>
        ) : (
          <div className="bg-card rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 border-b border-border text-sm font-medium text-muted-foreground">
              <span className="w-10">Rank</span>
              <span>Player</span>
              <span className="text-right">Games</span>
              <span className="text-right w-24">Best Score</span>
            </div>
            
            <div className="divide-y divide-border">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 items-center hover:bg-secondary/30 transition-colors"
                >
                  <div className={`leaderboard-rank ${getRankStyle(entry.rank)}`}>
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                      {entry.avatar_url ? (
                        <img
                          src={entry.avatar_url}
                          alt={entry.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <span className="font-medium">{entry.username}</span>
                  </div>
                  
                  <span className="text-muted-foreground text-right">
                    {entry.total_games}
                  </span>
                  
                  <span className="font-display font-bold text-primary text-right w-24">
                    {entry.best_score.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
