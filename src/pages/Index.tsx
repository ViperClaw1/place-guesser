import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Globe, Play, Trophy, History, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function Index() {
  const {
    user,
    loading,
    signOut
  } = useAuth();
  return <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display text-xl font-bold">GeoExplorer</span>
          </div>
          
          <nav className="flex items-center gap-2">
            <Link to="/leaderboard" className="nav-link flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Link>
            {user && <Link to="/history" className="nav-link flex items-center gap-2">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </Link>}
            {loading ? null : user ? <Button variant="ghost" onClick={signOut} className="nav-link flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button> : <Link to="/login" className="nav-link flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Link>}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-2xl">
          <div className="w-24 h-24 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-8 glow-primary">
            <Globe className="w-12 h-12 text-primary" />
          </div>
          
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
            <span className="text-gradient">Explore the World</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto">
            Drop into a random Street View location and guess where you are. Test your geography knowledge!
          </p>

          <div className="flex-col items-center justify-center gap-[16px] flex sm:flex-row">
            <Link to="/game" className="game-button inline-flex items-center justify-center gap-2 text-lg my-[5px] mx-[5px] bg-secondary px-[16px] py-[10px]">
              <Play className="w-5 h-5" />
              Start Playing
            </Link>
            {!user && !loading && <Link to="/signup" className="rounded-lg font-semibold border border-border hover:bg-secondary transition-colors py-[12px] px-[24px]">
                Create Account
              </Link>}
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="font-display text-3xl font-bold text-primary">5</p>
              <p className="text-sm text-muted-foreground">Rounds</p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-primary">25K</p>
              <p className="text-sm text-muted-foreground">Max Score</p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-primary">∞</p>
              <p className="text-sm text-muted-foreground">Fun</p>
            </div>
          </div>
        </div>
      </main>
    </div>;
}