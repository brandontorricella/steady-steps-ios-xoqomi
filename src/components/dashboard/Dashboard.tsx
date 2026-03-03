import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isMonday } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Button } from '@/components/ui/button';
import { UserProfile, LEVELS, getStageDescription } from '@/lib/types';
import { getUserProfile, getTodayCheckin, getWeeklyStats, saveUserProfile } from '@/lib/storage';
import { Flame, Trophy, Check, Settings2, CalendarDays, Sparkles, Heart } from 'lucide-react';
import { DailyCheckinFlow } from './DailyCheckinFlow';
import { BadDayFlow } from './BadDayFlow';
import { GraceDaysCard } from './GraceDaysCard';
import { WhyReminder } from './WhyReminder';
import { WhyEditorModal } from './WhyEditorModal';
import { DailyTipCard } from './DailyTipCard';
import { CoachTipCard } from './CoachTipCard';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { MicroLessons, MicroLessonCard } from '@/components/education/MicroLessons';
import { FlexibleProgress } from '@/components/habits/FlexibleProgress';
import { QuickHabitLog } from '@/components/habits/QuickHabitLog';
import { CommunityNudge } from '@/components/feedback/CommunityNudge';
import { WellnessWidget } from './WellnessWidget';
import { ProgressInsights } from './ProgressInsights';
import { WeeklyReflectionModal } from './WeeklyReflectionModal';
import { NotBehindBanner } from './NotBehindBanner';
import { useNotificationLogic } from '@/components/notifications/NotificationLogic';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showCheckin, setShowCheckin] = useState(false);
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [showMicroLessons, setShowMicroLessons] = useState(false);
  const [showFlexibleProgress, setShowFlexibleProgress] = useState(false);
  const [showWeeklyReflection, setShowWeeklyReflection] = useState(false);
  const [graceDayMessage, setGraceDayMessage] = useState<string | null>(null);
  const [showWhyReminder, setShowWhyReminder] = useState(false);
  const [showWhyEditor, setShowWhyEditor] = useState(false);
  const [showBadDay, setShowBadDay] = useState(false);
  const { language } = useLanguage();
  const { notification } = useNotificationLogic();

  // Check if we should show weekly reflection (Monday, first login of the week)
  useEffect(() => {
    const checkWeeklyReflection = async () => {
      if (!user) return;
      
      const today = new Date();
      if (isMonday(today)) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('last_weekly_summary_date')
          .eq('id', user.id)
          .single();
        
        const lastSummary = profileData?.last_weekly_summary_date;
        const todayStr = today.toISOString().split('T')[0];
        
        // Show if no summary this week or last summary was before this Monday
        if (!lastSummary || lastSummary < todayStr) {
          setShowWeeklyReflection(true);
        }
      }
    };
    
    checkWeeklyReflection();
  }, [user]);

  useEffect(() => {
    const userProfile = getUserProfile();
    if (userProfile) {
      // Reset grace days on 1st of the month
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const currentMonth = todayStr.substring(0, 7); // YYYY-MM
      const lastResetMonth = userProfile.graceDaysLastReset?.substring(0, 7);
      
      if (lastResetMonth !== currentMonth) {
        userProfile.graceDaysRemaining = 3;
        userProfile.graceDaysLastReset = todayStr;
        userProfile.graceDaysUsedDates = userProfile.graceDaysUsedDates.filter(
          d => d.substring(0, 7) === currentMonth
        );
        saveUserProfile(userProfile);
        if (user) {
          supabase.from('profiles').update({
            grace_days_remaining: 3,
            grace_days_last_reset: todayStr,
            grace_days_used_dates: [],
          }).eq('id', user.id).then(() => {});
        }
      }

      // Check if streak should be reset (no check-in yesterday or today)
      if (userProfile.lastCheckinDate) {
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const lastCheckin = new Date(userProfile.lastCheckinDate + 'T00:00:00');
        
        if (lastCheckin < yesterday && userProfile.currentStreak > 0) {
          // Count missed days between lastCheckin and yesterday
          const missedDays = Math.floor((yesterday.getTime() - lastCheckin.getTime()) / (1000 * 60 * 60 * 24));
          
          if (missedDays <= userProfile.graceDaysRemaining) {
            // Use grace days to protect streak
            const usedDates: string[] = [];
            for (let i = 1; i <= missedDays; i++) {
              const missedDate = new Date(lastCheckin);
              missedDate.setDate(missedDate.getDate() + i);
              usedDates.push(missedDate.toISOString().split('T')[0]);
            }
            
            userProfile.graceDaysRemaining -= missedDays;
            userProfile.graceDaysUsedDates = [
              ...userProfile.graceDaysUsedDates,
              ...usedDates,
            ];
            saveUserProfile(userProfile);
            
            setGraceDayMessage(
              language === 'en'
                ? `We used ${missedDays} grace day${missedDays > 1 ? 's' : ''} to protect your streak 💚\nGrace days remaining: ${userProfile.graceDaysRemaining}/3`
                : `Usamos ${missedDays} día${missedDays > 1 ? 's' : ''} de gracia para proteger tu racha 💚\nDías de gracia restantes: ${userProfile.graceDaysRemaining}/3`
            );
            
            if (user) {
              supabase.from('profiles').update({
                grace_days_remaining: userProfile.graceDaysRemaining,
                grace_days_used_dates: userProfile.graceDaysUsedDates,
              }).eq('id', user.id).then(() => {});
            }
          } else {
            // Not enough grace days — reset streak
            userProfile.streakAtLoss = userProfile.currentStreak;
            userProfile.currentStreak = 0;
            saveUserProfile(userProfile);
            
            if (user) {
              supabase.from('profiles').update({
                current_streak: 0,
                streak_at_loss: userProfile.streakAtLoss,
              }).eq('id', user.id).then(() => {});
            }
          }
        }
      }
      
      // Show "Why" reminder if 2+ days since last check-in and user has a why
      if (userProfile.whyText && userProfile.lastCheckinDate) {
        const daysSinceCheckin = Math.floor(
          (new Date().setHours(0,0,0,0) - new Date(userProfile.lastCheckinDate + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceCheckin >= 2) {
          setShowWhyReminder(true);
        }
      }

      setProfile(userProfile);
      const todayCheckin = getTodayCheckin();
      setTodayCompleted(todayCheckin?.checkinCompleted || false);
    }
  }, [showCheckin, user, language]);

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
      weeklySummary: 'Weekly Summary',
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
      weeklySummary: 'Resumen Semanal',
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
        {/* Gentle Notification Banner */}
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-secondary to-accent/10 border border-border"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <p className="text-sm">{notification.message}</p>
            </div>
          </motion.div>
        )}

        {/* Not Behind Banner */}
        <NotBehindBanner />

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

        {/* Grace Days */}
        <div className="flex items-center justify-between">
          <GraceDaysCard
            remaining={profile.graceDaysRemaining}
            message={graceDayMessage}
            onDismissMessage={() => setGraceDayMessage(null)}
          />
        </div>

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

        {/* Progress Insights */}
        <ProgressInsights />

        {/* Wellness Widget */}
        <WellnessWidget />

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
          <Button
            variant="outline"
            onClick={() => navigate('/weekly-summary')}
            className="w-full mt-4"
          >
            <CalendarDays className="w-4 h-4 mr-2" />
            {t.weeklySummary}
          </Button>
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

      {/* Weekly Reflection Modal (shown on Mondays) */}
      <WeeklyReflectionModal
        isOpen={showWeeklyReflection}
        onClose={() => setShowWeeklyReflection(false)}
      />

      {/* Why Reminder Modal */}
      {profile.whyText && (
        <WhyReminder
          whyText={profile.whyText}
          isVisible={showWhyReminder}
          onClose={() => setShowWhyReminder(false)}
          onEdit={() => {
            setShowWhyReminder(false);
            setShowWhyEditor(true);
          }}
        />
      )}

      {/* Why Editor Modal */}
      <WhyEditorModal
        isOpen={showWhyEditor}
        currentText={profile.whyText}
        onSave={(text) => {
          const updated = { ...profile, whyText: text, whyCreatedAt: new Date().toISOString() };
          setProfile(updated);
          saveUserProfile(updated);
          if (user) {
            supabase.from('profiles').update({
              why_text: text,
              why_created_at: new Date().toISOString(),
            }).eq('id', user.id).then(() => {});
          }
        }}
        onClose={() => setShowWhyEditor(false)}
      />
    </div>
  );
};
