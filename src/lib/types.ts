// SteadySteps Type Definitions

export type PrimaryGoal = 'weight_loss' | 'energy' | 'habits' | 'confidence';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate';
export type NutritionChallenge = 'sugary_drinks' | 'late_snacking' | 'portions' | 'processed_food' | 'unsure';
export type TimeCommitment = '5_to_10' | '10_to_15' | '15_to_20';
export type Stage = 'beginner' | 'consistent' | 'confident';

export interface UserProfile {
  firstName: string;
  primaryGoal: PrimaryGoal;
  activityLevel: ActivityLevel;
  primaryNutritionChallenge: NutritionChallenge;
  dailyTimeCommitment: TimeCommitment;
  morningReminderTime: string;
  eveningReminderTime: string;
  middayNudgeEnabled: boolean;
  accountCreatedDate: string;
  currentStage: Stage;
  currentLevel: number;
  currentActivityGoalMinutes: number;
  nutritionQuestionsCount: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  totalCheckins: number;
  totalActivityCompletions: number;
  totalNutritionHabitsCompleted: number;
  lastCheckinDate: string | null;
  progressionWeek: number;
  onboardingCompleted: boolean;
}

export interface DailyCheckin {
  date: string;
  checkinCompleted: boolean;
  activityCompleted: boolean;
  nutritionResponses: (boolean | null)[];
  pointsEarned: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: 'consistency' | 'activity' | 'nutrition' | 'milestone' | 'comeback';
  earned: boolean;
  earnedDate?: string;
  icon: string;
}

// Level definitions
export const LEVELS = [
  { level: 1, name: 'Seedling', minPoints: 0, maxPoints: 100 },
  { level: 2, name: 'Sprout', minPoints: 101, maxPoints: 250 },
  { level: 3, name: 'Sapling', minPoints: 251, maxPoints: 500 },
  { level: 4, name: 'Growing', minPoints: 501, maxPoints: 1000 },
  { level: 5, name: 'Flourishing', minPoints: 1001, maxPoints: 2000 },
  { level: 6, name: 'Thriving', minPoints: 2001, maxPoints: 4000 },
  { level: 7, name: 'Radiant', minPoints: 4001, maxPoints: 7000 },
  { level: 8, name: 'Unstoppable', minPoints: 7001, maxPoints: 10000 },
  { level: 9, name: 'Transformed', minPoints: 10001, maxPoints: 15000 },
  { level: 10, name: 'SteadySteps Master', minPoints: 15001, maxPoints: Infinity },
];

export const BADGES: Badge[] = [
  // Consistency Badges
  { id: 'first_checkin', name: 'First Check-In', description: 'Complete your first daily check-in', category: 'consistency', earned: false, icon: '🌱' },
  { id: 'one_week', name: 'One Week Wonder', description: 'Complete 7 consecutive check-ins', category: 'consistency', earned: false, icon: '🌿' },
  { id: 'two_week', name: 'Two Week Triumph', description: 'Complete 14 consecutive check-ins', category: 'consistency', earned: false, icon: '🌳' },
  { id: 'monthly', name: 'Monthly Marvel', description: 'Complete 30 consecutive check-ins', category: 'consistency', earned: false, icon: '🏆' },
  { id: 'fifty_streak', name: 'Streak Keeper', description: 'Maintain a 50 day streak', category: 'consistency', earned: false, icon: '🔥' },
  { id: 'century', name: 'Century Club', description: 'Maintain a 100 day streak', category: 'consistency', earned: false, icon: '💯' },
  // Activity Badges
  { id: 'first_activity', name: 'First Steps', description: 'Complete your first activity goal', category: 'activity', earned: false, icon: '👟' },
  { id: 'ten_activities', name: 'Moving Forward', description: 'Complete 10 activity goals', category: 'activity', earned: false, icon: '🚶' },
  { id: 'twentyfive_activities', name: 'Momentum Builder', description: 'Complete 25 activity goals', category: 'activity', earned: false, icon: '🏃' },
  { id: 'fifty_activities', name: 'Movement Master', description: 'Complete 50 activity goals', category: 'activity', earned: false, icon: '⭐' },
  { id: 'hundred_activities', name: 'Activity Ace', description: 'Complete 100 activity goals', category: 'activity', earned: false, icon: '🎯' },
  // Nutrition Badges
  { id: 'mindful_start', name: 'Mindful Start', description: 'Complete your first nutrition check-in', category: 'nutrition', earned: false, icon: '🥗' },
  { id: 'aware_eater', name: 'Aware Eater', description: 'Complete all nutrition habits for 7 days', category: 'nutrition', earned: false, icon: '🥦' },
  { id: 'nutrition_navigator', name: 'Nutrition Navigator', description: 'Complete all nutrition habits for 14 days', category: 'nutrition', earned: false, icon: '🍎' },
  { id: 'habit_hero', name: 'Habit Hero', description: 'Complete all nutrition habits for 30 days', category: 'nutrition', earned: false, icon: '🌟' },
  // Milestone Badges
  { id: 'stage_shifter', name: 'Stage Shifter', description: 'Advance from Beginner to Consistent stage', category: 'milestone', earned: false, icon: '📈' },
  { id: 'confident_climber', name: 'Confident Climber', description: 'Advance to Confident stage', category: 'milestone', earned: false, icon: '🎖️' },
  { id: 'goal_grower', name: 'Goal Grower', description: 'Experience your first goal progression increase', category: 'milestone', earned: false, icon: '🌻' },
  { id: 'perfect_week', name: 'Perfect Week', description: 'Complete all check-ins with 100% activity for 7 days', category: 'milestone', earned: false, icon: '💎' },
  { id: 'perfect_month', name: 'Perfect Month', description: 'Complete all check-ins with 100% activity for 30 days', category: 'milestone', earned: false, icon: '👑' },
  // Comeback Badges
  { id: 'fresh_start', name: 'Fresh Start', description: 'Return after 3+ missed days', category: 'comeback', earned: false, icon: '🌅' },
  { id: 'resilient', name: 'Resilient', description: 'Return after 7+ missed days', category: 'comeback', earned: false, icon: '💪' },
  { id: 'never_give_up', name: 'Never Give Up', description: 'Return after 14+ missed days', category: 'comeback', earned: false, icon: '🦋' },
];

export const getNutritionQuestion = (challenge: NutritionChallenge): string => {
  switch (challenge) {
    case 'sugary_drinks':
      return 'Did you skip sugary drinks today (soda, juice, sweetened coffee)?';
    case 'late_snacking':
      return 'Did you avoid eating within 2 hours of bedtime?';
    case 'portions':
      return 'Did you stop eating when you felt satisfied rather than stuffed?';
    case 'processed_food':
      return 'Did you eat at least one home-prepared meal today?';
    case 'unsure':
    default:
      return 'Did you drink at least 6 glasses of water today?';
  }
};

export const SECONDARY_NUTRITION_QUESTIONS = [
  'Did you eat at least one serving of vegetables today?',
  'Did you eat breakfast today?',
  'Did you choose fruit instead of a processed snack today?',
  'Did you eat slowly and without distractions for at least one meal?',
];

export const getActivityGoalFromCommitment = (commitment: TimeCommitment): number => {
  switch (commitment) {
    case '5_to_10': return 5;
    case '10_to_15': return 10;
    case '15_to_20': return 15;
    default: return 5;
  }
};

export const getStageDescription = (stage: Stage): string => {
  switch (stage) {
    case 'beginner':
      return 'You are building the foundation. Focus on showing up.';
    case 'consistent':
      return 'You have proven you can stick with it. Keep going.';
    case 'confident':
      return 'You have built real habits. This is who you are now.';
  }
};
