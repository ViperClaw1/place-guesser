-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  total_games INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create games table
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_score INTEGER DEFAULT 0,
  rounds_played INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create game_rounds table for individual round data
CREATE TABLE public.game_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  round_number INTEGER NOT NULL,
  actual_lat DOUBLE PRECISION NOT NULL,
  actual_lng DOUBLE PRECISION NOT NULL,
  guess_lat DOUBLE PRECISION,
  guess_lng DOUBLE PRECISION,
  distance_km DOUBLE PRECISION,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rounds ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Games policies
CREATE POLICY "Users can view their own games" ON public.games
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own games" ON public.games
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own games" ON public.games
  FOR UPDATE USING (auth.uid() = user_id);

-- Game rounds policies
CREATE POLICY "Users can view rounds of their games" ON public.game_rounds
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.games 
      WHERE games.id = game_rounds.game_id 
      AND games.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert rounds to their games" ON public.game_rounds
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.games 
      WHERE games.id = game_rounds.game_id 
      AND games.user_id = auth.uid()
    )
  );

-- Leaderboard view (public, ordered by best score)
CREATE VIEW public.leaderboard AS
SELECT 
  p.id,
  p.username,
  p.avatar_url,
  p.total_games,
  p.total_score,
  p.best_score,
  RANK() OVER (ORDER BY p.best_score DESC) as rank
FROM public.profiles p
WHERE p.total_games > 0
ORDER BY p.best_score DESC;

-- Function to update profile stats after game completion
CREATE OR REPLACE FUNCTION public.update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status = 'in_progress' THEN
    UPDATE public.profiles
    SET 
      total_games = total_games + 1,
      total_score = total_score + NEW.total_score,
      best_score = GREATEST(best_score, NEW.total_score),
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update profile stats
CREATE TRIGGER on_game_completed
  AFTER UPDATE ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_stats();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'Player_' || substring(NEW.id::text, 1, 8)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();