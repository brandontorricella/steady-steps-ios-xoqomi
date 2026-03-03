import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Send, Mail } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface ComposeMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (content: string, deliveryDay: number) => void;
  currentDay: number;
  title?: string;
  subtitle?: string;
}

const DELIVERY_OPTIONS = [
  { days: 7, labelEn: 'Day 7', labelEs: 'Día 7' },
  { days: 14, labelEn: 'Day 14', labelEs: 'Día 14' },
  { days: 30, labelEn: 'Day 30', labelEs: 'Día 30' },
  { days: 60, labelEn: 'Day 60', labelEs: 'Día 60' },
  { days: 90, labelEn: 'Day 90', labelEs: 'Día 90' },
];

export const ComposeMessageModal = ({
  isOpen,
  onClose,
  onSend,
  currentDay,
  title,
  subtitle,
}: ComposeMessageModalProps) => {
  const { language } = useLanguage();
  const [content, setContent] = useState('');
  const [deliveryDay, setDeliveryDay] = useState(30);

  const texts = {
    en: {
      title: title || 'Write to Future You',
      subtitle: subtitle || 'What would Present You want Future You to remember?',
      placeholder: 'Dear Future Me...\n\nI want you to remember that...',
      deliverOn: 'Deliver on',
      send: 'Send to Future Me',
      charCount: 'characters',
    },
    es: {
      title: title || 'Escribe a Tu Yo del Futuro',
      subtitle: subtitle || '¿Qué quisieras que tu Yo del Futuro recuerde?',
      placeholder: 'Querido Yo del Futuro...\n\nQuiero que recuerdes que...',
      deliverOn: 'Entregar en',
      send: 'Enviar a Mi Yo del Futuro',
      charCount: 'caracteres',
    },
  };

  const t = texts[language];

  // Filter delivery options to only show future days
  const availableOptions = DELIVERY_OPTIONS.filter(o => o.days > currentDay);

  const handleSend = () => {
    if (content.trim().length === 0) return;
    onSend(content.trim(), deliveryDay);
    setContent('');
    setDeliveryDay(30);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-lg">{t.title}</h2>
                  <p className="text-xs text-muted-foreground">{t.subtitle}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Text Area */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 500))}
              placeholder={t.placeholder}
              className="w-full h-40 p-4 rounded-2xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="text-xs text-muted-foreground text-right mt-1">
              {content.length}/500 {t.charCount}
            </p>

            {/* Delivery Day Selector */}
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">{t.deliverOn}</p>
              <div className="flex flex-wrap gap-2">
                {availableOptions.map((opt) => (
                  <button
                    key={opt.days}
                    onClick={() => setDeliveryDay(opt.days)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      deliveryDay === opt.days
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {language === 'en' ? opt.labelEn : opt.labelEs}
                  </button>
                ))}
              </div>
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={content.trim().length === 0}
              className="w-full mt-6"
              size="lg"
            >
              <Send className="w-4 h-4 mr-2" />
              {t.send}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
