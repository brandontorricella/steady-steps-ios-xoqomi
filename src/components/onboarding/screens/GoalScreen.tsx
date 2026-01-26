import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PrimaryGoal } from '@/lib/types';
import { Check, Scale, Zap, Heart, Sparkles } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface GoalScreenProps {
  value: PrimaryGoal;
  onChange: (value: PrimaryGoal) => void;
  onNext: () => void;
}

export const GoalScreen = ({ value, onChange, onNext }: GoalScreenProps) => {
  const { t } = useLanguage();

  const goals: { value: PrimaryGoal; labelKey: string; icon: React.ReactNode }[] = [
    { value: 'weight_loss', labelKey: 'goal.weightLoss', icon: <Scale className="w-5 h-5" /> },
    { value: 'energy', labelKey: 'goal.energy', icon: <Zap className="w-5 h-5" /> },
    { value: 'habits', labelKey: 'goal.habits', icon: <Heart className="w-5 h-5" /> },
    { value: 'confidence', labelKey: 'goal.confidence', icon: <Sparkles className="w-5 h-5" /> },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-heading font-bold mb-2 text-center"
      >
        {t('goal.title')}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-md mt-8 space-y-3"
      >
        {goals.map((goal, index) => (
          <motion.button
            key={goal.value}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            onClick={() => onChange(goal.value)}
            className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
              value === goal.value
                ? 'border-primary bg-primary/5 shadow-soft'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              value === goal.value ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}>
              {goal.icon}
            </div>
            <span className="flex-1 text-left font-medium">{t(goal.labelKey)}</span>
            {value === goal.value && (
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
          {t('common.continue')}
        </Button>
      </motion.div>
    </div>
  );
};