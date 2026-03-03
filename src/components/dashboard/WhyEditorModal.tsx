import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/useLanguage';

interface WhyEditorModalProps {
  isOpen: boolean;
  currentText: string | null;
  onSave: (text: string) => void;
  onClose: () => void;
}

export const WhyEditorModal = ({ isOpen, currentText, onSave, onClose }: WhyEditorModalProps) => {
  const { language } = useLanguage();
  const [text, setText] = useState(currentText || '');

  const texts = {
    en: {
      title: 'Edit My Why',
      subtitle: 'Update your personal motivation anchor.',
      placeholder: "Why are you building these habits?",
      save: 'Save',
      charCount: 'characters',
    },
    es: {
      title: 'Editar Mi Por Qué',
      subtitle: 'Actualiza tu ancla de motivación personal.',
      placeholder: '¿Por qué estás construyendo estos hábitos?',
      save: 'Guardar',
      charCount: 'caracteres',
    },
  };

  const t = texts[language];

  const handleSave = () => {
    if (text.trim()) {
      onSave(text.trim());
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="w-full max-w-sm p-6 rounded-2xl bg-card border border-border shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-lg">{t.title}</h3>
              </div>
              <button
                onClick={onClose}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">{t.subtitle}</p>

            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 200))}
              placeholder={t.placeholder}
              className="min-h-[120px] text-base resize-none rounded-xl border-2 border-border focus:border-primary mb-1"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right mb-4">
              {text.length}/200 {t.charCount}
            </p>

            <Button
              onClick={handleSave}
              disabled={!text.trim()}
              className="w-full"
            >
              {t.save}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
