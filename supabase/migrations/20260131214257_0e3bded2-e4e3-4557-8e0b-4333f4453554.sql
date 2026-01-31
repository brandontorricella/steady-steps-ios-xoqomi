-- =====================================================
-- PART 1: AUTO-CREATE PROFILE TRIGGER FOR NEW AUTH USERS
-- =====================================================

-- Function to automatically create a profile when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    created_at,
    onboarding_completed,
    subscription_status,
    current_streak,
    longest_streak,
    total_points,
    current_stage,
    current_level,
    language
  )
  VALUES (
    NEW.id,
    NEW.email,
    pg_catalog.now(),
    false,
    'trial',
    0,
    0,
    0,
    'beginner',
    1,
    'en'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, ignore
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail auth
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public;

-- Create trigger for auto profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- PART 2: DATABASE INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON public.profiles(onboarding_completed);

-- Indexes for daily_checkins table
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_id ON public.daily_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_date ON public.daily_checkins(date);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_created_at ON public.daily_checkins(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON public.daily_checkins(user_id, date);

-- Indexes for user_badges table
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges(badge_id);

-- Indexes for buddy_connections table
CREATE INDEX IF NOT EXISTS idx_buddy_connections_user_id ON public.buddy_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_buddy_connections_buddy_id ON public.buddy_connections(buddy_id);
CREATE INDEX IF NOT EXISTS idx_buddy_connections_status ON public.buddy_connections(status);

-- Indexes for coach_conversations table
CREATE INDEX IF NOT EXISTS idx_coach_conversations_user_id ON public.coach_conversations(user_id);

-- Indexes for referrals table
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON public.referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

-- Indexes for exit_feedback table
CREATE INDEX IF NOT EXISTS idx_exit_feedback_user_id ON public.exit_feedback(user_id);

-- =====================================================
-- PART 3: CREATE PROFILES FOR ORPHANED AUTH USERS
-- =====================================================

-- Insert profiles for any auth users that don't have one
INSERT INTO public.profiles (
  id,
  email,
  created_at,
  onboarding_completed,
  subscription_status,
  current_streak,
  longest_streak,
  total_points,
  current_stage,
  current_level,
  language
)
SELECT 
  au.id,
  au.email,
  au.created_at,
  false,
  'trial',
  0,
  0,
  0,
  'beginner',
  1,
  'en'
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;