import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { NutritionChallenge } from '@/lib/types';
import { Check, Coffee, Moon, Utensils, UtensilsCrossed, HelpCircle } from 'lucide-react';

interface NutritionChallengeScreenProps {
  value: NutritionChallenge;
  onChange: (value: NutritionChallenge) => void;
  onNext: () => void;
}

const challenges: { value: NutritionChallenge; label: string; icon: React.ReactNode }[] = [
  { value: 'sugary_drinks', label: 'I drink sugary beverages regularly', icon: <Coffee className="w-5 h-5" /> },
  { value: 'late_snacking', label: 'I snack late at night', icon: <Moon className="w-5 h-5" /> },
  { value: 'portions', label: 'I eat large portions at meals', icon: <Utensils className="w-5 h-5" /> },
  { value: 'processed_food', label: 'I rely on processed or fast food', icon: <UtensilsCrossed className="w-5 h-5" /> },
  { value: 'unsure', label: 'I am not sure where to start', icon: <HelpCircle className="w-5 h-5" /> },
];

export const NutritionChallengeScreen = ({ value, onChange, onNext }: NutritionChallengeScreenProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-heading font-bold mb-2 text-center"
      >
        Which of these feels most true for you?
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-md mt-8 space-y-3"
      >
        {challenges.map((challenge, index) => (
          <motion.button
            key={challenge.value}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            onClick={() => onChange(challenge.value)}
            className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
              value === challenge.value
                ? 'border-primary bg-primary/5 shadow-soft'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              value === challenge.value ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}>
              {challenge.icon}
            </div>
            <span className="flex-1 text-left font-medium">{challenge.label}</span>
            {value === challenge.value && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-primary-foreground" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12"
      >
        <Button size="lg" onClick={onNext} className="px-12 py-6 text-lg font-semibold">
          Continue
        </Button>
      </motion.div>
    </div>
  );
};
