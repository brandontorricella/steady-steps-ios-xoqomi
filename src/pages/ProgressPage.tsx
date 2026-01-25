import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay, subMonths, addMonths } from 'date-fns';
import { getDailyCheckins, getUserProfile } from '@/lib/storage';
import { DailyCheckin, UserProfile, LEVELS, getStageDescription } from '@/lib/types';
import { ChevronLeft, ChevronRight, Check, X, Minus } from 'lucide-react';
import { ProgressRing } from '@/components/ui/progress-ring';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';

export const ProgressPage = () => {
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
      {/* Header */}
      <header className="px-6 pt-8 pb-4 bg-card border-b border-border">
        <h1 className="text-3xl font-heading font-bold">Your Progress</h1>
      </header>

      <main className="px-6 space-y-6">
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
            <p className="text-3xl font-bold text-accent">{profile.totalActivityCompletions}</p>
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
          <h2 className="font-heading font-semibold mb-4">Level Progress</h2>
          <div className="flex items-center gap-6">
            <ProgressRing progress={levelProgress} size={100} strokeWidth={8}>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{currentLevel.level}</p>
              </div>
            </ProgressRing>
            <div className="flex-1">
              <p className="font-heading font-bold text-xl">{currentLevel.name}</p>
              <p className="text-muted-foreground">{profile.totalPoints} points</p>
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
          <p className="text-sm opacity-80">Current Stage</p>
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
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-secondary">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-heading font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-secondary">
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
      </main>
    </div>
  );
};
