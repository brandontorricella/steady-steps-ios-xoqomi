import { useState, useEffect } from 'react';
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { getUserProfile } from '@/lib/storage';

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profile = getUserProfile();
    if (profile?.onboardingCompleted) {
      setShowOnboarding(false);
    }
    setLoading(false);
  }, []);

  if (loading) {
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
