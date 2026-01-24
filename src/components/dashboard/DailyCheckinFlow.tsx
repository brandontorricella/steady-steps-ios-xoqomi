import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { UserProfile, getNutritionQuestion, SECONDARY_NUTRITION_QUESTIONS } from '@/lib/types';
import { saveDailyCheckin, saveUserProfile, calculatePoints, earnBadge } from '@/lib/storage';
import { Check, X, Sparkles, PartyPopper } from 'lucide-react';

interface DailyCheckinFlowProps {
  profile: UserProfile;
  onComplete: () => void;
}

export const DailyCheckinFlow = ({ profile, onComplete }: DailyCheckinFlowProps) => {
  const [step, setStep] = useState<'activity' | 'nutrition' | 'summary'>('activity');
  const [activityCompleted, setActivityCompleted] = useState<boolean | null>(null);
  const [nutritionResponses, setNutritionResponses] = useState<(boolean | null)[]>(
    Array(profile.nutritionQuestionsCount).fill(null)
  );
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [newBadges, setNewBadges] = useState<string[]>([]);

  const nutritionQuestions = [
    getNutritionQuestion(profile.primaryNutritionChallenge),
    ...SECONDARY_NUTRITION_QUESTIONS.slice(0, profile.nutritionQuestionsCount - 1)
  ];

  const handleActivityResponse = (completed: boolean) => {
    setActivityCompleted(completed);
    setStep('nutrition');
  };

  const handleNutritionResponse = (index: number, response: boolean) => {
    const newResponses = [...nutritionResponses];
    newResponses[index] = response;
    setNutritionResponses(newResponses);
  };

  const handleSubmit = () => {
    const today = new Date().toISOString().split('T')[0];
    const newStreak = profile.currentStreak + 1;
    const points = calculatePoints(activityCompleted || false, nutritionResponses, newStreak);
    
    // Save check-in
    saveDailyCheckin({
      date: today,
      checkinCompleted: true,
      activityCompleted: activityCompleted || false,
      nutritionResponses,
      pointsEarned: points,
    });

    // Update profile
    const updatedProfile: UserProfile = {
      ...profile,
      totalPoints: profile.totalPoints + points,
      currentStreak: newStreak,
      longestStreak: Math.max(profile.longestStreak, newStreak),
      totalCheckins: profile.totalCheckins + 1,
      totalActivityCompletions: profile.totalActivityCompletions + (activityCompleted ? 1 : 0),
      totalNutritionHabitsCompleted: profile.totalNutritionHabitsCompleted + nutritionResponses.filter(r => r === true).length,
      lastCheckinDate: today,
    };
    saveUserProfile(updatedProfile);

    // Check for badges
    const badges: string[] = [];
    if (profile.totalCheckins === 0) {
      earnBadge('first_checkin');
      badges.push('First Check-In');
    }
    if (activityCompleted && profile.totalActivityCompletions === 0) {
      earnBadge('first_activity');
      badges.push('First Steps');
    }
    if (nutritionResponses.some(r => r === true) && profile.totalNutritionHabitsCompleted === 0) {
      earnBadge('mindful_start');
      badges.push('Mindful Start');
    }
    if (newStreak === 7) {
      earnBadge('one_week');
      badges.push('One Week Wonder');
    }

    setEarnedPoints(points);
    setNewBadges(badges);
    setStep('summary');
  };

  const allNutritionAnswered = nutritionResponses.every(r => r !== null);

  return (
    <div className="min-h-screen gradient-soft flex flex-col">
      <AnimatePresence mode="wait">
        {step === 'activity' && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col items-center justify-center px-6 py-12"
          >
            <h1 className="text-3xl font-heading font-bold mb-4 text-center">
              Did you complete your movement goal today?
            </h1>
            <p className="text-muted-foreground text-center max-w-sm mb-12">
              Your goal was <span className="font-semibold text-foreground">{profile.currentActivityGoalMinutes} minutes</span> of walking, stretching, or gentle movement
            </p>

            <div className="flex gap-4 w-full max-w-sm">
              <Button
                size="lg"
                onClick={() => handleActivityResponse(true)}
                className="flex-1 py-8 text-lg font-semibold rounded-xl bg-success hover:bg-success/90"
              >
                <Check className="w-6 h-6 mr-2" />
                Yes, I Did It
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => handleActivityResponse(false)}
                className="flex-1 py-8 text-lg font-semibold rounded-xl"
              >
                <X className="w-6 h-6 mr-2" />
                I Skipped Today
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'nutrition' && (
          <motion.div
            key="nutrition"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col px-6 py-12"
          >
            {activityCompleted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-success/10 border border-success/30 mb-6 text-center"
              >
                <p className="text-success font-medium">🎉 Great job completing your activity!</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-secondary mb-6 text-center"
              >
                <p className="text-muted-foreground">No guilt. Tomorrow is a fresh start.</p>
              </motion.div>
            )}

            <h1 className="text-2xl font-heading font-bold mb-2">Quick nutrition check</h1>
            <p className="text-muted-foreground mb-8">Just answer honestly. No judgment here.</p>

            <div className="space-y-4 flex-1">
              {nutritionQuestions.map((question, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl border-2 border-border bg-card"
                >
                  <p className="font-medium mb-4">{question}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleNutritionResponse(index, true)}
                      className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                        nutritionResponses[index] === true
                          ? 'bg-success text-success-foreground'
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleNutritionResponse(index, false)}
                      className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                        nutritionResponses[index] === false
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={!allNutritionAnswered}
              className="w-full py-6 text-lg font-semibold mt-8"
            >
              Submit My Day
            </Button>
          </motion.div>
        )}

        {step === 'summary' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center shadow-glow mb-8"
            >
              <PartyPopper className="w-12 h-12 text-primary-foreground" />
            </motion.div>

            <h1 className="text-3xl font-heading font-bold mb-4">
              Great job checking in, {profile.firstName}!
            </h1>

            <div className="w-full max-w-sm space-y-4 mt-6">
              <div className="p-4 rounded-xl bg-secondary flex items-center justify-between">
                <span>Activity</span>
                <span className={activityCompleted ? 'text-success font-semibold' : 'text-muted-foreground'}>
                  {activityCompleted ? '✓ Completed' : 'Skipped'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-secondary flex items-center justify-between">
                <span>Nutrition habits</span>
                <span className="font-semibold">
                  {nutritionResponses.filter(r => r === true).length} of {nutritionResponses.length}
                </span>
              </div>

              <div className="p-4 rounded-xl gradient-primary text-primary-foreground flex items-center justify-between">
                <span>Points earned</span>
                <span className="text-2xl font-bold">+{earnedPoints}</span>
              </div>

              {newBadges.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 rounded-xl gradient-coral text-accent-foreground"
                >
                  <div className="flex items-center gap-2 justify-center">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-semibold">New badge{newBadges.length > 1 ? 's' : ''} earned!</span>
                  </div>
                  <p className="mt-1 text-sm">{newBadges.join(', ')}</p>
                </motion.div>
              )}
            </div>

            <Button
              size="lg"
              onClick={onComplete}
              className="px-12 py-6 text-lg font-semibold mt-12"
            >
              Done for Today
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
