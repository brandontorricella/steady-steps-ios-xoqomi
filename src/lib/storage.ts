import { UserProfile, DailyCheckin, Badge, BADGES } from './types';

const STORAGE_KEYS = {
  USER_PROFILE: 'steadysteps_user_profile',
  DAILY_CHECKINS: 'steadysteps_daily_checkins',
  BADGES: 'steadysteps_badges',
  LAST_TIP_INDEX: 'steadysteps_last_tip_index',
  LAST_TIP_DATE: 'steadysteps_last_tip_date',
};

export const getDefaultUserProfile = (): UserProfile => ({
  firstName: '',
  language: 'en',
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
  totalPerfectDays: 0,
  lastCheckinDate: null,
  progressionWeek: 1,
  onboardingCompleted: false,
  subscriptionStatus: 'trial',
  coachConversationsCount: 0,
  activeLibraryHabits: [],
  weeklySummaryEnabled: true,
  streakAtLoss: 0,
  biggestObstacle: 'time',
  dietPreference: 'no_preference',
  fitnessConfidence: 3,
});

export const getUserProfile = (): UserProfile | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  if (stored) {
    const profile = JSON.parse(stored);
    // Merge with defaults to ensure all new fields exist
    return { ...getDefaultUserProfile(), ...profile };
  }
  return null;
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
  if (stored) {
    const savedBadges = JSON.parse(stored);
    // Merge with full BADGES array to include new badges
    return BADGES.map(badge => {
      const saved = savedBadges.find((b: Badge) => b.id === badge.id);
      return saved ? { ...badge, earned: saved.earned, earnedDate: saved.earnedDate } : badge;
    });
  }
  return [...BADGES];
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
  localStorage.removeItem(STORAGE_KEYS.LAST_TIP_INDEX);
  localStorage.removeItem(STORAGE_KEYS.LAST_TIP_DATE);
};

// Alias for clearAllData for semantic clarity
export const clearUserProfile = clearAllData;

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

export const getDailyTipIndex = (tipsLength: number): number => {
  const today = new Date().toISOString().split('T')[0];
  const lastDate = localStorage.getItem(STORAGE_KEYS.LAST_TIP_DATE);
  let lastIndex = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_TIP_INDEX) || '0');
  
  if (lastDate !== today) {
    // New day, advance to next tip
    lastIndex = (lastIndex + 1) % tipsLength;
    localStorage.setItem(STORAGE_KEYS.LAST_TIP_INDEX, lastIndex.toString());
    localStorage.setItem(STORAGE_KEYS.LAST_TIP_DATE, today);
  }
  
  return lastIndex;
};

export const checkStreakBadges = (streak: number): string[] => {
  const earnedBadges: string[] = [];
  const streakBadgeMap: Record<number, string> = {
    1: 'first_checkin',
    3: 'three_day_start',
    7: 'one_week',
    10: 'ten_day',
    14: 'two_week',
    21: 'three_week',
    30: 'monthly',
    42: 'six_week',
    50: 'fifty_streak',
    60: 'two_month',
    75: 'seventy_five_club',
    90: 'ninety_champion',
    100: 'century',
    180: 'half_year',
    365: 'year_of_you',
  };
  
  const badgeId = streakBadgeMap[streak];
  if (badgeId) {
    const badge = earnBadge(badgeId);
    if (badge) earnedBadges.push(badge.name);
  }
  
  return earnedBadges;
};

export const checkActivityBadges = (totalActivities: number): string[] => {
  const earnedBadges: string[] = [];
  const activityBadgeMap: Record<number, string> = {
    1: 'first_activity',
    5: 'five_activities',
    10: 'ten_activities',
    25: 'twentyfive_activities',
    50: 'fifty_activities',
    75: 'seventyfive_activities',
    100: 'hundred_activities',
    150: 'onefifty_activities',
    200: 'twohundred_activities',
    300: 'threehundred_activities',
    400: 'fourhundred_activities',
    500: 'fivehundred_activities',
    750: 'sevenfifty_activities',
    1000: 'thousand_activities',
    1500: 'movement_life',
  };
  
  const badgeId = activityBadgeMap[totalActivities];
  if (badgeId) {
    const badge = earnBadge(badgeId);
    if (badge) earnedBadges.push(badge.name);
  }
  
  return earnedBadges;
};

export const checkPerfectDayBadges = (totalPerfectDays: number): string[] => {
  const earnedBadges: string[] = [];
  const perfectDayBadgeMap: Record<number, string> = {
    1: 'perfect_start',
    3: 'perfect_three',
    7: 'perfect_week',
    10: 'perfect_ten',
    20: 'twenty_perfect',
    30: 'thirty_perfect',
    50: 'fifty_perfect',
    75: 'seventyfive_perfect',
    100: 'hundred_perfect',
    200: 'perfect_master',
  };
  
  const badgeId = perfectDayBadgeMap[totalPerfectDays];
  if (badgeId) {
    const badge = earnBadge(badgeId);
    if (badge) earnedBadges.push(badge.name);
  }
  
  return earnedBadges;
};
