import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, TrendingUp, Moon, Brain, Zap, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface WeeklyReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WeeklyStats {
  checkinCount: number;
  activityCount: number;
  avgStress: number | null;
  avgSleep: number | null;
  avgEnergy: number | null;
  stressTrend: 'improving' | 'stable' | 'worsening' | null;
  sleepTrend: 'improving' | 'stable' | 'worsening' | null;
}

export const WeeklyReflectionModal = ({ isOpen, onClose }: WeeklyReflectionModalProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);

  const texts = {
    en: {
      title: 'Your Week in Review',
      subtitle: "Here's how you showed up for yourself",
      checkins: 'Days Checked In',
      activities: 'Movement Days',
      stress: 'Avg Stress',
      sleep: 'Avg Sleep',
      energy: 'Avg Energy',
      trends: 'Your Trends',
      stressImproving: '📉 Your stress levels improved this week',
      stressStable: '➡️ Your stress levels stayed steady',
      stressWorsening: '📈 Stress was higher this week. Be gentle with yourself.',
      sleepImproving: '😴 Your sleep quality is getting better!',
      sleepStable: '💤 Sleep has been consistent',
      sleepWorsening: '🛏️ Sleep was tough. Try winding down earlier tonight.',
      encouragement: "Every check-in matters. You're building real habits.",
      gotIt: 'Got It',
      outOf: 'out of 7',
      loading: 'Loading your week...',
    },
    es: {
      title: 'Tu Semana en Resumen',
      subtitle: 'Así es como te cuidaste esta semana',
      checkins: 'Días Registrados',
      activities: 'Días de Movimiento',
      stress: 'Estrés Prom.',
      sleep: 'Sueño Prom.',
      energy: 'Energía Prom.',
      trends: 'Tus Tendencias',
      stressImproving: '📉 Tus niveles de estrés mejoraron esta semana',
      stressStable: '➡️ Tu estrés se mantuvo estable',
      stressWorsening: '📈 El estrés fue más alto esta semana. Sé gentil contigo.',
      sleepImproving: '😴 ¡Tu calidad de sueño está mejorando!',
      sleepStable: '💤 El sueño ha sido consistente',
      sleepWorsening: '🛏️ El sueño fue difícil. Intenta relajarte más temprano.',
      encouragement: 'Cada registro importa. Estás construyendo hábitos reales.',
      gotIt: 'Entendido',
      outOf: 'de 7',
      loading: 'Cargando tu semana...',
    },
  };

  const t = texts[language];

  useEffect(() => {
    const fetchWeeklyStats = async () => {
      if (!user || !isOpen) return;

      setLoading(true);
      
      // Get last 7 days and previous 7 days for comparison
      const today = new Date();
      const lastWeekStart = new Date(today);
      lastWeekStart.setDate(today.getDate() - 7);
      const twoWeeksAgo = new Date(today);
      twoWeeksAgo.setDate(today.getDate() - 14);

      const { data: checkins } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', twoWeeksAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (!checkins) {
        setLoading(false);
        return;
      }

      const lastWeek = checkins.filter(c => new Date(c.date) >= lastWeekStart);
      const previousWeek = checkins.filter(c => new Date(c.date) < lastWeekStart);

      // Calculate stats
      const checkinCount = lastWeek.filter(c => c.checkin_completed).length;
      const activityCount = lastWeek.filter(c => c.activity_completed).length;

      // Averages for last week
      const stressValues = lastWeek.filter(c => c.stress_level).map(c => c.stress_level as number);
      const sleepValues = lastWeek.filter(c => c.sleep_quality).map(c => c.sleep_quality as number);
      const energyValues = lastWeek.filter(c => c.energy_level).map(c => c.energy_level as number);

      const avgStress = stressValues.length ? stressValues.reduce((a, b) => a + b, 0) / stressValues.length : null;
      const avgSleep = sleepValues.length ? sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length : null;
      const avgEnergy = energyValues.length ? energyValues.reduce((a, b) => a + b, 0) / energyValues.length : null;

      // Trends (compare to previous week)
      const prevStress = previousWeek.filter(c => c.stress_level).map(c => c.stress_level as number);
      const prevSleep = previousWeek.filter(c => c.sleep_quality).map(c => c.sleep_quality as number);

      let stressTrend: 'improving' | 'stable' | 'worsening' | null = null;
      let sleepTrend: 'improving' | 'stable' | 'worsening' | null = null;

      if (avgStress !== null && prevStress.length >= 3) {
        const prevAvgStress = prevStress.reduce((a, b) => a + b, 0) / prevStress.length;
        if (avgStress < prevAvgStress - 0.5) stressTrend = 'improving';
        else if (avgStress > prevAvgStress + 0.5) stressTrend = 'worsening';
        else stressTrend = 'stable';
      }

      if (avgSleep !== null && prevSleep.length >= 3) {
        const prevAvgSleep = prevSleep.reduce((a, b) => a + b, 0) / prevSleep.length;
        if (avgSleep > prevAvgSleep + 0.5) sleepTrend = 'improving';
        else if (avgSleep < prevAvgSleep - 0.5) sleepTrend = 'worsening';
        else sleepTrend = 'stable';
      }

      setStats({
        checkinCount,
        activityCount,
        avgStress,
        avgSleep,
        avgEnergy,
        stressTrend,
        sleepTrend,
      });

      // Mark weekly summary as shown
      await supabase
        .from('profiles')
        .update({ last_weekly_summary_date: today.toISOString().split('T')[0] })
        .eq('id', user.id);

      setLoading(false);
    };

    fetchWeeklyStats();
  }, [user, isOpen]);

  const getStressTrendMessage = () => {
    if (!stats?.stressTrend) return null;
    if (stats.stressTrend === 'improving') return t.stressImproving;
    if (stats.stressTrend === 'worsening') return t.stressWorsening;
    return t.stressStable;
  };

  const getSleepTrendMessage = () => {
    if (!stats?.sleepTrend) return null;
    if (stats.sleepTrend === 'improving') return t.sleepImproving;
    if (stats.sleepTrend === 'worsening') return t.sleepWorsening;
    return t.sleepStable;
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
          className="bg-card rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-bold">{t.title}</h2>
                  <p className="text-sm text-muted-foreground">{t.subtitle}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">{t.loading}</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="p-6 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-primary/10 text-center">
                  <p className="text-3xl font-bold text-primary">{stats?.checkinCount || 0}</p>
                  <p className="text-xs text-muted-foreground">{t.checkins}</p>
                  <p className="text-xs text-muted-foreground">{t.outOf}</p>
                </div>
                <div className="p-4 rounded-xl bg-accent/10 text-center">
                  <p className="text-3xl font-bold text-accent">{stats?.activityCount || 0}</p>
                  <p className="text-xs text-muted-foreground">{t.activities}</p>
                  <p className="text-xs text-muted-foreground">{t.outOf}</p>
                </div>
                
                {stats?.avgStress && (
                  <div className="p-3 rounded-xl bg-amber-500/10 flex items-center gap-3">
                    <Brain className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="font-semibold">{stats.avgStress.toFixed(1)}/5</p>
                      <p className="text-xs text-muted-foreground">{t.stress}</p>
                    </div>
                  </div>
                )}
                
                {stats?.avgSleep && (
                  <div className="p-3 rounded-xl bg-indigo-500/10 flex items-center gap-3">
                    <Moon className="w-5 h-5 text-indigo-500" />
                    <div>
                      <p className="font-semibold">{stats.avgSleep.toFixed(1)}/5</p>
                      <p className="text-xs text-muted-foreground">{t.sleep}</p>
                    </div>
                  </div>
                )}
                
                {stats?.avgEnergy && (
                  <div className="col-span-2 p-3 rounded-xl bg-emerald-500/10 flex items-center gap-3">
                    <Zap className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="font-semibold">{stats.avgEnergy.toFixed(1)}/5</p>
                      <p className="text-xs text-muted-foreground">{t.energy}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Trends */}
              {(stats?.stressTrend || stats?.sleepTrend) && (
                <div className="px-6 pb-4">
                  <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    {t.trends}
                  </h3>
                  <div className="space-y-2">
                    {getStressTrendMessage() && (
                      <p className="text-sm p-3 rounded-xl bg-secondary">{getStressTrendMessage()}</p>
                    )}
                    {getSleepTrendMessage() && (
                      <p className="text-sm p-3 rounded-xl bg-secondary">{getSleepTrendMessage()}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Encouragement */}
              <div className="px-6 pb-4">
                <p className="text-sm text-center text-muted-foreground italic">{t.encouragement}</p>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-2">
                <Button onClick={onClose} className="w-full" size="lg">
                  {t.gotIt}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
