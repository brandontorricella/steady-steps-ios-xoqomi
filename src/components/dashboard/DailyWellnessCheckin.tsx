import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { X, Moon, Zap, Brain, Check } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface DailyWellnessCheckinProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: WellnessData) => void;
  initialData?: WellnessData;
}

export interface WellnessData {
  stressLevel: number | null;
  sleepQuality: number | null;
  energyLevel: number | null;
}

export const DailyWellnessCheckin = ({ isOpen, onClose, onComplete, initialData }: DailyWellnessCheckinProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [stressLevel, setStressLevel] = useState(initialData?.stressLevel || 3);
  const [sleepQuality, setSleepQuality] = useState(initialData?.sleepQuality || 3);
  const [energyLevel, setEnergyLevel] = useState(initialData?.energyLevel || 3);
  const [saving, setSaving] = useState(false);

  const texts = {
    en: {
      stress: {
        title: "How's your stress level today?",
        labels: ['Very low', 'Low', 'Moderate', 'High', 'Very high'],
      },
      sleep: {
        title: "How did you sleep last night?",
        labels: ['Terrible', 'Poor', 'Okay', 'Good', 'Great'],
      },
      energy: {
        title: "How's your energy today?",
        labels: ['Exhausted', 'Low', 'Moderate', 'Good', 'Energized'],
      },
      skip: 'Skip',
      next: 'Next',
      done: 'Done',
      saving: 'Saving...',
    },
    es: {
      stress: {
        title: "¿Cómo está tu nivel de estrés hoy?",
        labels: ['Muy bajo', 'Bajo', 'Moderado', 'Alto', 'Muy alto'],
      },
      sleep: {
        title: "¿Cómo dormiste anoche?",
        labels: ['Terrible', 'Mal', 'Regular', 'Bien', 'Excelente'],
      },
      energy: {
        title: "¿Cómo está tu energía hoy?",
        labels: ['Agotada', 'Baja', 'Moderada', 'Buena', 'Muy energética'],
      },
      skip: 'Saltar',
      next: 'Siguiente',
      done: 'Listo',
      saving: 'Guardando...',
    },
  };

  const t = texts[language];

  const steps = [
    { key: 'stress', title: t.stress.title, labels: t.stress.labels, icon: Brain, value: stressLevel, onChange: setStressLevel, color: 'text-amber-500' },
    { key: 'sleep', title: t.sleep.title, labels: t.sleep.labels, icon: Moon, value: sleepQuality, onChange: setSleepQuality, color: 'text-indigo-500' },
    { key: 'energy', title: t.energy.title, labels: t.energy.labels, icon: Zap, value: energyLevel, onChange: setEnergyLevel, color: 'text-emerald-500' },
  ];

  const currentStep = steps[step];

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      await handleComplete();
    }
  };

  const handleSkip = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    const data: WellnessData = {
      stressLevel,
      sleepQuality,
      energyLevel,
    };

    // Save to database
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      await supabase.from('daily_checkins').upsert({
        user_id: user.id,
        date: today,
        stress_level: stressLevel,
        sleep_quality: sleepQuality,
        energy_level: energyLevel,
      }, { onConflict: 'user_id,date' });
    }

    setSaving(false);
    onComplete(data);
  };

  const getEmoji = (level: number, type: string) => {
    if (type === 'stress') {
      const emojis = ['😌', '🙂', '😐', '😰', '😫'];
      return emojis[level - 1];
    } else if (type === 'sleep') {
      const emojis = ['😵', '😔', '😐', '😊', '😴'];
      return emojis[level - 1];
    } else {
      const emojis = ['😫', '😔', '😐', '💪', '⚡'];
      return emojis[level - 1];
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-8 rounded-full transition-all ${
                    i <= step ? 'bg-primary' : 'bg-secondary'
                  }`}
                />
              ))}
            </div>
            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              {/* Icon */}
              <div className={`w-16 h-16 rounded-full bg-secondary mx-auto mb-6 flex items-center justify-center`}>
                <currentStep.icon className={`w-8 h-8 ${currentStep.color}`} />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-heading font-bold mb-8">{currentStep.title}</h2>

              {/* Emoji */}
              <motion.div
                key={currentStep.value}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-6xl mb-4"
              >
                {getEmoji(currentStep.value, currentStep.key)}
              </motion.div>

              {/* Label */}
              <p className="text-lg font-medium text-primary mb-8">
                {currentStep.labels[currentStep.value - 1]}
              </p>

              {/* Slider */}
              <div className="px-8 mb-12">
                <Slider
                  value={[currentStep.value]}
                  onValueChange={(vals) => currentStep.onChange(vals[0])}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleSkip} className="flex-1">
                  {t.skip}
                </Button>
                <Button onClick={handleNext} className="flex-1" disabled={saving}>
                  {saving ? t.saving : step === steps.length - 1 ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {t.done}
                    </>
                  ) : t.next}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
