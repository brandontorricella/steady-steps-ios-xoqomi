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
import steadyLogo from '@/assets/steady-logo-new.png';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { fetchAndSyncProfile } = useProfileSync();
  const { setLanguage } = useLanguage();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [loading, setLoading] = useState(true);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const checkSubscriptionStatus = useCallback(async () => {
    if (!user) return null;
    
    setCheckingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Subscription check error:', error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Failed to check subscription:', err);
      return null;
    } finally {
      setCheckingSubscription(false);
    }
  }, [user]);

  useEffect(() => {
    const checkProfile = async () => {
      // If user is authenticated, try to fetch their profile from database
      if (user) {
        const profile = await fetchAndSyncProfile(user.id);
        
        // Sync language preference from profile
        if (profile?.language) {
          setLanguage(profile.language as 'en' | 'es');
          setStoredLanguage(profile.language as 'en' | 'es');
        }
        
        if (profile?.onboardingCompleted) {
          // Check subscription status to ensure payment was completed
          const subscriptionData = await checkSubscriptionStatus();
          
          // Allow access if subscribed, in trial, or has active status
          const hasValidSubscription = subscriptionData && (
            subscriptionData.subscribed || 
            subscriptionData.status === 'trial' || 
            subscriptionData.status === 'active' ||
            subscriptionData.status === 'trialing'
          );
          
          if (hasValidSubscription) {
            // Update local profile with subscription info
            const localProfile = getUserProfile();
            if (localProfile) {
              saveUserProfile({
                ...localProfile,
                subscriptionStatus: subscriptionData.status || 'trial',
              });
            }
            setShowOnboarding(false);
          } else {
            // User completed onboarding but doesn't have valid subscription
            // They need to complete payment - show onboarding at payment step
            setShowOnboarding(true);
          }
        }
      } else {
        // Check local storage for non-authenticated users
        const profile = getUserProfile();
        if (profile?.onboardingCompleted) {
          setShowOnboarding(false);
        }
      }
      setLoading(false);
    };

    if (!authLoading) {
      checkProfile();
    }
  }, [user, authLoading, fetchAndSyncProfile, checkSubscriptionStatus]);

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
