import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Zap, Brain, Edit2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DailyWellnessCheckin, WellnessData } from './DailyWellnessCheckin';

interface WellnessWidgetProps {
  onDataChange?: (data: WellnessData) => void;
}

export const WellnessWidget = ({ onDataChange }: WellnessWidgetProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [showCheckin, setShowCheckin] = useState(false);
  const [wellnessData, setWellnessData] = useState<WellnessData>({
    stressLevel: null,
    sleepQuality: null,
    energyLevel: null,
  });
  const [loading, setLoading] = useState(true);

  const texts = {
    en: {
      title: "Today's Wellness",
      stress: "Stress",
      sleep: "Sleep",
      energy: "Energy",
      notLogged: "Not logged",
      logNow: "Log now",
      update: "Update",
      stressLabels: ['Very low', 'Low', 'Moderate', 'High', 'Very high'],
      sleepLabels: ['Terrible', 'Poor', 'Okay', 'Good', 'Great'],
      energyLabels: ['Exhausted', 'Low', 'Moderate', 'Good', 'Energized'],
    },
    es: {
      title: "Bienestar de Hoy",
      stress: "Estrés",
      sleep: "Sueño",
      energy: "Energía",
      notLogged: "Sin registrar",
      logNow: "Registrar",
      update: "Actualizar",
      stressLabels: ['Muy bajo', 'Bajo', 'Moderado', 'Alto', 'Muy alto'],
      sleepLabels: ['Terrible', 'Mal', 'Regular', 'Bien', 'Excelente'],
      energyLabels: ['Agotada', 'Baja', 'Moderada', 'Buena', 'Muy energética'],
    },
  };

  const t = texts[language];

  useEffect(() => {
    const fetchTodayWellness = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('stress_level, sleep_quality, energy_level')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (data) {
        setWellnessData({
          stressLevel: data.stress_level,
          sleepQuality: data.sleep_quality,
          energyLevel: data.energy_level,
        });
      }
      setLoading(false);
    };

    fetchTodayWellness();
  }, [user]);

  const handleComplete = (data: WellnessData) => {
    setWellnessData(data);
    setShowCheckin(false);
    onDataChange?.(data);
  };

  const hasAnyData = wellnessData.stressLevel || wellnessData.sleepQuality || wellnessData.energyLevel;

  const getStressEmoji = (level: number | null) => {
    if (!level) return '❓';
    const emojis = ['😌', '🙂', '😐', '😰', '😫'];
    return emojis[level - 1];
  };

  const getSleepEmoji = (level: number | null) => {
    if (!level) return '❓';
    const emojis = ['😵', '😔', '😐', '😊', '😴'];
    return emojis[level - 1];
  };

  const getEnergyEmoji = (level: number | null) => {
    if (!level) return '❓';
    const emojis = ['😫', '😔', '😐', '💪', '⚡'];
    return emojis[level - 1];
  };

  if (loading) {
    return (
      <div className="p-6 rounded-2xl border-2 border-border bg-card animate-pulse">
        <div className="h-6 bg-secondary rounded w-1/3 mb-4" />
        <div className="h-16 bg-secondary rounded" />
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl border-2 border-border bg-card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold">{t.title}</h3>
          <button
            onClick={() => setShowCheckin(true)}
            className="text-sm text-primary flex items-center gap-1 hover:underline"
          >
            {hasAnyData ? (
              <>
                <Edit2 className="w-3 h-3" />
                {t.update}
              </>
            ) : t.logNow}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Stress */}
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 mx-auto mb-2 flex items-center justify-center">
              {wellnessData.stressLevel ? (
                <span className="text-2xl">{getStressEmoji(wellnessData.stressLevel)}</span>
              ) : (
                <Brain className="w-5 h-5 text-amber-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-1">{t.stress}</p>
            <p className="text-xs font-medium">
              {wellnessData.stressLevel 
                ? t.stressLabels[wellnessData.stressLevel - 1]
                : t.notLogged}
            </p>
          </div>

          {/* Sleep */}
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 mx-auto mb-2 flex items-center justify-center">
              {wellnessData.sleepQuality ? (
                <span className="text-2xl">{getSleepEmoji(wellnessData.sleepQuality)}</span>
              ) : (
                <Moon className="w-5 h-5 text-indigo-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-1">{t.sleep}</p>
            <p className="text-xs font-medium">
              {wellnessData.sleepQuality 
                ? t.sleepLabels[wellnessData.sleepQuality - 1]
                : t.notLogged}
            </p>
          </div>

          {/* Energy */}
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 mx-auto mb-2 flex items-center justify-center">
              {wellnessData.energyLevel ? (
                <span className="text-2xl">{getEnergyEmoji(wellnessData.energyLevel)}</span>
              ) : (
                <Zap className="w-5 h-5 text-emerald-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-1">{t.energy}</p>
            <p className="text-xs font-medium">
              {wellnessData.energyLevel 
                ? t.energyLabels[wellnessData.energyLevel - 1]
                : t.notLogged}
            </p>
          </div>
        </div>
      </motion.div>

      <DailyWellnessCheckin
        isOpen={showCheckin}
        onClose={() => setShowCheckin(false)}
        onComplete={handleComplete}
        initialData={wellnessData}
      />
    </>
  );
};
