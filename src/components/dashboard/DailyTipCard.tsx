import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { DAILY_TIPS } from '@/lib/types';
import { getDailyTipIndex } from '@/lib/storage';

export const DailyTipCard = () => {
  const tipIndex = getDailyTipIndex(DAILY_TIPS.length);
  const tip = DAILY_TIPS[tipIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-accent border border-accent/50"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-accent-foreground/10 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-accent-foreground mb-1">
            Today's Tip
          </h3>
          <p className="text-sm text-foreground">
            {tip}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
