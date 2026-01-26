import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Check, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getUserProfile, saveUserProfile } from '@/lib/storage';
import { HABIT_LIBRARY, HabitLibraryItem } from '@/lib/types';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';

export const HabitLibraryPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const profile = getUserProfile();
  const [activeHabits, setActiveHabits] = useState<string[]>(profile?.activeLibraryHabits || []);

  const isUnlocked = profile?.currentStage !== 'beginner' || (profile?.totalCheckins || 0) >= 21;

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="px-6 pt-8 pb-4 bg-card border-b border-border">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span>{t('common.back')}</span>
          </button>
          <h1 className="text-3xl font-heading font-bold">{t('habitLibrary.title')}</h1>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-heading font-bold mb-2 text-center">Locked</h2>
          <p className="text-muted-foreground text-center max-w-xs">
            {t('settings.habitLibraryLocked')}
          </p>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  const categories = [
    { id: 'movement', name: t('habitLibrary.categories.movement') },
    { id: 'hydration', name: t('habitLibrary.categories.hydration') },
    { id: 'nutrition', name: t('habitLibrary.categories.nutrition') },
    { id: 'mindfulness', name: t('habitLibrary.categories.mindfulness') },
    { id: 'sleep', name: t('habitLibrary.categories.sleep') },
  ];

  const toggleHabit = (habitId: string) => {
    let newActiveHabits: string[];
    
    if (activeHabits.includes(habitId)) {
      newActiveHabits = activeHabits.filter(id => id !== habitId);
    } else {
      if (activeHabits.length >= 3) {
        toast.error(t('habitLibrary.maxHabits'));
        return;
      }
      newActiveHabits = [...activeHabits, habitId];
    }
    
    setActiveHabits(newActiveHabits);
    if (profile) {
      saveUserProfile({ ...profile, activeLibraryHabits: newActiveHabits });
    }
    toast.success(activeHabits.includes(habitId) ? 'Habit removed' : 'Habit added');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-8 pb-4 bg-card border-b border-border">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span>{t('common.back')}</span>
        </button>
        <h1 className="text-3xl font-heading font-bold">{t('habitLibrary.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('habitLibrary.subtitle')}</p>
      </header>

      <main className="px-6 py-6 space-y-6">
        {/* Active Habits */}
        {activeHabits.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="font-heading font-semibold mb-3">{t('habitLibrary.active')} ({activeHabits.length}/3)</h2>
            <div className="space-y-2">
              {activeHabits.map(habitId => {
                const habit = HABIT_LIBRARY.find(h => h.id === habitId);
                if (!habit) return null;
                return (
                  <div key={habitId} className="p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{habit.name}</p>
                      <p className="text-sm text-muted-foreground">{habit.description}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => toggleHabit(habitId)}>
                      {t('habitLibrary.remove')}
                    </Button>
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Categories */}
        {categories.map((category, catIndex) => {
          const habits = HABIT_LIBRARY.filter(h => h.category === category.id);
          return (
            <motion.section
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.1 }}
            >
              <h2 className="font-heading font-semibold mb-3">{category.name}</h2>
              <div className="space-y-2">
                {habits.map(habit => {
                  const isActive = activeHabits.includes(habit.id);
                  return (
                    <div 
                      key={habit.id} 
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isActive ? 'bg-primary/5 border-primary' : 'bg-card border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{habit.name}</p>
                          <p className="text-sm text-muted-foreground">{habit.description}</p>
                        </div>
                        <Button
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleHabit(habit.id)}
                        >
                          {isActive ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>
          );
        })}
      </main>

      <BottomNavigation />
    </div>
  );
};
