import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Button } from '@/components/ui/button';
import { UserProfile, LEVELS, getStageDescription } from '@/lib/types';
import { getUserProfile, getTodayCheckin, getWeeklyStats } from '@/lib/storage';
import { Flame, Trophy, Check, Settings2 } from 'lucide-react';
import { DailyCheckinFlow } from './DailyCheckinFlow';
import { DailyTipCard } from './DailyTipCard';
import { CoachTipCard } from './CoachTipCard';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { MicroLessons, MicroLessonCard } from '@/components/education/MicroLessons';
import { FlexibleProgress } from '@/components/habits/FlexibleProgress';
import { QuickHabitLog } from '@/components/habits/QuickHabitLog';
import { CommunityNudge } from '@/components/feedback/CommunityNudge';
import { useLanguage } from '@/hooks/useLanguage';

export const Dashboard = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showCheckin, setShowCheckin] = useState(false);
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [showMicroLessons, setShowMicroLessons] = useState(false);
  const [showFlexibleProgress, setShowFlexibleProgress] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const userProfile = getUserProfile();
    if (userProfile) {
      setProfile(userProfile);
      const todayCheckin = getTodayCheckin();
      setTodayCompleted(todayCheckin?.checkinCompleted || false);
    }
  }, [showCheckin]);

  if (!profile) return null;

  const currentLevel = LEVELS.find(l => profile.totalPoints >= l.minPoints && profile.totalPoints <= l.maxPoints) || LEVELS[0];
  const nextLevel = LEVELS[currentLevel.level] || currentLevel;
  const levelProgress = currentLevel.level < 10 
    ? ((profile.totalPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;

  const weeklyStats = getWeeklyStats();
  const weeklyProgress = (weeklyStats.checkins / 7) * 100;

  if (showCheckin) {
    return <DailyCheckinFlow profile={profile} onComplete={() => setShowCheckin(false)} />;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return language === 'en' ? 'Good morning' : 'Buenos días';
    if (hour < 17) return language === 'en' ? 'Good afternoon' : 'Buenas tardes';
    return language === 'en' ? 'Good evening' : 'Buenas noches';
  };

  const texts = {
    en: {
      currentStreak: 'Current Streak',
      longest: 'Longest',
      days: 'days',
      checkIn: "Complete Today's Check-in",
      checkInComplete: "Today's check-in complete!",
      checkInDesc: 'Great job showing up today',
      thisWeek: 'This Week',
      activities: 'activities',
      nutritionHabits: 'nutrition habits',
      level: 'Level',
      points: 'points',
      stage: 'Stage',
      adjustGoals: 'Adjust Goals',
    },
    es: {
      currentStreak: 'Racha Actual',
      longest: 'Más larga',
      days: 'días',
      checkIn: 'Completa Tu Registro de Hoy',
      checkInComplete: '¡Registro de hoy completado!',
      checkInDesc: 'Excelente trabajo al presentarte hoy',
      thisWeek: 'Esta Semana',
      activities: 'actividades',
      nutritionHabits: 'hábitos de nutrición',
      level: 'Nivel',
      points: 'puntos',
      stage: 'Etapa',
      adjustGoals: 'Ajustar Metas',
    },
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 bg-card border-b border-border">
        <p className="text-muted-foreground text-sm">{format(new Date(), 'EEEE, MMMM d')}</p>
        <h1 className="text-2xl font-heading font-bold">{getGreeting()}, {profile.firstName}</h1>
      </header>

      {/* Main Content */}
      <main className="px-6 space-y-6 mt-6">
        {/* Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl gradient-primary text-primary-foreground"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Flame className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm opacity-80">{t.currentStreak}</p>
                <p className="text-4xl font-bold">{profile.currentStreak}</p>
                <p className="text-sm opacity-80">{t.days}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">{t.longest}</p>
              <p className="text-xl font-semibold">{profile.longestStreak} {t.days}</p>
            </div>
          </div>
        </motion.div>

        {/* Community Nudge - shown before check-in */}
        {!todayCompleted && (
          <CommunityNudge habitType="checkin" isVisible={true} />
        )}

        {/* Daily Check-in Button */}
        {!todayCompleted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Button 
              size="lg" 
              onClick={() => setShowCheckin(true)}
              className="w-full py-8 text-lg font-semibold rounded-2xl"
            >
              <Check className="w-6 h-6 mr-2" />
              {t.checkIn}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl border-2 border-success/30 bg-success/5"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                <Check className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="font-semibold text-success">{t.checkInComplete}</p>
                <p className="text-sm text-muted-foreground">{t.checkInDesc}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Habit Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <QuickHabitLog />
        </motion.div>

        {/* Weekly Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl border-2 border-border bg-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold">{t.thisWeek}</h3>
            <span className="text-sm text-muted-foreground">{weeklyStats.checkins}/7 {t.days}</span>
          </div>
          <div className="h-3 rounded-full bg-secondary overflow-hidden">
            <motion.div 
              className="h-full gradient-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${weeklyProgress}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-4 text-sm text-muted-foreground">
            <span>{weeklyStats.activityCompletions} {t.activities}</span>
            <span>{weeklyStats.nutritionScore} {t.nutritionHabits}</span>
          </div>
        </motion.div>

        {/* Level & Stage with Adjust Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl border-2 border-border bg-card"
        >
          <div className="flex items-center gap-6">
            <ProgressRing progress={levelProgress} size={80} strokeWidth={6}>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{currentLevel.level}</p>
              </div>
            </ProgressRing>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{t.level}</p>
              <p className="font-heading font-bold text-lg">{currentLevel.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{profile.totalPoints} {t.points}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium capitalize">{profile.currentStage} {t.stage}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{getStageDescription(profile.currentStage)}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFlexibleProgress(true)}
              className="text-primary"
            >
              <Settings2 className="w-4 h-4 mr-1" />
              {t.adjustGoals}
            </Button>
          </div>
        </motion.div>

        {/* Micro Lesson Card */}
        <MicroLessonCard onOpen={() => setShowMicroLessons(true)} />

        {/* Coach Tip Card */}
        <CoachTipCard />

        {/* Daily Tip Card */}
        <DailyTipCard />
      </main>

      <BottomNavigation />

      {/* Micro Lessons Modal */}
      <MicroLessons isOpen={showMicroLessons} onClose={() => setShowMicroLessons(false)} />

      {/* Flexible Progress Modal */}
      <FlexibleProgress
        isOpen={showFlexibleProgress}
        onClose={() => setShowFlexibleProgress(false)}
        profile={profile}
        onProfileUpdate={setProfile}
      />
    </div>
  );
};
