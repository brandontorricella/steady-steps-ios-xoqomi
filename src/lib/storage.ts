import { UserProfile, DailyCheckin, Badge, BADGES } from './types';

const STORAGE_KEYS = {
  USER_PROFILE: 'steadysteps_user_profile',
  DAILY_CHECKINS: 'steadysteps_daily_checkins',
  BADGES: 'steadysteps_badges',
};

export const getDefaultUserProfile = (): UserProfile => ({
  firstName: '',
  primaryGoal: 'habits',
  activityLevel: 'sedentary',
  primaryNutritionChallenge: 'unsure',
  dailyTimeCommitment: '5_to_10',
  morningReminderTime: '08:00',
  eveningReminderTime: '19:00',
  middayNudgeEnabled: true,
  accountCreatedDate: new Date().toISOString(),
  currentStage: 'beginner',
  currentLevel: 1,
  currentActivityGoalMinutes: 5,
  nutritionQuestionsCount: 3,
  totalPoints: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalCheckins: 0,
  totalActivityCompletions: 0,
  totalNutritionHabitsCompleted: 0,
  lastCheckinDate: null,
  progressionWeek: 1,
  onboardingCompleted: false,
});

export const getUserProfile = (): UserProfile | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  return stored ? JSON.parse(stored) : null;
};

export const saveUserProfile = (profile: UserProfile): void => {
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
};

export const getDailyCheckins = (): DailyCheckin[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.DAILY_CHECKINS);
  return stored ? JSON.parse(stored) : [];
};

export const saveDailyCheckin = (checkin: DailyCheckin): void => {
  const checkins = getDailyCheckins();
  const existingIndex = checkins.findIndex(c => c.date === checkin.date);
  
  if (existingIndex >= 0) {
    checkins[existingIndex] = checkin;
  } else {
    checkins.push(checkin);
  }
  
  localStorage.setItem(STORAGE_KEYS.DAILY_CHECKINS, JSON.stringify(checkins));
};

export const getTodayCheckin = (): DailyCheckin | null => {
  const today = new Date().toISOString().split('T')[0];
  const checkins = getDailyCheckins();
  return checkins.find(c => c.date === today) || null;
};

export const getBadges = (): Badge[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.BADGES);
  return stored ? JSON.parse(stored) : [...BADGES];
};

export const saveBadges = (badges: Badge[]): void => {
  localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
};

export const earnBadge = (badgeId: string): Badge | null => {
  const badges = getBadges();
  const badge = badges.find(b => b.id === badgeId);
  
  if (badge && !badge.earned) {
    badge.earned = true;
    badge.earnedDate = new Date().toISOString();
    saveBadges(badges);
    return badge;
  }
  
  return null;
};

export const clearAllData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  localStorage.removeItem(STORAGE_KEYS.DAILY_CHECKINS);
  localStorage.removeItem(STORAGE_KEYS.BADGES);
};

export const calculatePoints = (activityCompleted: boolean, nutritionResponses: (boolean | null)[], streak: number): number => {
  let points = 10; // Base check-in points
  
  if (activityCompleted) {
    points += 15;
  }
  
  const nutritionYes = nutritionResponses.filter(r => r === true).length;
  points += nutritionYes * 5;
  
  // Perfect day bonus
  const allNutritionYes = nutritionResponses.every(r => r === true);
  if (activityCompleted && allNutritionYes) {
    points += 10;
  }
  
  // Streak bonus (after 3 days)
  if (streak >= 3) {
    points += 5;
  }
  
  return points;
};

export const getWeeklyStats = (): { checkins: number; activityCompletions: number; nutritionScore: number } => {
  const checkins = getDailyCheckins();
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const weekCheckins = checkins.filter(c => new Date(c.date) >= weekAgo);
  
  return {
    checkins: weekCheckins.length,
    activityCompletions: weekCheckins.filter(c => c.activityCompleted).length,
    nutritionScore: weekCheckins.reduce((sum, c) => sum + c.nutritionResponses.filter(r => r === true).length, 0),
  };
};
