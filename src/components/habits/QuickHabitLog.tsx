import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Droplets, Apple, Coffee, Moon } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { MicroFeedback } from '../feedback/MicroFeedback';

interface QuickHabit {
  id: string;
  icon: React.ReactNode;
  label: string;
  labelEs: string;
  swap?: string;
  swapEs?: string;
}

const quickHabits: QuickHabit[] = [
  {
    id: 'water',
    icon: <Droplets className="w-5 h-5" />,
    label: 'Drank water',
    labelEs: 'Tomé agua',
    swap: 'instead of soda',
    swapEs: 'en vez de refresco',
  },
  {
    id: 'fruit',
    icon: <Apple className="w-5 h-5" />,
    label: 'Had fruit',
    labelEs: 'Comí fruta',
    swap: 'instead of candy',
    swapEs: 'en vez de dulces',
  },
  {
    id: 'coffee',
    icon: <Coffee className="w-5 h-5" />,
    label: 'Less sugar',
    labelEs: 'Menos azúcar',
    swap: 'in coffee/tea',
    swapEs: 'en café/té',
  },
  {
    id: 'sleep',
    icon: <Moon className="w-5 h-5" />,
    label: 'No late snack',
    labelEs: 'Sin snack nocturno',
  },
];

export const QuickHabitLog = () => {
  const { language } = useLanguage();
  const [completedHabits, setCompletedHabits] = useState<Set<string>>(new Set());
  const [showFeedback, setShowFeedback] = useState(false);

  const handleToggle = (habitId: string) => {
    const newCompleted = new Set(completedHabits);
    if (newCompleted.has(habitId)) {
      newCompleted.delete(habitId);
    } else {
      newCompleted.add(habitId);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2000);
    }
    setCompletedHabits(newCompleted);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        {language === 'en' ? '⚡ Quick Swaps' : '⚡ Cambios Rápidos'}
      </h3>
      
      <div className="grid grid-cols-2 gap-2">
        {quickHabits.map((habit) => {
          const isCompleted = completedHabits.has(habit.id);
          return (
            <motion.button
              key={habit.id}
              onClick={() => handleToggle(habit.id)}
              whileTap={{ scale: 0.98 }}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                isCompleted
                  ? 'border-success/50 bg-success/10'
                  : 'border-border bg-card hover:border-primary/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`${isCompleted ? 'text-success' : 'text-muted-foreground'}`}>
                  {isCompleted ? <Check className="w-5 h-5" /> : habit.icon}
                </div>
                <span className={`text-sm font-medium ${isCompleted ? 'text-success' : ''}`}>
                  {language === 'en' ? habit.label : habit.labelEs}
                </span>
              </div>
              {habit.swap && (
                <p className="text-xs text-muted-foreground pl-7">
                  {language === 'en' ? habit.swap : habit.swapEs}
                </p>
              )}
            </motion.button>
          );
        })}
      </div>

      <MicroFeedback type="nutrition" isVisible={showFeedback} onDismiss={() => setShowFeedback(false)} />
    </div>
  );
};
