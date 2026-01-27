import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, subMonths, addMonths } from 'date-fns';
import { getDailyCheckins, getUserProfile } from '@/lib/storage';
import { DailyCheckin, UserProfile, LEVELS, getStageDescription } from '@/lib/types';
import { ArrowLeft, ChevronLeft, ChevronRight, Check, Minus, Award, BookOpen } from 'lucide-react';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Button } from '@/components/ui/button';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { useLanguage } from '@/hooks/useLanguage';

export const ProgressPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    setProfile(getUserProfile());
    setCheckins(getDailyCheckins());
  }, []);

  if (!profile) return null;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getCheckinForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return checkins.find(c => c.date === dateStr);
  };

  const currentLevel = LEVELS.find(l => profile.totalPoints >= l.minPoints && profile.totalPoints <= l.maxPoints) || LEVELS[0];
  const nextLevel = LEVELS[currentLevel.level] || currentLevel;
  const levelProgress = currentLevel.level < 10 
    ? ((profile.totalPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with Back Button */}
      <header className="px-6 pt-8 pb-4 bg-card border-b border-border">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground mb-4 min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('common.back')}</span>
        </button>
        <h1 className="text-3xl font-heading font-bold">{t('progress.title')}</h1>
      </header>

      <main className="px-6 py-6 space-y-6">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4"
        >
          <div className="p-4 rounded-xl bg-card border-2 border-border text-center">
            <p className="text-3xl font-bold text-primary">{profile.totalCheckins}</p>
            <p className="text-sm text-muted-foreground">Check-ins</p>
          </div>
          <div className="p-4 rounded-xl bg-card border-2 border-border text-center">
            <p className="text-3xl font-bold text-accent-foreground">{profile.totalActivityCompletions}</p>
            <p className="text-sm text-muted-foreground">Activities</p>
          </div>
          <div className="p-4 rounded-xl bg-card border-2 border-border text-center">
            <p className="text-3xl font-bold text-success">{profile.longestStreak}</p>
            <p className="text-sm text-muted-foreground">Best Streak</p>
          </div>
        </motion.div>

        {/* Level Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl border-2 border-border bg-card"
        >
          <h2 className="font-heading font-semibold mb-4">{t('dashboard.level')} Progress</h2>
          <div className="flex items-center gap-6">
            <ProgressRing progress={levelProgress} size={100} strokeWidth={8}>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{currentLevel.level}</p>
              </div>
            </ProgressRing>
            <div className="flex-1">
              <p className="font-heading font-bold text-xl">{currentLevel.name}</p>
              <p className="text-muted-foreground">{profile.totalPoints} {t('dashboard.points')}</p>
              {currentLevel.level < 10 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {nextLevel.minPoints - profile.totalPoints} points to {nextLevel.name}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-6 rounded-2xl gradient-primary text-primary-foreground"
        >
          <p className="text-sm opacity-80">{t('dashboard.stage')}</p>
          <p className="text-2xl font-heading font-bold capitalize">{profile.currentStage}</p>
          <p className="text-sm opacity-80 mt-1">{getStageDescription(profile.currentStage)}</p>
        </motion.div>

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl border-2 border-border bg-card"
        >
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-secondary min-h-[44px] min-w-[44px] flex items-center justify-center">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-heading font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-secondary min-h-[44px] min-w-[44px] flex items-center justify-center">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs text-muted-foreground font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            
            {daysInMonth.map((day) => {
              const checkin = getCheckinForDate(day);
              const isPast = day < new Date() && !isToday(day);
              
              return (
                <div
                  key={day.toISOString()}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm ${
                    isToday(day) ? 'ring-2 ring-primary' : ''
                  } ${
                    checkin?.checkinCompleted
                      ? checkin.activityCompleted
                        ? 'bg-success/20 text-success'
                        : 'bg-warning/20 text-warning'
                      : isPast
                        ? 'bg-destructive/10 text-destructive/50'
                        : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {checkin?.checkinCompleted ? (
                    checkin.activityCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Minus className="w-4 h-4" />
                    )
                  ) : (
                    format(day, 'd')
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-success/20" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-warning/20" />
              <span>Checked in</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-destructive/10" />
              <span>Missed</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-2 gap-4"
        >
          <Button
            variant="outline"
            onClick={() => navigate('/badges')}
            className="h-auto py-4 flex flex-col gap-2"
          >
            <Award className="w-6 h-6 text-primary" />
            <span>Badges</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/habit-library')}
            className="h-auto py-4 flex flex-col gap-2"
          >
            <BookOpen className="w-6 h-6 text-primary" />
            <span>Habit Library</span>
          </Button>
        </motion.div>
      </main>

      <BottomNavigation />
    </div>
  );
};
