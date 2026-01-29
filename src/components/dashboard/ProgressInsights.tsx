import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Sparkles, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Insight {
  id: string;
  type: 'positive' | 'neutral' | 'encouragement';
  message: string;
  icon: string;
}

export const ProgressInsights = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyzeProgress = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Get last 14 days of check-ins
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const { data: checkins } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', twoWeeksAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      const generatedInsights: Insight[] = [];

      if (checkins && checkins.length >= 3) {
        const recent = checkins.slice(-7);
        const older = checkins.slice(0, 7);

        // Analyze stress trends
        const recentStress = recent.filter(c => c.stress_level).map(c => c.stress_level as number);
        const olderStress = older.filter(c => c.stress_level).map(c => c.stress_level as number);
        
        if (recentStress.length >= 3 && olderStress.length >= 3) {
          const recentAvg = recentStress.reduce((a, b) => a + b, 0) / recentStress.length;
          const olderAvg = olderStress.reduce((a, b) => a + b, 0) / olderStress.length;
          
          if (recentAvg < olderAvg - 0.5) {
            generatedInsights.push({
              id: 'stress_down',
              type: 'positive',
              message: language === 'en' 
                ? '📉 Your stress levels are improving! Keep up the good work.'
                : '📉 ¡Tus niveles de estrés están mejorando! Sigue así.',
              icon: '😌',
            });
          }
        }

        // Analyze sleep trends
        const recentSleep = recent.filter(c => c.sleep_quality).map(c => c.sleep_quality as number);
        const olderSleep = older.filter(c => c.sleep_quality).map(c => c.sleep_quality as number);
        
        if (recentSleep.length >= 3 && olderSleep.length >= 3) {
          const recentAvg = recentSleep.reduce((a, b) => a + b, 0) / recentSleep.length;
          const olderAvg = olderSleep.reduce((a, b) => a + b, 0) / olderSleep.length;
          
          if (recentAvg > olderAvg + 0.5) {
            generatedInsights.push({
              id: 'sleep_up',
              type: 'positive',
              message: language === 'en' 
                ? '😴 Your sleep quality is getting better! This helps everything else.'
                : '😴 ¡Tu calidad de sueño está mejorando! Esto ayuda a todo lo demás.',
              icon: '🌙',
            });
          }
        }

        // Analyze consistency
        const weekCheckins = recent.filter(c => c.checkin_completed).length;
        if (weekCheckins >= 5) {
          generatedInsights.push({
            id: 'consistency',
            type: 'positive',
            message: language === 'en' 
              ? '🔥 You\'ve been really consistent this week! That\'s building real habits.'
              : '🔥 ¡Has sido muy consistente esta semana! Eso está construyendo hábitos reales.',
            icon: '💪',
          });
        }

        // Analyze activity completion
        const activityRate = recent.filter(c => c.activity_completed).length / Math.max(recent.length, 1);
        if (activityRate >= 0.7) {
          generatedInsights.push({
            id: 'activity_strong',
            type: 'positive',
            message: language === 'en' 
              ? '🏃‍♀️ You\'re crushing your movement goals! Your body thanks you.'
              : '🏃‍♀️ ¡Estás superando tus metas de movimiento! Tu cuerpo te lo agradece.',
            icon: '⭐',
          });
        }
      }

      // Default encouraging insights if no data-driven ones
      if (generatedInsights.length === 0) {
        generatedInsights.push({
          id: 'keep_going',
          type: 'encouragement',
          message: language === 'en' 
            ? '✨ Keep logging daily! Insights will appear as we learn your patterns.'
            : '✨ ¡Sigue registrando diariamente! Los insights aparecerán mientras aprendemos tus patrones.',
          icon: '📊',
        });
      }

      setInsights(generatedInsights);
      setLoading(false);
    };

    analyzeProgress();
  }, [user, language]);

  if (loading || insights.length === 0) return null;

  const currentInsight = insights[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % insights.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium text-primary">
          {language === 'en' ? 'Progress Insight' : 'Insight de Progreso'}
        </span>
        {insights.length > 1 && (
          <span className="text-xs text-muted-foreground ml-auto">
            {currentIndex + 1}/{insights.length}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentInsight.id}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="flex items-center gap-3"
        >
          <span className="text-2xl">{currentInsight.icon}</span>
          <p className="text-sm flex-1">{currentInsight.message}</p>
          {insights.length > 1 && (
            <button
              onClick={handleNext}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
