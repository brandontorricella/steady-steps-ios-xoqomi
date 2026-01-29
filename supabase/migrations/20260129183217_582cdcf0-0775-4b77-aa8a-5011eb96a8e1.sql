-- Add new onboarding personalization fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS biggest_obstacle text DEFAULT 'time',
ADD COLUMN IF NOT EXISTS diet_preference text DEFAULT 'no_preference',
ADD COLUMN IF NOT EXISTS fitness_confidence integer DEFAULT 3;

-- Add daily wellness tracking fields to daily_checkins
ALTER TABLE public.daily_checkins
ADD COLUMN IF NOT EXISTS stress_level integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS sleep_quality integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS energy_level integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS habit_completion text DEFAULT NULL;

-- Create index for faster daily check-in queries
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON public.daily_checkins(user_id, date DESC);