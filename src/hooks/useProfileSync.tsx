import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/lib/types';
import { getDefaultUserProfile, saveUserProfile, getUserProfile } from '@/lib/storage';
import { useAuth } from './useAuth';

export const useProfileSync = () => {
  const { user } = useAuth();

  // Fetch profile from database and save to local storage
  const fetchAndSyncProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      if (data) {
        // Map database fields to local profile structure
        const profile: UserProfile = {
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

        // Save to local storage
        saveUserProfile(profile);
        return profile;
      }

      return null;
    } catch (error) {
      console.error('Error syncing profile:', error);
      return null;
    }
  }, []);

  // Save local profile to database
  const syncProfileToDatabase = useCallback(async (profile: UserProfile, userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: profile.email || '',
          first_name: profile.firstName,
          language: profile.language || 'en',
          primary_goal: profile.primaryGoal,
          activity_level: profile.activityLevel,
          primary_nutrition_challenge: profile.primaryNutritionChallenge,
          daily_time_commitment: profile.dailyTimeCommitment,
          morning_reminder_time: profile.morningReminderTime,
          evening_reminder_time: profile.eveningReminderTime,
          midday_nudge_enabled: profile.middayNudgeEnabled,
          current_stage: profile.currentStage,
          current_level: profile.currentLevel,
          current_activity_goal_minutes: profile.currentActivityGoalMinutes,
          nutrition_questions_count: profile.nutritionQuestionsCount,
          total_points: profile.totalPoints,
          current_streak: profile.currentStreak,
          longest_streak: profile.longestStreak,
          total_checkins: profile.totalCheckins,
          total_activity_completions: profile.totalActivityCompletions,
          total_nutrition_habits_completed: profile.totalNutritionHabitsCompleted,
          total_perfect_days: profile.totalPerfectDays,
          last_checkin_date: profile.lastCheckinDate,
          progression_week: profile.progressionWeek,
          onboarding_completed: profile.onboardingCompleted,
          subscription_status: profile.subscriptionStatus,
          trial_start_date: profile.trialStartDate,
          subscription_end_date: profile.subscriptionEndDate,
          coach_conversations_count: profile.coachConversationsCount,
          active_library_habits: profile.activeLibraryHabits,
          weekly_summary_enabled: profile.weeklySummaryEnabled,
          streak_at_loss: profile.streakAtLoss,
          biggest_obstacle: profile.biggestObstacle,
          diet_preference: profile.dietPreference,
          fitness_confidence: profile.fitnessConfidence,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error syncing profile to database:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error syncing profile:', error);
      return false;
    }
  }, []);

  return {
    fetchAndSyncProfile,
    syncProfileToDatabase,
  };
};

// Re-export storage functions for convenience
export { getUserProfile, saveUserProfile, getDefaultUserProfile };
