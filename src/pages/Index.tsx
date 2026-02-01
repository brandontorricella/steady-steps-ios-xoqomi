import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { SplashScreen } from '@/components/SplashScreen';
import { getUserProfile, saveUserProfile } from '@/lib/storage';
import { useAuth } from '@/hooks/useAuth';
import { useProfileSync } from '@/hooks/useProfileSync';
import { useLanguage, setStoredLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { checkSubscriptionStatus, isValidSubscription } from '@/services/subscription-service';
import steadyLogo from '@/assets/steady-logo-new.png';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { initializeProfile } = useProfileSync();
  const { setLanguage } = useLanguage();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [loading, setLoading] = useState(true);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        // Check local storage for non-authenticated users
        const profile = getUserProfile();
        if (profile?.onboardingCompleted) {
          setShowOnboarding(false);
        }
        setLoading(false);
        return;
      }

      try {
        // Use the new initializeProfile that handles missing profiles
        const result = await initializeProfile(user.id);
        
        if (result.error) {
          console.error('Profile initialization error:', result.error);
          // On error, show onboarding to allow profile creation
          setShowOnboarding(true);
          setLoading(false);
          return;
        }

        // Sync language preference from profile
        if (result.profile?.language) {
          setLanguage(result.profile.language as 'en' | 'es');
          setStoredLanguage(result.profile.language as 'en' | 'es');
        }
        
        // If onboarding not completed, show onboarding
        if (result.needsOnboarding) {
          setShowOnboarding(true);
          setLoading(false);
          return;
        }

        // Check subscription status from database (Apple IAP)
        setCheckingSubscription(true);
        const subscriptionResult = await checkSubscriptionStatus();
        setCheckingSubscription(false);
        
        if (subscriptionResult.success && isValidSubscription(subscriptionResult.data)) {
          // Update local profile with subscription info
          const localProfile = getUserProfile();
          if (localProfile && subscriptionResult.data) {
            saveUserProfile({
              ...localProfile,
              subscriptionStatus: subscriptionResult.data.status as 'trial' | 'active' | 'cancelled' | 'expired',
            });
          }
          setShowOnboarding(false);
        } else {
          // User completed onboarding but doesn't have valid subscription
          // They need to complete payment - show onboarding at payment step
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        setShowOnboarding(true);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkProfile();
    }
  }, [user, authLoading, initializeProfile, setLanguage]);

  // Handle splash screen completion
  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Show splash screen first
  if (showSplash) {
    return (
      <AnimatePresence>
        <motion.div
          key="splash"
          className="fixed inset-0 bg-white flex items-center justify-center z-50"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.img
            src={steadyLogo}
            alt="SteadySteps"
            className="w-32 h-32 object-contain"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            onAnimationComplete={() => {
              setTimeout(handleSplashComplete, 1500);
            }}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (loading || authLoading || checkingSubscription) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-soft">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          {checkingSubscription && (
            <p className="text-muted-foreground text-sm">Verifying subscription...</p>
          )}
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingContainer onComplete={() => setShowOnboarding(false)} />;
  }

  return <Dashboard />;
};

export default Index;
