import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { NutritionChallenge } from '@/lib/types';
import { Check, Coffee, Moon, Utensils, UtensilsCrossed, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface NutritionChallengeScreenProps {
  value: NutritionChallenge;
  onChange: (value: NutritionChallenge) => void;
  onNext: () => void;
}

export const NutritionChallengeScreen = ({ value, onChange, onNext }: NutritionChallengeScreenProps) => {
  const { t } = useLanguage();

  const challenges: { value: NutritionChallenge; labelKey: string; icon: React.ReactNode }[] = [
    { value: 'sugary_drinks', labelKey: 'nutrition.sugaryDrinks', icon: <Coffee className="w-5 h-5" /> },
    { value: 'late_snacking', labelKey: 'nutrition.lateSnacking', icon: <Moon className="w-5 h-5" /> },
    { value: 'portions', labelKey: 'nutrition.portions', icon: <Utensils className="w-5 h-5" /> },
    { value: 'processed_food', labelKey: 'nutrition.processedFood', icon: <UtensilsCrossed className="w-5 h-5" /> },
    { value: 'unsure', labelKey: 'nutrition.unsure', icon: <HelpCircle className="w-5 h-5" /> },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-heading font-bold mb-2 text-center"
      >
        {t('nutrition.title')}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="text-muted-foreground text-center max-w-sm mt-2"
      >
        {t('nutrition.subtitle')}
      </motion.p>

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
            <span className="flex-1 text-left font-medium">{t(challenge.labelKey)}</span>
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
          {t('common.continue')}
        </Button>
      </motion.div>
    </div>
  );
};