import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Button } from '@/components/ui/button';
import { UserProfile, LEVELS, getStageDescription } from '@/lib/types';
import { getUserProfile, getTodayCheckin, getWeeklyStats } from '@/lib/storage';
import { Flame, Trophy, Check } from 'lucide-react';
import { DailyCheckinFlow } from './DailyCheckinFlow';
import { DailyTipCard } from './DailyTipCard';
import { CoachTipCard } from './CoachTipCard';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';

export const Dashboard = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showCheckin, setShowCheckin] = useState(false);
  const [todayCompleted, setTodayCompleted] = useState(false);

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
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 bg-card border-b border-border">
        <p className="text-muted-foreground text-sm">{format(new Date(), 'EEEE, MMMM d')}</p>
        <h1 className="text-2xl font-heading font-bold">{getGreeting()}, {profile.firstName}</h1>
      </header>

      {/* Main Content */}
      <main className="px-6 space-y-6">
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
                <p className="text-sm opacity-80">Current Streak</p>
                <p className="text-4xl font-bold">{profile.currentStreak}</p>
                <p className="text-sm opacity-80">days</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Longest</p>
              <p className="text-xl font-semibold">{profile.longestStreak} days</p>
            </div>
          </div>
        </motion.div>

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
              className="w-full py-8 text-lg font-semibold rounded-2xl animate-pulse-soft"
            >
              <Check className="w-6 h-6 mr-2" />
              Complete Today's Check-in
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
                <p className="font-semibold text-success">Today's check-in complete!</p>
                <p className="text-sm text-muted-foreground">Great job showing up today</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Weekly Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl border-2 border-border bg-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold">This Week</h3>
            <span className="text-sm text-muted-foreground">{weeklyStats.checkins}/7 days</span>
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
            <span>{weeklyStats.activityCompletions} activities</span>
            <span>{weeklyStats.nutritionScore} nutrition habits</span>
          </div>
        </motion.div>

        {/* Level & Stage */}
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
              <p className="text-sm text-muted-foreground">Level</p>
              <p className="font-heading font-bold text-lg">{currentLevel.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{profile.totalPoints} points</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium capitalize">{profile.currentStage} Stage</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{getStageDescription(profile.currentStage)}</p>
          </div>
        </motion.div>

        {/* Coach Tip Card */}
        <CoachTipCard />

        {/* Daily Tip Card */}
        <DailyTipCard />
      </main>

      <BottomNavigation />
    </div>
  );
};
