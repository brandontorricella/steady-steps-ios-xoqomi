import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Footprints } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface WelcomeScreenProps {
  onNext: () => void;
}

export const WelcomeScreen = ({ onNext }: WelcomeScreenProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center shadow-glow mb-8"
      >
        <Footprints className="w-12 h-12 text-primary-foreground" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl font-heading font-bold mb-4 text-foreground"
      >
        {t('welcome.title')}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-lg text-muted-foreground max-w-sm mb-12 leading-relaxed"
      >
        {t('welcome.subtitle')}. {t('welcome.description')}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button size="lg" onClick={onNext} className="px-12 py-6 text-lg font-semibold">
          {t('welcome.getStarted')}
        </Button>
      </motion.div>
    </div>
  );
};