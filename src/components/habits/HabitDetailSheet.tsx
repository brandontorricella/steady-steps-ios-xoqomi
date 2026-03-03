import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Star, Users, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { ExtendedHabit } from '@/lib/habit-library-data';

interface HabitDetailSheetProps {
  habit: ExtendedHabit | null;
  isOpen: boolean;
  onClose: () => void;
  isActive: boolean;
  onToggle: () => void;
  stats?: {
    avgRating: number;
    ratingCount: number;
    recommendPercent: number;
    trackingCount: number;
  };
  onRate: () => void;
  canRate: boolean;
}

export const HabitDetailSheet = ({
  habit,
  isOpen,
  onClose,
  isActive,
  onToggle,
  stats,
  onRate,
  canRate,
}: HabitDetailSheetProps) => {
  const { language } = useLanguage();

  if (!habit) return null;

  const getDiffLabel = (d: string) => {
    if (language === 'es') return d === 'beginner' ? 'Principiante' : d === 'easy' ? 'Fácil' : 'Moderado';
    return d.charAt(0).toUpperCase() + d.slice(1);
  };

  const texts = {
    en: {
      howTo: 'How to do it',
      min: 'min',
      people: 'people track this',
      helpful: 'found helpful',
      ratings: 'ratings',
      addHabit: 'Add to My Habits',
      removeHabit: 'Remove from My Habits',
      rateThis: 'Rate This Habit',
      rateNote: 'Track this habit to leave a rating',
    },
    es: {
      howTo: 'Cómo hacerlo',
      min: 'min',
      people: 'personas siguen este',
      helpful: 'lo encontraron útil',
      ratings: 'calificaciones',
      addHabit: 'Agregar a Mis Hábitos',
      removeHabit: 'Quitar de Mis Hábitos',
      rateThis: 'Calificar Este Hábito',
      rateNote: 'Sigue este hábito para dejar una calificación',
    },
  };

  const t = texts[language];
  const steps = language === 'en' ? habit.steps : habit.stepsEs;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-card rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{habit.icon}</span>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="font-heading font-bold text-xl mb-1">
              {language === 'en' ? habit.name : habit.nameEs}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {language === 'en' ? habit.description : habit.descriptionEs}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {habit.estimatedMinutes} {t.min}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-secondary text-xs">
                {getDiffLabel(habit.difficulty)}
              </span>
            </div>

            {/* Community Stats */}
            {stats && (
              <div className="p-4 rounded-2xl bg-secondary/50 mb-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{stats.avgRating}</span>
                  <span className="text-sm text-muted-foreground">({stats.ratingCount} {t.ratings})</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{stats.trackingCount} {t.people}</span>
                </div>
                {stats.recommendPercent > 0 && (
                  <p className="text-sm text-success font-medium">
                    {stats.recommendPercent}% {t.helpful}
                  </p>
                )}
              </div>
            )}

            {/* Steps */}
            {steps && steps.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-sm mb-2">{t.howTo}</h3>
                <ol className="space-y-2">
                  {steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Button onClick={onToggle} className="w-full" variant={isActive ? 'outline' : 'default'}>
                {isActive ? (
                  <><Check className="w-4 h-4 mr-2" />{t.removeHabit}</>
                ) : (
                  <><Plus className="w-4 h-4 mr-2" />{t.addHabit}</>
                )}
              </Button>
              {canRate ? (
                <Button onClick={onRate} variant="ghost" className="w-full">
                  <Star className="w-4 h-4 mr-2" />
                  {t.rateThis}
                </Button>
              ) : (
                <p className="text-xs text-center text-muted-foreground">{t.rateNote}</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
