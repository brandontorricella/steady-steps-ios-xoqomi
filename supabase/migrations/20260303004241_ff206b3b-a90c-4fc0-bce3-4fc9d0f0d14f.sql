
-- Add grace day columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN grace_days_remaining integer NOT NULL DEFAULT 3,
  ADD COLUMN grace_days_last_reset date DEFAULT CURRENT_DATE,
  ADD COLUMN grace_days_used_dates text[] DEFAULT '{}'::text[];
