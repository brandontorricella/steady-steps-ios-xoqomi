
-- Add bad day tracking
ALTER TABLE public.daily_checkins
  ADD COLUMN is_bad_day boolean DEFAULT false;

ALTER TABLE public.profiles
  ADD COLUMN bad_days_count integer NOT NULL DEFAULT 0;
