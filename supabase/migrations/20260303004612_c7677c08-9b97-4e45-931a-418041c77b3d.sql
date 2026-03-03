
-- Add "Why I'm Doing This" fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN why_text text DEFAULT NULL,
  ADD COLUMN why_created_at timestamp with time zone DEFAULT NULL;
