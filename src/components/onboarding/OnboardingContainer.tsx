import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageScreen } from './screens/LanguageScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { NameScreen } from './screens/NameScreen';
import { AccountScreen } from './screens/AccountScreen';
import { GoalScreen } from './screens/GoalScreen';
import { ActivityLevelScreen } from './screens/ActivityLevelScreen';
import { NutritionChallengeScreen } from './screens/NutritionChallengeScreen';
import { TimeCommitmentScreen } from './screens/TimeCommitmentScreen';
import { ObstacleScreen } from './screens/ObstacleScreen';
import { DietPreferenceScreen } from './screens/DietPreferenceScreen';
import { ConfidenceScreen } from './screens/ConfidenceScreen';
import { MeetCoachScreen } from './screens/MeetCoachScreen';
import { NotificationScreen } from './screens/NotificationScreen';
import { TermsScreen } from './screens/TermsScreen';
import { PaymentScreen } from './screens/PaymentScreen';
import { StartingPointScreen } from './screens/StartingPointScreen';
import { FirstDayScreen } from './screens/FirstDayScreen';
import { UserProfile, getActivityGoalFromCommitment, BiggestObstacle, DietPreference } from '@/lib/types';
import { saveUserProfile, getDefaultUserProfile } from '@/lib/storage';
import { useAuth } from '@/hooks/useAuth';
import { useProfileSync } from '@/hooks/useProfileSync';
import { useLanguage } from '@/hooks/useLanguage';

interface OnboardingContainerProps {
  onComplete: () => void;
}

export const OnboardingContainer = ({ onComplete }: OnboardingContainerProps) => {
  const { user } = useAuth();
  const { syncProfileToDatabase } = useProfileSync();
  const { language } = useLanguage();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>(getDefaultUserProfile());
  const [email, setEmail] = useState('');

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleComplete = async () => {
    const finalProfile = {
      ...profile,
      email,
      language: language, // Save the user's language preference
      currentActivityGoalMinutes: getActivityGoalFromCommitment(profile.dailyTimeCommitment),
      onboardingCompleted: true,
      trialStartDate: new Date().toISOString(),
      subscriptionStatus: 'trial' as const,
    };
    
    // Save to local storage
    saveUserProfile(finalProfile);
    
    // If user is authenticated, also save to database
    if (user) {
      await syncProfileToDatabase(finalProfile, user.id);
    }
    
    onComplete();
  };

  // Complete onboarding flow:
  // 0: Language Selection
  // 1: Welcome
  // 2: Name
  // 3: Account Creation
  // 4: Goal
  // 5: Activity Level
  // 6: Nutrition Challenge
  // 7: Biggest Obstacle (NEW)
  // 8: Diet Preference (NEW)
  // 9: Confidence Level (NEW)
  // 10: Time Commitment
  // 11: Meet Coach
  // 12: Notifications
  // 13: Terms & Privacy
  // 14: Payment
  // 15: Starting Point
  // 16: First Day
  const screens = [
    <LanguageScreen key="language" onNext={handleNext} />,
    <WelcomeScreen key="welcome" onNext={handleNext} />,
    <NameScreen key="name" value={profile.firstName} onChange={(v) => updateProfile({ firstName: v })} onNext={handleNext} />,
    <AccountScreen key="account" email={email} onEmailChange={setEmail} onNext={handleNext} />,
    <GoalScreen key="goal" value={profile.primaryGoal} onChange={(v) => updateProfile({ primaryGoal: v })} onNext={handleNext} />,
    <ActivityLevelScreen key="activity" value={profile.activityLevel} onChange={(v) => updateProfile({ activityLevel: v })} onNext={handleNext} />,
    <NutritionChallengeScreen key="nutrition" value={profile.primaryNutritionChallenge} onChange={(v) => updateProfile({ primaryNutritionChallenge: v })} onNext={handleNext} />,
    <ObstacleScreen key="obstacle" value={profile.biggestObstacle} onChange={(v) => updateProfile({ biggestObstacle: v })} onNext={handleNext} />,
    <DietPreferenceScreen key="diet" value={profile.dietPreference} onChange={(v) => updateProfile({ dietPreference: v })} onNext={handleNext} />,
    <ConfidenceScreen key="confidence" value={profile.fitnessConfidence} onChange={(v) => updateProfile({ fitnessConfidence: v })} onNext={handleNext} />,
    <TimeCommitmentScreen key="time" value={profile.dailyTimeCommitment} onChange={(v) => updateProfile({ dailyTimeCommitment: v })} onNext={handleNext} />,
    <MeetCoachScreen key="coach" onNext={handleNext} />,
    <NotificationScreen 
      key="notification" 
      morningTime={profile.morningReminderTime}
      eveningTime={profile.eveningReminderTime}
      middayEnabled={profile.middayNudgeEnabled}
      onMorningChange={(v) => updateProfile({ morningReminderTime: v })}
      onEveningChange={(v) => updateProfile({ eveningReminderTime: v })}
      onMiddayToggle={(v) => updateProfile({ middayNudgeEnabled: v })}
      onNext={handleNext}
    />,
    <TermsScreen key="terms" onNext={handleNext} />,
    <PaymentScreen key="payment" onNext={handleNext} />,
    <StartingPointScreen key="starting" profile={profile} onNext={handleNext} />,
    <FirstDayScreen key="firstday" profile={profile} onComplete={handleComplete} />,
  ];

  const totalSteps = screens.length;
  const showProgress = step > 0 && step < totalSteps - 2;

  return (
    <div className="min-h-screen gradient-soft flex flex-col">
      {/* Progress indicator */}
      {showProgress && (
        <div className="fixed top-0 left-0 right-0 z-10">
          <div className="h-1 bg-secondary">
            <motion.div 
              className="h-full gradient-primary"
              initial={{ width: 0 }}
              animate={{ width: `${((step) / (totalSteps - 1)) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col"
        >
          {screens[step]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
