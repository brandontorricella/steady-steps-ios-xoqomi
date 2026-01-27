import { motion } from 'framer-motion';
import { ArrowLeft, Check, Activity, Utensils, Smile, Flame, Target, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { getUserProfile, getWeeklyStats, getDailyCheckins } from '@/lib/storage';
import { getMoodEmoji, Mood } from '@/lib/types';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { Confetti } from '@/components/ui/confetti';
import { useState, useEffect } from 'react';

export const WeeklySummaryPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const profile = getUserProfile();
  const weeklyStats = getWeeklyStats();
  const checkins = getDailyCheckins();
  const [showConfetti, setShowConfetti] = useState(false);

  // Calculate mood data
  const weekCheckins = checkins.slice(-7);
  const moodCounts: Record<string, number> = {};
  weekCheckins.forEach(c => {
    if (c.mood) {
      moodCounts[c.mood] = (moodCounts[c.mood] || 0) + 1;
    }
  });
  const mostCommonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'good';

  // Show confetti for great weeks
  useEffect(() => {
    if (weeklyStats.checkins >= 5) {
      setTimeout(() => setShowConfetti(true), 500);
    }
  }, [weeklyStats.checkins]);

  const activityRate = weeklyStats.checkins > 0 
    ? (weeklyStats.activityCompletions / weeklyStats.checkins) * 100 
    : 0;

  const texts = {
    en: {
      title: 'Your Week in Review',
      subtitle: 'Here is how you showed up for yourself',
      showingUp: 'Showing Up',
      movement: 'Movement',
      nutritionHabits: 'Nutrition Habits',
      howYouFelt: 'How You Felt',
      streak: 'Streak',
      lookAhead: 'This Week',
      gotIt: 'Got It',
      days: 'days',
      daysChecked: 'days checked in',
      nutritionCompleted: 'nutrition habits completed',
      mostlyFelt: 'You mostly felt',
      thisWeek: 'this week',
      showingUpMessages: {
        perfect: 'You showed up every single day this week. That is incredible! 🌟',
        great: `You checked in ${weeklyStats.checkins} days this week. That is real commitment!`,
        good: `You made it ${weeklyStats.checkins} days. Every day counts.`,
        start: `You checked in this week. That is a start to build on.`,
        fresh: 'This week was tough. But you are here now, and that matters.',
      },
      activityMessages: {
        strong: 'Your movement game was strong this week! 💪',
        solid: 'You got moving this week. Every bit matters.',
        fresh: 'Movement was tough this week. Next week is a fresh start.',
      },
      nutritionMessage: `You completed ${weeklyStats.nutritionScore} nutrition habits. Mindful choices add up!`,
      streakMessages: {
        counting: `${profile?.currentStreak || 0} days and counting. You are building something real.`,
        fresh: 'Fresh start this week. You are back.',
      },
      lookAheadMessage: 'Try to get one extra day of movement this week.',
      celebration: 'Amazing week! Keep it up! 🎉',
    },
    es: {
      title: 'Tu Semana en Resumen',
      subtitle: 'Así te presentaste para ti misma',
      showingUp: 'Presentándote',
      movement: 'Movimiento',
      nutritionHabits: 'Hábitos de Nutrición',
      howYouFelt: 'Cómo Te Sentiste',
      streak: 'Racha',
      lookAhead: 'Esta Semana',
      gotIt: 'Entendido',
      days: 'días',
      daysChecked: 'días registrados',
      nutritionCompleted: 'hábitos de nutrición completados',
      mostlyFelt: 'Mayormente te sentiste',
      thisWeek: 'esta semana',
      showingUpMessages: {
        perfect: '¡Te presentaste todos los días esta semana. Eso es increíble! 🌟',
        great: `Te registraste ${weeklyStats.checkins} días esta semana. ¡Eso es compromiso real!`,
        good: `Lograste ${weeklyStats.checkins} días. Cada día cuenta.`,
        start: `Te registraste esta semana. Es un comienzo para construir.`,
        fresh: 'Esta semana fue difícil. Pero estás aquí ahora, y eso importa.',
      },
      activityMessages: {
        strong: '¡Tu movimiento fue fuerte esta semana! 💪',
        solid: 'Te moviste esta semana. Cada momento cuenta.',
        fresh: 'El movimiento fue difícil esta semana. La próxima es un nuevo comienzo.',
      },
      nutritionMessage: `Completaste ${weeklyStats.nutritionScore} hábitos de nutrición. ¡Las elecciones conscientes suman!`,
      streakMessages: {
        counting: `${profile?.currentStreak || 0} días y contando. Estás construyendo algo real.`,
        fresh: 'Nuevo comienzo esta semana. Estás de vuelta.',
      },
      lookAheadMessage: 'Intenta conseguir un día extra de movimiento esta semana.',
      celebration: '¡Semana increíble! ¡Sigue así! 🎉',
    },
  };

  const t = texts[language];

  const moodLabels = {
    en: { great: 'great', good: 'good', okay: 'okay', stressed: 'stressed', tired: 'tired' },
    es: { great: 'muy bien', good: 'bien', okay: 'regular', stressed: 'estresada', tired: 'cansada' },
  };

  const getShowingUpMessage = () => {
    if (weeklyStats.checkins === 7) return t.showingUpMessages.perfect;
    if (weeklyStats.checkins >= 5) return t.showingUpMessages.great;
    if (weeklyStats.checkins >= 3) return t.showingUpMessages.good;
    if (weeklyStats.checkins >= 1) return t.showingUpMessages.start;
    return t.showingUpMessages.fresh;
  };

  const getActivityMessage = () => {
    if (activityRate >= 80) return t.activityMessages.strong;
    if (activityRate >= 50) return t.activityMessages.solid;
    return t.activityMessages.fresh;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Confetti isActive={showConfetti} />
      
      <header className="px-6 pt-8 pb-4 bg-card border-b border-border">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground mb-4 min-h-[44px] min-w-[44px]">
          <ArrowLeft className="w-5 h-5" />
          <span>{language === 'en' ? 'Back' : 'Atrás'}</span>
        </button>
        <h1 className="text-3xl font-heading font-bold">{t.title}</h1>
        <p className="text-muted-foreground mt-1">{t.subtitle}</p>
      </header>

      <main className="px-6 py-6 space-y-4">
        {/* Celebration banner for great weeks */}
        {weeklyStats.checkins >= 5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl gradient-gold text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-gold-foreground" />
              <span className="font-heading font-bold text-gold-foreground">{t.celebration}</span>
              <Sparkles className="w-5 h-5 text-gold-foreground" />
            </div>
          </motion.div>
        )}

        {/* Showing Up */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl gradient-coral"
        >
          <div className="flex items-center gap-3 mb-2">
            <Check className="w-5 h-5 text-accent-foreground" />
            <h3 className="font-heading font-semibold text-accent-foreground">{t.showingUp}</h3>
          </div>
          <p className="text-foreground">{getShowingUpMessage()}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {weeklyStats.checkins}/7 {t.daysChecked}
          </p>
        </motion.div>

        {/* Movement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl bg-primary/10 border border-primary/20"
        >
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-semibold">{t.movement}</h3>
          </div>
          <p className="text-foreground">{getActivityMessage()}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {weeklyStats.activityCompletions}/{weeklyStats.checkins} {language === 'en' ? 'days with activity' : 'días con actividad'}
          </p>
        </motion.div>

        {/* Nutrition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-2xl bg-success/10 border border-success/20"
        >
          <div className="flex items-center gap-3 mb-2">
            <Utensils className="w-5 h-5 text-success" />
            <h3 className="font-heading font-semibold">{t.nutritionHabits}</h3>
          </div>
          <p className="text-foreground">{t.nutritionMessage}</p>
        </motion.div>

        {/* Mood */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 rounded-2xl bg-dusty-rose border border-dusty-rose/50"
        >
          <div className="flex items-center gap-3 mb-2">
            <Smile className="w-5 h-5 text-dusty-rose-foreground" />
            <h3 className="font-heading font-semibold">{t.howYouFelt}</h3>
          </div>
          <p className="text-foreground">
            {t.mostlyFelt} {getMoodEmoji(mostCommonMood as Mood)} {moodLabels[language][mostCommonMood as Mood] || mostCommonMood} {t.thisWeek}.
          </p>
        </motion.div>

        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-5 rounded-2xl gradient-gold"
        >
          <div className="flex items-center gap-3 mb-2">
            <Flame className="w-5 h-5 text-gold-foreground" />
            <h3 className="font-heading font-semibold text-gold-foreground">{profile?.currentStreak || 0} {t.days}</h3>
          </div>
          <p className="text-foreground">
            {(profile?.currentStreak || 0) > 0 
              ? t.streakMessages.counting
              : t.streakMessages.fresh
            }
          </p>
        </motion.div>

        {/* Look Ahead */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-5 rounded-2xl gradient-primary"
        >
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-primary-foreground" />
            <h3 className="font-heading font-semibold text-primary-foreground">{t.lookAhead}</h3>
          </div>
          <p className="text-primary-foreground">
            {t.lookAheadMessage}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="pt-4"
        >
          <Button size="lg" className="w-full py-6" onClick={() => navigate('/')}>
            {t.gotIt}
          </Button>
        </motion.div>
      </main>
      <BottomNavigation />
    </div>
  );
};
