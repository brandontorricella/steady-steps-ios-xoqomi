import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useNotBehindMode } from '@/hooks/useNotBehindMode';

export const NotBehindBanner = () => {
  const { language } = useLanguage();
  const { isActive } = useNotBehindMode();

  if (!isActive) return null;

  const texts = {
    en: {
      title: "You're not behind.",
      message: "Life happens. Let's focus on today.",
    },
    es: {
      title: 'No estás atrasada.',
      message: 'La vida pasa. Enfoquémonos en hoy.',
    },
  };

  const t = texts[language];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Heart className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-heading font-semibold text-primary">{t.title}</p>
          <p className="text-sm text-muted-foreground">{t.message}</p>
        </div>
      </div>
    </motion.div>
  );
};
