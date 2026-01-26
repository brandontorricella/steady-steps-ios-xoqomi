import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { TimeCommitment } from '@/lib/types';
import { Check, Clock } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface TimeCommitmentScreenProps {
  value: TimeCommitment;
  onChange: (value: TimeCommitment) => void;
  onNext: () => void;
}

export const TimeCommitmentScreen = ({ value, onChange, onNext }: TimeCommitmentScreenProps) => {
  const { t } = useLanguage();

  const times: { value: TimeCommitment; labelKey: string }[] = [
    { value: '5_to_10', labelKey: 'time.fiveToTen' },
    { value: '10_to_15', labelKey: 'time.tenToFifteen' },
    { value: '15_to_20', labelKey: 'time.fifteenToTwenty' },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-heading font-bold mb-2 text-center"
      >
        {t('time.title')}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-muted-foreground text-center max-w-sm mt-2"
      >
        {t('time.subtitle')}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md mt-8 space-y-3"
      >
        {times.map((time, index) => (
          <motion.button
            key={time.value}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            onClick={() => onChange(time.value)}
            className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
              value === time.value
                ? 'border-primary bg-primary/5 shadow-soft'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              value === time.value ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
            <span className="flex-1 text-left font-medium">{t(time.labelKey)}</span>
            {value === time.value && (
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