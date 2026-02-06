-- 1. Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view completed games" ON public.games;
DROP POLICY IF EXISTS "Anyone can view rounds of completed games" ON public.game_rounds;

-- 2. Create new authenticated-only policies
CREATE POLICY "Authenticated users can view all profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view completed games"
  ON public.games FOR SELECT
  USING (status = 'completed' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view rounds of completed games"
  ON public.game_rounds FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = game_rounds.game_id 
      AND games.status = 'completed'
    )
  );