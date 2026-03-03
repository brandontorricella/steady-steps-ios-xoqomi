import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Pencil } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface WhyReminderProps {
  whyText: string;
  isVisible: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export const WhyReminder = ({ whyText, isVisible, onClose, onEdit }: WhyReminderProps) => {
  const { language } = useLanguage();

  const texts = {
    en: {
      title: 'Remember why you started 💚',
      editMy: 'Edit My Why',
    },
    es: {
      title: 'Recuerda por qué empezaste 💚',
      editMy: 'Editar Mi Por Qué',
    },
  };

  const t = texts[language];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-gradient-to-b from-primary/5 to-card border border-border shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold">{t.title}</h3>
                </div>
                <button
                  onClick={onClose}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <motion.blockquote
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg leading-relaxed italic text-foreground/90 border-l-4 border-primary/30 pl-4 mb-6"
              >
                "{whyText}"
              </motion.blockquote>

              <button
                onClick={onEdit}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                {t.editMy}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
