
-- Drop the overly permissive update policy
DROP POLICY "System can update post counts" ON public.community_posts;

-- No user-facing UPDATE policy needed since the triggers use SECURITY DEFINER functions
