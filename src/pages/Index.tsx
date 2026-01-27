import { useState, useEffect } from 'react';
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { getUserProfile } from '@/lib/storage';
import { useAuth } from '@/hooks/useAuth';
import { useProfileSync } from '@/hooks/useProfileSync';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { fetchAndSyncProfile } = useProfileSync();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      // If user is authenticated, try to fetch their profile from database
      if (user) {
        const profile = await fetchAndSyncProfile(user.id);
        if (profile?.onboardingCompleted) {
          setShowOnboarding(false);
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
  }, [user, authLoading, fetchAndSyncProfile]);

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-soft">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingContainer onComplete={() => setShowOnboarding(false)} />;
  }

  return <Dashboard />;
};

export default Index;
