import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface MeetCoachScreenProps {
  onNext: () => void;
}

export const MeetCoachScreen = ({ onNext }: MeetCoachScreenProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="w-28 h-28 rounded-full gradient-coral flex items-center justify-center shadow-warm mb-8"
      >
        <div className="relative">
          <Heart className="w-14 h-14 text-accent-foreground" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-5 h-5 text-gold-foreground" />
          </motion.div>
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-heading font-bold mb-2 text-center"
      >
        {t('coach.meetTitle')}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-lg text-muted-foreground text-center mb-8"
      >
        {t('coach.meetSubtitle')}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-sm text-center mb-8"
      >
        <p className="text-foreground mb-6">
          {t('coach.meetDescription')}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-sm space-y-3"
      >
        <div className="p-3 rounded-xl bg-card border border-border flex items-center gap-3">
          <span className="text-xl">🏃‍♀️</span>
          <span className="text-sm">{t('coach.features.movement')}</span>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border flex items-center gap-3">
          <span className="text-xl">🥗</span>
          <span className="text-sm">{t('coach.features.nutrition')}</span>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border flex items-center gap-3">
          <span className="text-xl">💪</span>
          <span className="text-sm">{t('coach.features.motivation')}</span>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border flex items-center gap-3">
          <span className="text-xl">❓</span>
          <span className="text-sm">{t('coach.features.questions')}</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-10"
      >
        <Button size="lg" onClick={onNext} className="px-12 py-6 text-lg font-semibold">
          {t('coach.meetButton')}
        </Button>
      </motion.div>
    </div>
  );
};