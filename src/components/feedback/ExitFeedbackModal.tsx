import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ExitFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const ExitFeedbackModal = ({ isOpen, onClose, onComplete }: ExitFeedbackModalProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const texts = {
    en: {
      title: 'Quick Feedback (Optional)',
      subtitle: 'Help us improve. This won\'t block your cancellation.',
      skip: 'Skip & Continue',
      submit: 'Submit & Continue',
      reasons: [
        { id: 'too_busy', label: 'Too busy right now' },
        { id: 'too_confusing', label: 'Too confusing to use' },
        { id: 'no_results', label: "Didn't see results yet" },
        { id: 'not_expected', label: 'Not what I expected' },
      ],
    },
    es: {
      title: 'Comentario Rápido (Opcional)',
      subtitle: 'Ayúdanos a mejorar. Esto no bloqueará tu cancelación.',
      skip: 'Saltar y Continuar',
      submit: 'Enviar y Continuar',
      reasons: [
        { id: 'too_busy', label: 'Muy ocupada ahora mismo' },
        { id: 'too_confusing', label: 'Demasiado confuso de usar' },
        { id: 'no_results', label: 'No vi resultados aún' },
        { id: 'not_expected', label: 'No era lo que esperaba' },
      ],
    },
  };

  const t = texts[language];

  const handleSubmit = async () => {
    if (selectedReason && user) {
      setIsSubmitting(true);
      try {
        await supabase
          .from('exit_feedback')
          .insert({
            user_id: user.id,
            reason: selectedReason,
          });
      } catch (error) {
        console.error('Failed to save exit feedback:', error);
      }
      setIsSubmitting(false);
    }
    onComplete();
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-card rounded-2xl w-full max-w-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="font-heading font-bold">{t.title}</h2>
                  <p className="text-xs text-muted-foreground">{t.subtitle}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 mb-6">
              {t.reasons.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => setSelectedReason(reason.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    selectedReason === reason.id
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-secondary border-2 border-transparent hover:border-border'
                  }`}
                >
                  <span className="text-sm font-medium">{reason.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {selectedReason ? (
                <Button 
                  onClick={handleSubmit} 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {t.submit}
                </Button>
              ) : (
                <Button onClick={handleSkip} variant="outline" className="w-full">
                  {t.skip}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
