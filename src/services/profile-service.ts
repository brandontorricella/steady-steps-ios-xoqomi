import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/lib/types';
import { getDefaultUserProfile, saveUserProfile } from '@/lib/storage';

// =====================================================
// PROFILE SERVICE - Handles all profile operations
// =====================================================

export interface ProfileResult {
  success: boolean;
  profile?: UserProfile | null;
  error?: string;
  needsOnboarding?: boolean;
}

/**
 * Fetch user profile from database
 * Creates a minimal profile if one doesn't exist (handles orphaned users)
 */
export async function fetchProfile(userId: string): Promise<ProfileResult> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Handle no profile found (PGRST116)
    if (error && error.code === 'PGRST116') {
      console.log('No profile found for user, creating minimal profile:', userId);
      const createResult = await createMinimalProfile(userId);
      return createResult;
    }

    if (error) {
      console.error('Error fetching profile:', error);
      return { success: false, error: error.message };
    }

    // Map database fields to local profile structure
    const profile = mapDatabaseToProfile(data);
    
    // Save to local storage for offline access
    saveUserProfile(profile);
    
    return { 
      success: true, 
      profile,
      needsOnboarding: !data.onboarding_completed
    };
  } catch (error) {
    console.error('Profile fetch failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Create a minimal profile for a user who has auth but no profile
 */
export async function createMinimalProfile(userId: string): Promise<ProfileResult> {
  try {
    // Get email from auth user
    const { data: authData } = await supabase.auth.getUser();
    const email = authData?.user?.email || '';

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        onboarding_completed: false,
        subscription_status: 'trial',
        current_streak: 0,
        longest_streak: 0,
        total_points: 0,
        current_stage: 'beginner',
        current_level: 1,
        language: 'en',
      })
      .select()
      .single();

    if (error) {
      // If profile was created by trigger in parallel, fetch it
      if (error.code === '23505') { // unique_violation
        return fetchProfile(userId);
      }
      console.error('Failed to create minimal profile:', error);
      return { success: false, error: error.message };
    }

    const profile = mapDatabaseToProfile(data);
    saveUserProfile(profile);

    return { 
      success: true, 
      profile,
      needsOnboarding: true
    };
  } catch (error) {
    console.error('Create minimal profile failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Update user profile in database
 */
export async function updateProfile(
  userId: string, 
  updates: Partial<UserProfile>
): Promise<ProfileResult> {
  try {
    const dbUpdates = mapProfileToDatabase(updates);
    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update profile:', error);
      return { success: false, error: error.message };
    }

    const profile = mapDatabaseToProfile(data);
    saveUserProfile(profile);

    return { success: true, profile };
  } catch (error) {
    console.error('Update profile failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Determine which onboarding step the user should be on
 */
export function determineOnboardingStep(profile: UserProfile): string {
  if (!profile.language) return 'language';
  if (!profile.firstName) return 'name';
  if (!profile.primaryGoal) return 'goal';
  if (!profile.activityLevel) return 'activity';
  if (!profile.primaryNutritionChallenge) return 'nutrition';
  if (!profile.dailyTimeCommitment) return 'time';
  // Terms and payment are handled separately
  return 'complete';
}

/**
 * Check if subscription is valid
 */
export function isSubscriptionValid(status?: string): boolean {
  return status === 'trial' || status === 'subscribed' || status === 'active' || status === 'trialing';
}

// =====================================================
// MAPPING FUNCTIONS
// =====================================================

interface DatabaseProfile {
  id: string;
  email: string;
  first_name: string | null;
  language: string | null;
  primary_goal: string | null;
  activity_level: string | null;
  primary_nutrition_challenge: string | null;
  daily_time_commitment: string | null;
  morning_reminder_time: string | null;
  evening_reminder_time: string | null;
  midday_nudge_enabled: boolean | null;
  current_stage: string | null;
  current_level: number | null;
  current_activity_goal_minutes: number | null;
  nutrition_questions_count: number | null;
  total_points: number | null;
  current_streak: number | null;
  longest_streak: number | null;
  total_checkins: number | null;
  total_activity_completions: number | null;
  total_nutrition_habits_completed: number | null;
  total_perfect_days: number | null;
  last_checkin_date: string | null;
  progression_week: number | null;
  onboarding_completed: boolean | null;
  subscription_status: string | null;
  trial_start_date: string | null;
  subscription_end_date: string | null;
  coach_conversations_count: number | null;
  active_library_habits: string[] | null;
  weekly_summary_enabled: boolean | null;
  streak_at_loss: number | null;
  biggest_obstacle: string | null;
  diet_preference: string | null;
  fitness_confidence: number | null;
  created_at: string | null;
  [key: string]: unknown;
}

function mapDatabaseToProfile(data: DatabaseProfile): UserProfile {
  return {
    firstName: data.first_name || '',
    language: (data.language as 'en' | 'es') || 'en',
    email: data.email,
    primaryGoal: (data.primary_goal as UserProfile['primaryGoal']) || 'habits',
    activityLevel: (data.activity_level as UserProfile['activityLevel']) || 'sedentary',
    primaryNutritionChallenge: (data.primary_nutrition_challenge as UserProfile['primaryNutritionChallenge']) || 'unsure',
    dailyTimeCommitment: (data.daily_time_commitment as UserProfile['dailyTimeCommitment']) || '5_to_10',
    morningReminderTime: data.morning_reminder_time || '08:00',
    eveningReminderTime: data.evening_reminder_time || '19:00',
    middayNudgeEnabled: data.midday_nudge_enabled ?? true,
    accountCreatedDate: data.created_at || new Date().toISOString(),
    currentStage: (data.current_stage as UserProfile['currentStage']) || 'beginner',
    currentLevel: data.current_level || 1,
    currentActivityGoalMinutes: data.current_activity_goal_minutes || 5,
    nutritionQuestionsCount: data.nutrition_questions_count || 3,
    totalPoints: data.total_points || 0,
    currentStreak: data.current_streak || 0,
    longestStreak: data.longest_streak || 0,
    totalCheckins: data.total_checkins || 0,
    totalActivityCompletions: data.total_activity_completions || 0,
    totalNutritionHabitsCompleted: data.total_nutrition_habits_completed || 0,
    totalPerfectDays: data.total_perfect_days || 0,
    lastCheckinDate: data.last_checkin_date || null,
    progressionWeek: data.progression_week || 1,
    onboardingCompleted: data.onboarding_completed ?? false,
    subscriptionStatus: (data.subscription_status as UserProfile['subscriptionStatus']) || 'trial',
    trialStartDate: data.trial_start_date || undefined,
    subscriptionEndDate: data.subscription_end_date || undefined,
    coachConversationsCount: data.coach_conversations_count || 0,
    activeLibraryHabits: data.active_library_habits || [],
    weeklySummaryEnabled: data.weekly_summary_enabled ?? true,
    streakAtLoss: data.streak_at_loss || 0,
    biggestObstacle: (data.biggest_obstacle as UserProfile['biggestObstacle']) || 'time',
    dietPreference: (data.diet_preference as UserProfile['dietPreference']) || 'no_preference',
    fitnessConfidence: data.fitness_confidence || 3,
  };
}

function mapProfileToDatabase(profile: Partial<UserProfile>): Record<string, unknown> {
  const mapping: Record<string, unknown> = {};
  
  if (profile.firstName !== undefined) mapping.first_name = profile.firstName;
  if (profile.language !== undefined) mapping.language = profile.language;
  if (profile.email !== undefined) mapping.email = profile.email;
  if (profile.primaryGoal !== undefined) mapping.primary_goal = profile.primaryGoal;
  if (profile.activityLevel !== undefined) mapping.activity_level = profile.activityLevel;
  if (profile.primaryNutritionChallenge !== undefined) mapping.primary_nutrition_challenge = profile.primaryNutritionChallenge;
  if (profile.dailyTimeCommitment !== undefined) mapping.daily_time_commitment = profile.dailyTimeCommitment;
  if (profile.morningReminderTime !== undefined) mapping.morning_reminder_time = profile.morningReminderTime;
  if (profile.eveningReminderTime !== undefined) mapping.evening_reminder_time = profile.eveningReminderTime;
  if (profile.middayNudgeEnabled !== undefined) mapping.midday_nudge_enabled = profile.middayNudgeEnabled;
  if (profile.currentStage !== undefined) mapping.current_stage = profile.currentStage;
  if (profile.currentLevel !== undefined) mapping.current_level = profile.currentLevel;
  if (profile.currentActivityGoalMinutes !== undefined) mapping.current_activity_goal_minutes = profile.currentActivityGoalMinutes;
  if (profile.nutritionQuestionsCount !== undefined) mapping.nutrition_questions_count = profile.nutritionQuestionsCount;
  if (profile.totalPoints !== undefined) mapping.total_points = profile.totalPoints;
  if (profile.currentStreak !== undefined) mapping.current_streak = profile.currentStreak;
  if (profile.longestStreak !== undefined) mapping.longest_streak = profile.longestStreak;
  if (profile.totalCheckins !== undefined) mapping.total_checkins = profile.totalCheckins;
  if (profile.totalActivityCompletions !== undefined) mapping.total_activity_completions = profile.totalActivityCompletions;
  if (profile.totalNutritionHabitsCompleted !== undefined) mapping.total_nutrition_habits_completed = profile.totalNutritionHabitsCompleted;
  if (profile.totalPerfectDays !== undefined) mapping.total_perfect_days = profile.totalPerfectDays;
  if (profile.lastCheckinDate !== undefined) mapping.last_checkin_date = profile.lastCheckinDate;
  if (profile.progressionWeek !== undefined) mapping.progression_week = profile.progressionWeek;
  if (profile.onboardingCompleted !== undefined) mapping.onboarding_completed = profile.onboardingCompleted;
  if (profile.subscriptionStatus !== undefined) mapping.subscription_status = profile.subscriptionStatus;
  if (profile.trialStartDate !== undefined) mapping.trial_start_date = profile.trialStartDate;
  if (profile.subscriptionEndDate !== undefined) mapping.subscription_end_date = profile.subscriptionEndDate;
  if (profile.coachConversationsCount !== undefined) mapping.coach_conversations_count = profile.coachConversationsCount;
  if (profile.activeLibraryHabits !== undefined) mapping.active_library_habits = profile.activeLibraryHabits;
  if (profile.weeklySummaryEnabled !== undefined) mapping.weekly_summary_enabled = profile.weeklySummaryEnabled;
  if (profile.streakAtLoss !== undefined) mapping.streak_at_loss = profile.streakAtLoss;
  if (profile.biggestObstacle !== undefined) mapping.biggest_obstacle = profile.biggestObstacle;
  if (profile.dietPreference !== undefined) mapping.diet_preference = profile.dietPreference;
  if (profile.fitnessConfidence !== undefined) mapping.fitness_confidence = profile.fitnessConfidence;
  
  return mapping;
}
