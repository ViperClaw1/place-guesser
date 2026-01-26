-- Add columns to store location names in game_rounds
ALTER TABLE public.game_rounds 
ADD COLUMN actual_city text,
ADD COLUMN actual_country text,
ADD COLUMN guess_city text,
ADD COLUMN guess_country text;

-- Update leaderboard view to include user_id for linking
DROP VIEW IF EXISTS public.leaderboard;
CREATE VIEW public.leaderboard AS
SELECT 
  p.id,
  p.user_id,
  p.username,
  p.avatar_url,
  p.total_games,
  p.total_score,
  p.best_score,
  RANK() OVER (ORDER BY p.best_score DESC NULLS LAST) as rank
FROM public.profiles p
WHERE p.total_games > 0
ORDER BY p.best_score DESC NULLS LAST;

-- Allow anyone to view completed games (for leaderboard game details)
CREATE POLICY "Anyone can view completed games"
ON public.games
FOR SELECT
USING (status = 'completed');

-- Allow anyone to view rounds of completed games
CREATE POLICY "Anyone can view rounds of completed games"
ON public.game_rounds
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM games 
    WHERE games.id = game_rounds.game_id 
    AND games.status = 'completed'
  )
);