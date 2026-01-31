import { useCallback } from 'react';
import { UserProfile } from '@/lib/types';
import { saveUserProfile, getUserProfile, getDefaultUserProfile } from '@/lib/storage';
import { 
  fetchProfile, 
  updateProfile, 
  createMinimalProfile,
  determineOnboardingStep,
  isSubscriptionValid 
} from '@/services/profile-service';

// =====================================================
// PROFILE SYNC HOOK
// Handles syncing between local storage and database
// =====================================================

export interface ProfileSyncResult {
  profile: UserProfile | null;
  needsOnboarding: boolean;
  onboardingStep: string;
  hasValidSubscription: boolean;
  error?: string;
}

export const useProfileSync = () => {
  /**
   * Fetch profile from database and sync to local storage
   * Handles missing profiles by creating them
   */
  const fetchAndSyncProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    const result = await fetchProfile(userId);
    
    if (!result.success) {
      console.error('Failed to fetch profile:', result.error);
      return null;
    }
    
    return result.profile || null;
  }, []);

  /**
   * Full profile initialization with onboarding state
   */
  const initializeProfile = useCallback(async (userId: string): Promise<ProfileSyncResult> => {
    const result = await fetchProfile(userId);
    
    if (!result.success) {
      return {
        profile: null,
        needsOnboarding: true,
        onboardingStep: 'language',
        hasValidSubscription: false,
        error: result.error
      };
    }

    const profile = result.profile;
    
    if (!profile) {
      return {
        profile: null,
        needsOnboarding: true,
        onboardingStep: 'language',
        hasValidSubscription: false
      };
    }

    const onboardingStep = determineOnboardingStep(profile);
    const needsOnboarding = !profile.onboardingCompleted || onboardingStep !== 'complete';
    const hasValidSubscription = isSubscriptionValid(profile.subscriptionStatus);

    return {
      profile,
      needsOnboarding,
      onboardingStep,
      hasValidSubscription
    };
  }, []);

  /**
   * Save local profile to database
   */
  const syncProfileToDatabase = useCallback(async (
    profile: UserProfile, 
    userId: string
  ): Promise<boolean> => {
    const result = await updateProfile(userId, profile);
    return result.success;
  }, []);

  /**
   * Update specific profile fields
   */
  const updateProfileFields = useCallback(async (
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<boolean> => {
    const result = await updateProfile(userId, updates);
    return result.success;
  }, []);

  return {
    fetchAndSyncProfile,
    initializeProfile,
    syncProfileToDatabase,
    updateProfileFields,
  };
};

// Re-export storage functions for convenience
export { getUserProfile, saveUserProfile, getDefaultUserProfile };
