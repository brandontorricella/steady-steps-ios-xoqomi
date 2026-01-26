import { motion } from 'framer-motion';
import { ArrowLeft, Check, Activity, Utensils, Smile, Flame, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { getUserProfile, getWeeklyStats, getDailyCheckins } from '@/lib/storage';
import { getMoodEmoji } from '@/lib/types';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';

export const WeeklySummaryPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const profile = getUserProfile();
  const weeklyStats = getWeeklyStats();
  const checkins = getDailyCheckins();

  // Calculate mood data
  const weekCheckins = checkins.slice(-7);
  const moodCounts: Record<string, number> = {};
  weekCheckins.forEach(c => {
    if (c.mood) {
      moodCounts[c.mood] = (moodCounts[c.mood] || 0) + 1;
    }
  });
  const mostCommonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'good';

  const getShowingUpMessage = (days: number) => {
    if (days === 7) return 'You showed up every single day this week. That is incredible.';
    if (days >= 5) return `You checked in ${days} days this week. That is real commitment.`;
    if (days >= 3) return `You made it ${days} days. Every day counts.`;
    if (days >= 1) return `You checked in this week. That is a start to build on.`;
    return 'This week was tough. But you are here now, and that matters.';
  };

  const getActivityMessage = (rate: number) => {
    if (rate >= 80) return 'Your movement game was strong this week.';
    if (rate >= 50) return 'You got moving this week. Every bit matters.';
    return 'Movement was tough this week. Next week is a fresh start.';
  };

  const activityRate = weeklyStats.checkins > 0 
    ? (weeklyStats.activityCompletions / weeklyStats.checkins) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-8 pb-4 bg-card border-b border-border">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground mb-4 min-h-[44px] min-w-[44px]">
          <ArrowLeft className="w-5 h-5" />
          <span>{t('common.back')}</span>
        </button>
        <h1 className="text-3xl font-heading font-bold">{t('weeklySummary.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('weeklySummary.subtitle')}</p>
      </header>

      <main className="px-6 py-6 space-y-4">
        {/* Showing Up */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl gradient-coral"
        >
          <div className="flex items-center gap-3 mb-2">
            <Check className="w-5 h-5 text-accent-foreground" />
            <h3 className="font-heading font-semibold text-accent-foreground">{t('weeklySummary.showingUp')}</h3>
          </div>
          <p className="text-foreground">{getShowingUpMessage(weeklyStats.checkins)}</p>
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
            <h3 className="font-heading font-semibold">{t('weeklySummary.movement')}</h3>
          </div>
          <p className="text-foreground">{getActivityMessage(activityRate)}</p>
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
            <h3 className="font-heading font-semibold">{t('weeklySummary.nutritionHabits')}</h3>
          </div>
          <p className="text-foreground">
            You completed {weeklyStats.nutritionScore} nutrition habits this week. You made mindful choices.
          </p>
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
            <h3 className="font-heading font-semibold">{t('weeklySummary.howYouFelt')}</h3>
          </div>
          <p className="text-foreground">
            You mostly felt {getMoodEmoji(mostCommonMood as any)} {mostCommonMood} this week.
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
            <h3 className="font-heading font-semibold text-gold-foreground">{profile?.currentStreak || 0} {t('dashboard.days')}</h3>
          </div>
          <p className="text-foreground">
            {(profile?.currentStreak || 0) > 0 
              ? `${profile?.currentStreak} days and counting. You are building something real.`
              : 'Fresh start this week. You are back.'
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
            <h3 className="font-heading font-semibold text-primary-foreground">{t('weeklySummary.thisWeek')}</h3>
          </div>
          <p className="text-primary-foreground">
            Try to get one extra day of movement this week.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="pt-4"
        >
          <Button size="lg" className="w-full py-6" onClick={() => navigate('/')}>
            {t('weeklySummary.gotIt')}
          </Button>
        </motion.div>
      </main>
      <BottomNavigation />
    </div>
  );
};
