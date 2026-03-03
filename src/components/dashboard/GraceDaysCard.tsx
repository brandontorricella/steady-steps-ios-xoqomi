import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, Info } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

interface GraceDaysCardProps {
  remaining: number;
  message?: string | null;
  onDismissMessage?: () => void;
}

export const GraceDaysCard = ({ remaining, message, onDismissMessage }: GraceDaysCardProps) => {
  const { language } = useLanguage();
  const [showInfo, setShowInfo] = useState(false);

  const texts = {
    en: {
      graceDays: 'Grace Days',
      remaining: 'remaining',
      tooltip: 'Grace days let you miss a day without breaking your streak. You get 3 per month.',
      infoTitle: 'What are Grace Days?',
      infoBody: 'Life happens. Kids get sick. Work gets overwhelming. Grace days let you miss a check-in without breaking your streak. You get 3 per month, and they reset on the 1st. We automatically use them when you miss a day.',
      gotIt: 'Got it!',
    },
    es: {
      graceDays: 'Días de Gracia',
      remaining: 'restantes',
      tooltip: 'Los días de gracia te permiten faltar un día sin perder tu racha. Tienes 3 por mes.',
      infoTitle: '¿Qué son los Días de Gracia?',
      infoBody: 'La vida pasa. Los niños se enferman. El trabajo abruma. Los días de gracia te permiten faltar a un registro sin perder tu racha. Tienes 3 por mes y se reinician el día 1. Los usamos automáticamente cuando faltas un día.',
      gotIt: '¡Entendido!',
    },
  };

  const t = texts[language];

  return (
    <>
      {/* Grace Day Used Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-primary/10 border border-primary/20"
          >
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm whitespace-pre-line flex-1">{message}</p>
              <button onClick={onDismissMessage} className="text-muted-foreground min-h-[44px] min-w-[44px] flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grace Days Badge */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setShowInfo(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border hover:border-primary/30 transition-colors"
      >
        <Shield className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">
          {t.graceDays}: {remaining}/3
        </span>
        <Info className="w-3.5 h-3.5 text-muted-foreground" />
      </motion.button>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowInfo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm p-6 rounded-2xl bg-card border border-border shadow-lg"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-lg">{t.infoTitle}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {t.infoBody}
              </p>
              <div className="flex items-center gap-3 mb-4">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      i < remaining
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Shield className="w-5 h-5" />
                  </div>
                ))}
                <span className="text-sm text-muted-foreground ml-2">
                  {remaining}/3 {t.remaining}
                </span>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
              >
                {t.gotIt}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
