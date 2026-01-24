import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { TimeCommitment } from '@/lib/types';
import { Check, Clock } from 'lucide-react';

interface TimeCommitmentScreenProps {
  value: TimeCommitment;
  onChange: (value: TimeCommitment) => void;
  onNext: () => void;
}

const times: { value: TimeCommitment; label: string }[] = [
  { value: '5_to_10', label: '5 to 10 minutes' },
  { value: '10_to_15', label: '10 to 15 minutes' },
  { value: '15_to_20', label: '15 to 20 minutes' },
];

export const TimeCommitmentScreen = ({ value, onChange, onNext }: TimeCommitmentScreenProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-heading font-bold mb-2 text-center"
      >
        How much time can you realistically commit each day?
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-muted-foreground text-center max-w-sm mt-2"
      >
        Be honest. We will start small and build from there.
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
            <span className="flex-1 text-left font-medium">{time.label}</span>
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
          Continue
        </Button>
      </motion.div>
    </div>
  );
};
