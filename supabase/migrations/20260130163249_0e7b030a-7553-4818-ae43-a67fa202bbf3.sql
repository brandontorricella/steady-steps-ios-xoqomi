-- Add buddy matching opt-in field to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS buddy_match_opt_in boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_weekly_summary_date date,
ADD COLUMN IF NOT EXISTS not_behind_mode_active boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS not_behind_mode_activated_at timestamp with time zone;

-- Create exit_feedback table for subscription cancellation feedback
CREATE TABLE IF NOT EXISTS public.exit_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT exit_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Enable RLS on exit_feedback
ALTER TABLE public.exit_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: users can insert their own feedback
CREATE POLICY "Users can insert their own exit feedback"
ON public.exit_feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: users can view their own feedback
CREATE POLICY "Users can view their own exit feedback"
ON public.exit_feedback
FOR SELECT
USING (auth.uid() = user_id);

-- Add index for faster buddy matching queries
CREATE INDEX IF NOT EXISTS idx_profiles_buddy_match_opt_in ON public.profiles(buddy_match_opt_in) WHERE buddy_match_opt_in = true;

-- Add index for weekly summary check
CREATE INDEX IF NOT EXISTS idx_profiles_last_weekly_summary ON public.profiles(last_weekly_summary_date);