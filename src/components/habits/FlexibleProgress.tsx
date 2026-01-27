import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pause, TrendingDown, TrendingUp, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { UserProfile } from '@/lib/types';
import { saveUserProfile, getUserProfile } from '@/lib/storage';
import { toast } from 'sonner';

interface FlexibleProgressProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
}

export const FlexibleProgress = ({ isOpen, onClose, profile, onProfileUpdate }: FlexibleProgressProps) => {
  const { language } = useLanguage();
  const [isPaused, setIsPaused] = useState(profile.currentActivityGoalMinutes === 0);

  const currentGoal = profile.currentActivityGoalMinutes;
  const minGoal = 5;
  const maxGoal = 30;

  const handleAdjustGoal = (direction: 'up' | 'down') => {
    let newGoal = currentGoal;
    if (direction === 'up' && currentGoal < maxGoal) {
      newGoal = Math.min(currentGoal + 5, maxGoal);
    } else if (direction === 'down' && currentGoal > minGoal) {
      newGoal = Math.max(currentGoal - 5, minGoal);
    }

    const updatedProfile = { ...profile, currentActivityGoalMinutes: newGoal };
    saveUserProfile(updatedProfile);
    onProfileUpdate(updatedProfile);
    
    toast.success(
      language === 'en' 
        ? `Goal adjusted to ${newGoal} minutes` 
        : `Meta ajustada a ${newGoal} minutos`
    );
  };

  const handlePauseToggle = () => {
    if (isPaused) {
      // Resume with minimum goal
      const updatedProfile = { ...profile, currentActivityGoalMinutes: minGoal };
      saveUserProfile(updatedProfile);
      onProfileUpdate(updatedProfile);
      setIsPaused(false);
      toast.success(
        language === 'en' 
          ? 'Welcome back! Starting fresh with 5 minutes' 
          : '¡Bienvenida de nuevo! Empezando fresco con 5 minutos'
      );
    } else {
      // Pause (set goal to 0 to indicate paused)
      const updatedProfile = { ...profile, currentActivityGoalMinutes: 0 };
      saveUserProfile(updatedProfile);
      onProfileUpdate(updatedProfile);
      setIsPaused(true);
      toast.success(
        language === 'en' 
          ? 'Activity paused. Take the time you need.' 
          : 'Actividad pausada. Toma el tiempo que necesites.'
      );
    }
  };

  const texts = {
    en: {
      title: 'Adjust Your Journey',
      subtitle: 'Life changes. Your goals can too.',
      currentGoal: 'Current Goal',
      minutes: 'minutes',
      adjust: 'Adjust Intensity',
      decrease: 'Decrease',
      increase: 'Increase',
      pause: 'Pause Activity',
      pauseDesc: 'Take a break without losing your streak',
      resume: 'Resume Activity',
      resumeDesc: 'Ready to start moving again',
      streakSafe: '✓ Your streak is protected during pause',
      done: 'Done',
      paused: 'Paused',
    },
    es: {
      title: 'Ajusta Tu Camino',
      subtitle: 'La vida cambia. Tus metas también pueden.',
      currentGoal: 'Meta Actual',
      minutes: 'minutos',
      adjust: 'Ajustar Intensidad',
      decrease: 'Reducir',
      increase: 'Aumentar',
      pause: 'Pausar Actividad',
      pauseDesc: 'Toma un descanso sin perder tu racha',
      resume: 'Reanudar Actividad',
      resumeDesc: 'Lista para empezar a moverte de nuevo',
      streakSafe: '✓ Tu racha está protegida durante la pausa',
      done: 'Listo',
      paused: 'Pausada',
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
          className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-heading font-bold">{t.title}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto px-6 py-6 space-y-6">
            <p className="text-muted-foreground text-center">{t.subtitle}</p>

            {/* Current Goal Display */}
            <div className="p-6 rounded-2xl bg-card border-2 border-border text-center">
              <p className="text-sm text-muted-foreground mb-2">{t.currentGoal}</p>
              {isPaused ? (
                <p className="text-3xl font-heading font-bold text-muted-foreground">{t.paused}</p>
              ) : (
                <p className="text-4xl font-heading font-bold text-primary">
                  {currentGoal} <span className="text-lg font-normal text-muted-foreground">{t.minutes}</span>
                </p>
              )}
            </div>

            {/* Adjust Intensity */}
            {!isPaused && (
              <div className="space-y-3">
                <p className="text-sm font-medium">{t.adjust}</p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleAdjustGoal('down')}
                    disabled={currentGoal <= minGoal}
                    className="flex-1 py-6"
                  >
                    <TrendingDown className="w-5 h-5 mr-2" />
                    {t.decrease}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleAdjustGoal('up')}
                    disabled={currentGoal >= maxGoal}
                    className="flex-1 py-6"
                  >
                    <TrendingUp className="w-5 h-5 mr-2" />
                    {t.increase}
                  </Button>
                </div>
              </div>
            )}

            {/* Pause/Resume */}
            <div className="p-4 rounded-2xl border-2 border-border bg-card">
              <button
                onClick={handlePauseToggle}
                className="w-full flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isPaused ? 'bg-success/20 text-success' : 'bg-secondary text-muted-foreground'
                }`}>
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium">{isPaused ? t.resume : t.pause}</p>
                  <p className="text-xs text-muted-foreground">
                    {isPaused ? t.resumeDesc : t.pauseDesc}
                  </p>
                </div>
              </button>
              {!isPaused && (
                <p className="text-xs text-success mt-3 text-center">{t.streakSafe}</p>
              )}
            </div>

            <Button onClick={onClose} className="w-full mt-6">
              {t.done}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
