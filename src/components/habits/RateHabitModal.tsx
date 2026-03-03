import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { ExtendedHabit } from '@/lib/habit-library-data';

interface RateHabitModalProps {
  habit: ExtendedHabit | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, wouldRecommend: boolean, reviewText?: string) => void;
}

export const RateHabitModal = ({ habit, isOpen, onClose, onSubmit }: RateHabitModalProps) => {
  const { language } = useLanguage();
  const [rating, setRating] = useState(0);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [reviewText, setReviewText] = useState('');

  if (!habit) return null;

  const texts = {
    en: {
      title: `How's "${habit.name}" working for you?`,
      recommend: 'Would you recommend this to others?',
      yes: 'Yes',
      no: 'No',
      review: 'Short review (optional)',
      placeholder: 'This habit changed my mornings...',
      submit: 'Submit Rating',
    },
    es: {
      title: `¿Cómo te funciona "${habit.nameEs}"?`,
      recommend: '¿Lo recomendarías a otros?',
      yes: 'Sí',
      no: 'No',
      review: 'Reseña corta (opcional)',
      placeholder: 'Este hábito cambió mis mañanas...',
      submit: 'Enviar Calificación',
    },
  };

  const t = texts[language];

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit(rating, wouldRecommend ?? true, reviewText);
    setRating(0);
    setWouldRecommend(null);
    setReviewText('');
  };

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
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-card rounded-3xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{habit.icon}</span>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <h2 className="font-heading font-bold mb-4">{t.title}</h2>

            {/* Star Rating */}
            <div className="flex gap-2 justify-center mb-6">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setRating(s)} className="p-1">
                  <Star
                    className={`w-8 h-8 transition-all ${
                      s <= rating ? 'fill-amber-400 text-amber-400 scale-110' : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Recommend */}
            <p className="text-sm font-medium mb-2">{t.recommend}</p>
            <div className="flex gap-2 mb-4">
              {[true, false].map(v => (
                <button
                  key={String(v)}
                  onClick={() => setWouldRecommend(v)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    wouldRecommend === v ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {v ? t.yes : t.no}
                </button>
              ))}
            </div>

            {/* Review */}
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value.slice(0, 100))}
              placeholder={t.placeholder}
              className="w-full h-20 p-3 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4"
            />

            <Button onClick={handleSubmit} disabled={rating === 0} className="w-full">
              {t.submit}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
