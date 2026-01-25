-- Create profiles table for user data
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    primary_goal TEXT,
    activity_level TEXT,
    primary_nutrition_challenge TEXT,
    daily_time_commitment TEXT,
    morning_reminder_time TEXT DEFAULT '08:00',
    evening_reminder_time TEXT DEFAULT '19:00',
    midday_nudge_enabled BOOLEAN DEFAULT true,
    current_stage TEXT DEFAULT 'beginner',
    current_level INTEGER DEFAULT 1,
    current_activity_goal_minutes INTEGER DEFAULT 5,
    nutrition_questions_count INTEGER DEFAULT 3,
    total_points INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_checkins INTEGER DEFAULT 0,
    total_activity_completions INTEGER DEFAULT 0,
    total_nutrition_habits_completed INTEGER DEFAULT 0,
    total_perfect_days INTEGER DEFAULT 0,
    last_checkin_date DATE,
    progression_week INTEGER DEFAULT 1,
    onboarding_completed BOOLEAN DEFAULT false,
    trial_start_date TIMESTAMP WITH TIME ZONE,
    subscription_status TEXT DEFAULT 'trial',
    subscription_product_id TEXT,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    coach_conversations_count INTEGER DEFAULT 0,
    active_library_habits TEXT[] DEFAULT '{}',
    weekly_summary_enabled BOOLEAN DEFAULT true,
    streak_at_loss INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Daily checkins table
CREATE TABLE public.daily_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    checkin_completed BOOLEAN DEFAULT false,
    activity_completed BOOLEAN DEFAULT false,
    nutrition_responses JSONB DEFAULT '[]',
    mood TEXT,
    library_habits_completed TEXT[] DEFAULT '{}',
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, date)
);

ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checkins" ON public.daily_checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checkins" ON public.daily_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checkins" ON public.daily_checkins FOR UPDATE USING (auth.uid() = user_id);

-- Badges earned table
CREATE TABLE public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Coach conversations table
CREATE TABLE public.coach_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    messages JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.coach_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" ON public.coach_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON public.coach_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.coach_conversations FOR UPDATE USING (auth.uid() = user_id);

-- Buddy relationships table
CREATE TABLE public.buddy_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    buddy_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, buddy_id)
);

ALTER TABLE public.buddy_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own buddy connections" ON public.buddy_connections FOR SELECT 
    USING (auth.uid() = user_id OR auth.uid() = buddy_id);
CREATE POLICY "Users can insert buddy connections" ON public.buddy_connections FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update buddy connections" ON public.buddy_connections FOR UPDATE 
    USING (auth.uid() = user_id OR auth.uid() = buddy_id);

-- Referrals tracking table
CREATE TABLE public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referred_email TEXT NOT NULL,
    referred_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending',
    completed_first_week BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Users can insert referrals" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);
CREATE POLICY "Users can update referrals" ON public.referrals FOR UPDATE USING (auth.uid() = referrer_id);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coach_conversations_updated_at
    BEFORE UPDATE ON public.coach_conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();