-- Fix security definer view by recreating with security_invoker
DROP VIEW IF EXISTS public.leaderboard;
CREATE VIEW public.leaderboard 
WITH (security_invoker = true)
AS
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