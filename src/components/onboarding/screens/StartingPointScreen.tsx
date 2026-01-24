import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { UserProfile, getActivityGoalFromCommitment, getNutritionQuestion } from '@/lib/types';
import { Timer, Utensils, Star } from 'lucide-react';

interface StartingPointScreenProps {
  profile: UserProfile;
  onNext: () => void;
}

export const StartingPointScreen = ({ profile, onNext }: StartingPointScreenProps) => {
  const activityMinutes = getActivityGoalFromCommitment(profile.dailyTimeCommitment);
  const focusHabit = getNutritionQuestion(profile.primaryNutritionChallenge).replace('Did you ', '').replace('?', '');

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-heading font-bold mb-2 text-center"
      >
        Here is your starting plan, {profile.firstName}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-md mt-8 space-y-4"
      >
        {/* Activity Goal */}
        <div className="p-5 rounded-xl gradient-primary text-primary-foreground">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Timer className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-80">Your daily activity goal</p>
              <p className="text-2xl font-bold">{activityMinutes} minutes</p>
            </div>
          </div>
        </div>

        {/* Focus Habit */}
        <div className="p-5 rounded-xl border-2 border-border bg-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full gradient-coral flex items-center justify-center">
              <Utensils className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Your focus habit</p>
              <p className="font-semibold capitalize">{focusHabit}</p>
            </div>
          </div>
        </div>

        {/* Stage */}
        <div className="p-5 rounded-xl border-2 border-border bg-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Your stage</p>
              <p className="font-semibold">Beginner</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground text-center max-w-sm mt-8"
      >
        Remember, this is designed to be easy at first. Consistency matters more than intensity.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <Button size="lg" onClick={onNext} className="px-12 py-6 text-lg font-semibold">
          I Am Ready to Begin
        </Button>
      </motion.div>
    </div>
  );
};
