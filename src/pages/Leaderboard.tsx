import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Trophy, User, ArrowLeft, ChevronDown, ChevronUp, MapPin, Navigation, Calendar, Eye, LogIn } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  total_games: number;
  total_score: number;
  best_score: number;
  rank: number;
}

interface GameSession {
  id: string;
  total_score: number;
  rounds_played: number;
  created_at: string;
  rounds: GameRound[];
}

interface GameRound {
  id: string;
  round_number: number;
  actual_city: string | null;
  actual_country: string | null;
  guess_city: string | null;
  guess_country: string | null;
  distance_km: number | null;
  score: number;
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userGames, setUserGames] = useState<Record<string, GameSession[]>>({});
  const [loadingGames, setLoadingGames] = useState<string | null>(null);

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

  const fetchUserGames = async (userId: string) => {
    if (userGames[userId]) return; // Already loaded

    setLoadingGames(userId);
    
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('id, total_score, rounds_played, created_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!gamesError && games && games.length > 0) {
      const gameIds = games.map(g => g.id);
      
      const { data: rounds, error: roundsError } = await supabase
        .from('game_rounds')
        .select('id, game_id, round_number, actual_city, actual_country, guess_city, guess_country, distance_km, score')
        .in('game_id', gameIds)
        .order('round_number', { ascending: true });

      if (!roundsError && rounds) {
        const gamesWithRounds: GameSession[] = games.map(game => ({
          ...game,
          rounds: rounds.filter(r => r.game_id === game.id) as GameRound[]
        }));

        setUserGames(prev => ({ ...prev, [userId]: gamesWithRounds }));
      }
    } else {
      setUserGames(prev => ({ ...prev, [userId]: [] }));
    }

    setLoadingGames(null);
  };

  const toggleExpand = async (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
      await fetchUserGames(userId);
    }
  };

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

  const formatLocation = (city: string | null, country: string | null) => {
    const parts: string[] = [];
    if (city) parts.push(city);
    if (country) parts.push(country);
    return parts.length > 0 ? parts.join(', ') : 'Unknown';
  };

  const formatDistance = (km: number | null) => {
    if (km === null) return 'N/A';
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
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

        {authLoading || loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !user ? (
          <div className="text-center py-20 bg-card rounded-2xl">
            <LogIn className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold mb-2">Sign in required</h2>
            <p className="text-muted-foreground mb-6">Please sign in to view the leaderboard</p>
            <Link to="/login" className="game-button inline-block">
              Sign In
            </Link>
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
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 p-4 border-b border-border text-sm font-medium text-muted-foreground">
              <span className="w-10">Rank</span>
              <span>Player</span>
              <span className="text-right">Games</span>
              <span className="text-right w-24">Best Score</span>
              <span className="w-10"></span>
            </div>
            
            <div className="divide-y divide-border">
              {entries.map((entry) => (
                <div key={entry.id}>
                  <div
                    onClick={() => toggleExpand(entry.user_id)}
                    className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 p-4 items-center hover:bg-secondary/30 transition-colors cursor-pointer"
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

                    <div className="w-10 flex justify-center">
                      {expandedUser === entry.user_id ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Games Section */}
                  {expandedUser === entry.user_id && (
                    <div className="bg-secondary/20 px-4 pb-4">
                      {loadingGames === entry.user_id ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : userGames[entry.user_id]?.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No completed games yet
                        </div>
                      ) : (
                        <div className="space-y-4 pt-2">
                          <h4 className="font-display font-semibold text-sm text-muted-foreground">
                            Recent Games
                          </h4>
                          {userGames[entry.user_id]?.map((game) => (
                            <div key={game.id} className="bg-card rounded-xl p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="w-4 h-4" />
                                  {format(new Date(game.created_at), 'MMM d, yyyy')}
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-display font-bold text-primary">
                                    {game.total_score.toLocaleString()} pts
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/game/${game.id}?from=leaderboard`);
                                    }}
                                    className="text-xs"
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                {game.rounds.map((round) => (
                                  <div
                                    key={round.id}
                                    className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-3 items-center text-sm bg-secondary/50 rounded-lg p-2"
                                  >
                                    <span className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center text-xs font-bold">
                                      {round.round_number}
                                    </span>
                                    <div className="min-w-0">
                                      <div className="text-xs text-muted-foreground">Actual</div>
                                      <div className="font-medium truncate text-score-gold">
                                        {formatLocation(round.actual_city, round.actual_country)}
                                      </div>
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-xs text-muted-foreground">Guess</div>
                                      <div className="font-medium truncate">
                                        {formatLocation(round.guess_city, round.guess_country)}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                                        <Navigation className="w-3 h-3" />
                                      </div>
                                      <div className="font-medium">{formatDistance(round.distance_km)}</div>
                                    </div>
                                    <div className="text-right w-16">
                                      <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                                        <MapPin className="w-3 h-3" />
                                      </div>
                                      <div className="font-display font-bold text-primary">
                                        +{round.score}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}