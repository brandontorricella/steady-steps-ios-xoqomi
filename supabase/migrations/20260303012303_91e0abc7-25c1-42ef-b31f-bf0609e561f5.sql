
-- Cycle tracking settings table
CREATE TABLE public.cycle_tracking_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tracking_enabled BOOLEAN DEFAULT true,
  tracking_mode TEXT NOT NULL DEFAULT 'menstrual',
  average_cycle_length INTEGER DEFAULT 28,
  average_period_length INTEGER DEFAULT 5,
  last_period_start DATE,
  still_has_periods BOOLEAN,
  period_frequency TEXT,
  tracking_goals TEXT[] DEFAULT '{}',
  symptoms_to_track TEXT[] DEFAULT '{}',
  setup_completed BOOLEAN DEFAULT false,
  show_on_home_screen BOOLEAN DEFAULT true,
  include_in_exports BOOLEAN DEFAULT true,
  use_for_insights BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.cycle_tracking_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cycle settings" ON public.cycle_tracking_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cycle settings" ON public.cycle_tracking_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cycle settings" ON public.cycle_tracking_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cycle settings" ON public.cycle_tracking_settings FOR DELETE USING (auth.uid() = user_id);

-- Cycle daily logs table
CREATE TABLE public.cycle_daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  energy TEXT,
  mood TEXT,
  sleep TEXT,
  symptoms TEXT[] DEFAULT '{}',
  notes TEXT,
  cycle_day INTEGER,
  phase TEXT,
  flow TEXT,
  hot_flashes TEXT,
  night_sweats BOOLEAN DEFAULT false,
  is_bleeding BOOLEAN DEFAULT false,
  cramps TEXT,
  joint_pain TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.cycle_daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cycle logs" ON public.cycle_daily_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cycle logs" ON public.cycle_daily_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cycle logs" ON public.cycle_daily_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cycle logs" ON public.cycle_daily_logs FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_cycle_settings_updated_at
  BEFORE UPDATE ON public.cycle_tracking_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
