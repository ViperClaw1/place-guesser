-- Fix function search paths and security definer view

-- Recreate view with security invoker
DROP VIEW IF EXISTS public.leaderboard;
CREATE VIEW public.leaderboard 
WITH (security_invoker = on) AS
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

-- Recreate functions with search_path
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'Player_' || substring(NEW.id::text, 1, 8)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;