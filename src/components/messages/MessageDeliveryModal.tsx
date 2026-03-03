import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mail, X, Pencil } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface FutureMessage {
  id: string;
  content: string;
  currentDayWhenCreated: number;
  deliveryDay: number;
  createdAt: string;
}

interface MessageDeliveryModalProps {
  isOpen: boolean;
  message: FutureMessage | null;
  onClose: () => void;
  onWriteBack?: () => void;
}

export const MessageDeliveryModal = ({
  isOpen,
  message,
  onClose,
  onWriteBack,
}: MessageDeliveryModalProps) => {
  const { language } = useLanguage();

  if (!message) return null;

  const createdDate = new Date(message.createdAt).toLocaleDateString(
    language === 'en' ? 'en-US' : 'es-ES',
    { month: 'long', day: 'numeric' }
  );

  const texts = {
    en: {
      title: `Message from Day ${message.currentDayWhenCreated} You`,
      subtitle: `Written on ${createdDate}`,
      writeBack: 'Write to Future Me',
      close: 'Close',
    },
    es: {
      title: `Mensaje de Tu Yo del Día ${message.currentDayWhenCreated}`,
      subtitle: `Escrito el ${createdDate}`,
      writeBack: 'Escribir a Mi Yo del Futuro',
      close: 'Cerrar',
    },
  };

  const t = texts[language];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card rounded-3xl p-8 relative overflow-hidden"
          >
            {/* Decorative envelope */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-6">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
              >
                <Mail className="w-8 h-8 text-primary" />
              </motion.div>
              <h2 className="font-heading font-bold text-xl">{t.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-5 rounded-2xl bg-secondary/50 border border-border"
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            </motion.div>

            <div className="mt-6 space-y-3">
              {onWriteBack && (
                <Button onClick={onWriteBack} variant="outline" className="w-full">
                  <Pencil className="w-4 h-4 mr-2" />
                  {t.writeBack}
                </Button>
              )}
              <Button onClick={onClose} className="w-full">
                {t.close}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
