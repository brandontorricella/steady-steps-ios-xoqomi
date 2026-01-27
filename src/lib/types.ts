// SteadySteps Type Definitions

export type PrimaryGoal = 'weight_loss' | 'energy' | 'habits' | 'confidence';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate';
export type NutritionChallenge = 'sugary_drinks' | 'late_snacking' | 'portions' | 'processed_food' | 'unsure';
export type TimeCommitment = '5_to_10' | '10_to_15' | '15_to_20' | '20_to_30' | '30_to_45' | '45_to_60';
export type Stage = 'beginner' | 'consistent' | 'confident';
export type Mood = 'great' | 'good' | 'okay' | 'stressed' | 'tired';
export type BadgeCategory = 'streak' | 'activity' | 'nutrition' | 'perfect_day' | 'stage_level' | 'comeback' | 'special' | 'mood';

export interface UserProfile {
  id?: string;
  email?: string;
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
  totalPerfectDays: number;
  lastCheckinDate: string | null;
  progressionWeek: number;
  onboardingCompleted: boolean;
  trialStartDate?: string;
  subscriptionStatus: 'trial' | 'active' | 'cancelled' | 'expired';
  subscriptionProductId?: string;
  subscriptionEndDate?: string;
  coachConversationsCount: number;
  activeLibraryHabits: string[];
  weeklySummaryEnabled: boolean;
  streakAtLoss: number;
}

export interface DailyCheckin {
  id?: string;
  date: string;
  checkinCompleted: boolean;
  activityCompleted: boolean;
  nutritionResponses: (boolean | null)[];
  mood?: Mood;
  libraryHabitsCompleted?: string[];
  pointsEarned: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  earned: boolean;
  earnedDate?: string;
  icon: string;
  requirement?: number;
}

export interface CoachMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface HabitLibraryItem {
  id: string;
  name: string;
  description: string;
  category: 'movement' | 'hydration' | 'nutrition' | 'mindfulness' | 'sleep';
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

// 90 badges across 8 categories
export const BADGES: Badge[] = [
  // STREAK BADGES (15)
  { id: 'first_checkin', name: 'First Check-In', description: 'Complete your first daily check-in', category: 'streak', earned: false, icon: '🌱', requirement: 1 },
  { id: 'three_day_start', name: 'Three Day Start', description: 'Complete 3 consecutive check-ins', category: 'streak', earned: false, icon: '🌿', requirement: 3 },
  { id: 'one_week', name: 'One Week Wonder', description: 'Complete 7 consecutive check-ins', category: 'streak', earned: false, icon: '🌳', requirement: 7 },
  { id: 'ten_day', name: 'Ten Day Streak', description: 'Complete 10 consecutive check-ins', category: 'streak', earned: false, icon: '⭐', requirement: 10 },
  { id: 'two_week', name: 'Two Week Triumph', description: 'Complete 14 consecutive check-ins', category: 'streak', earned: false, icon: '🏅', requirement: 14 },
  { id: 'three_week', name: 'Three Week Warrior', description: 'Complete 21 consecutive check-ins', category: 'streak', earned: false, icon: '💪', requirement: 21 },
  { id: 'monthly', name: 'Monthly Marvel', description: 'Complete 30 consecutive check-ins', category: 'streak', earned: false, icon: '🏆', requirement: 30 },
  { id: 'six_week', name: 'Six Week Strong', description: 'Complete 42 consecutive check-ins', category: 'streak', earned: false, icon: '🔥', requirement: 42 },
  { id: 'fifty_streak', name: 'Fifty Day Fighter', description: 'Complete 50 consecutive check-ins', category: 'streak', earned: false, icon: '✨', requirement: 50 },
  { id: 'two_month', name: 'Two Month Master', description: 'Complete 60 consecutive check-ins', category: 'streak', earned: false, icon: '💎', requirement: 60 },
  { id: 'seventy_five_club', name: 'Seventy Five Club', description: 'Complete 75 consecutive check-ins', category: 'streak', earned: false, icon: '🎯', requirement: 75 },
  { id: 'ninety_champion', name: 'Ninety Day Champion', description: 'Complete 90 consecutive check-ins', category: 'streak', earned: false, icon: '👑', requirement: 90 },
  { id: 'century', name: 'Century Club', description: 'Complete 100 consecutive check-ins', category: 'streak', earned: false, icon: '💯', requirement: 100 },
  { id: 'half_year', name: 'Half Year Hero', description: 'Complete 180 consecutive check-ins', category: 'streak', earned: false, icon: '🌟', requirement: 180 },
  { id: 'year_of_you', name: 'Year of You', description: 'Complete 365 consecutive check-ins', category: 'streak', earned: false, icon: '🎊', requirement: 365 },

  // ACTIVITY BADGES (15)
  { id: 'first_activity', name: 'First Steps', description: 'Complete your first activity goal', category: 'activity', earned: false, icon: '👟', requirement: 1 },
  { id: 'five_activities', name: 'Getting Moving', description: 'Complete 5 activity goals', category: 'activity', earned: false, icon: '🚶', requirement: 5 },
  { id: 'ten_activities', name: 'Double Digits', description: 'Complete 10 activity goals', category: 'activity', earned: false, icon: '🏃', requirement: 10 },
  { id: 'twentyfive_activities', name: 'Quarter Century', description: 'Complete 25 activity goals', category: 'activity', earned: false, icon: '🎽', requirement: 25 },
  { id: 'fifty_activities', name: 'Fifty and Fabulous', description: 'Complete 50 activity goals', category: 'activity', earned: false, icon: '⭐', requirement: 50 },
  { id: 'seventyfive_activities', name: 'Seventy Five Strong', description: 'Complete 75 activity goals', category: 'activity', earned: false, icon: '💪', requirement: 75 },
  { id: 'hundred_activities', name: 'Century Mover', description: 'Complete 100 activity goals', category: 'activity', earned: false, icon: '🎯', requirement: 100 },
  { id: 'onefifty_activities', name: 'One Fifty Club', description: 'Complete 150 activity goals', category: 'activity', earned: false, icon: '🏅', requirement: 150 },
  { id: 'twohundred_activities', name: 'Two Hundred Wonder', description: 'Complete 200 activity goals', category: 'activity', earned: false, icon: '🌟', requirement: 200 },
  { id: 'threehundred_activities', name: 'Three Hundred Milestone', description: 'Complete 300 activity goals', category: 'activity', earned: false, icon: '🔥', requirement: 300 },
  { id: 'fourhundred_activities', name: 'Four Hundred Force', description: 'Complete 400 activity goals', category: 'activity', earned: false, icon: '💎', requirement: 400 },
  { id: 'fivehundred_activities', name: 'Five Hundred Star', description: 'Complete 500 activity goals', category: 'activity', earned: false, icon: '✨', requirement: 500 },
  { id: 'sevenfifty_activities', name: 'Seven Fifty Legend', description: 'Complete 750 activity goals', category: 'activity', earned: false, icon: '👑', requirement: 750 },
  { id: 'thousand_activities', name: 'Thousand Step Master', description: 'Complete 1000 activity goals', category: 'activity', earned: false, icon: '🏆', requirement: 1000 },
  { id: 'movement_life', name: 'Movement for Life', description: 'Complete 1500 activity goals', category: 'activity', earned: false, icon: '🎊', requirement: 1500 },

  // NUTRITION BADGES (15)
  { id: 'mindful_start', name: 'Mindful Start', description: 'Complete your first nutrition check-in', category: 'nutrition', earned: false, icon: '🥗', requirement: 1 },
  { id: 'nutrition_novice', name: 'Nutrition Novice', description: 'Complete all nutrition habits for 3 days', category: 'nutrition', earned: false, icon: '🥦', requirement: 3 },
  { id: 'week_wellness', name: 'Week of Wellness', description: 'Complete all nutrition habits for 7 days', category: 'nutrition', earned: false, icon: '🍎', requirement: 7 },
  { id: 'nutrition_navigator', name: 'Nutrition Navigator', description: 'Complete all nutrition habits for 14 days', category: 'nutrition', earned: false, icon: '🥑', requirement: 14 },
  { id: 'three_week_nourisher', name: 'Three Week Nourisher', description: 'Complete all nutrition habits for 21 days', category: 'nutrition', earned: false, icon: '🍇', requirement: 21 },
  { id: 'habit_hero', name: 'Habit Hero', description: 'Complete all nutrition habits for 30 days', category: 'nutrition', earned: false, icon: '🌟', requirement: 30 },
  { id: 'six_week_sustainer', name: 'Six Week Sustainer', description: 'Complete all nutrition habits for 42 days', category: 'nutrition', earned: false, icon: '🍊', requirement: 42 },
  { id: 'fifty_day_fuel', name: 'Fifty Day Fuel', description: 'Complete all nutrition habits for 50 days', category: 'nutrition', earned: false, icon: '🔥', requirement: 50 },
  { id: 'sixty_day_dedication', name: 'Sixty Day Dedication', description: 'Complete all nutrition habits for 60 days', category: 'nutrition', earned: false, icon: '💎', requirement: 60 },
  { id: 'seventyfive_nourished', name: 'Seventy Five Nourished', description: 'Complete all nutrition habits for 75 days', category: 'nutrition', earned: false, icon: '🌿', requirement: 75 },
  { id: 'ninety_nutrition', name: 'Ninety Day Nutrition Pro', description: 'Complete all nutrition habits for 90 days', category: 'nutrition', earned: false, icon: '👑', requirement: 90 },
  { id: 'hundred_health', name: 'Hundred Day Health', description: 'Complete all nutrition habits for 100 days', category: 'nutrition', earned: false, icon: '💯', requirement: 100 },
  { id: 'half_year_healthy', name: 'Half Year Healthy', description: 'Complete all nutrition habits for 180 days', category: 'nutrition', earned: false, icon: '🏆', requirement: 180 },
  { id: 'nutrition_master', name: 'Nutrition Master', description: 'Complete all nutrition habits for 270 days', category: 'nutrition', earned: false, icon: '✨', requirement: 270 },
  { id: 'year_good_eating', name: 'Year of Good Eating', description: 'Complete all nutrition habits for 365 days', category: 'nutrition', earned: false, icon: '🎊', requirement: 365 },

  // PERFECT DAY BADGES (10)
  { id: 'perfect_start', name: 'Perfect Start', description: 'Complete your first perfect day', category: 'perfect_day', earned: false, icon: '💫', requirement: 1 },
  { id: 'perfect_three', name: 'Perfect Three', description: 'Complete 3 perfect days total', category: 'perfect_day', earned: false, icon: '⭐', requirement: 3 },
  { id: 'perfect_week', name: 'Perfect Week', description: 'Complete 7 perfect days total', category: 'perfect_day', earned: false, icon: '🌟', requirement: 7 },
  { id: 'perfect_ten', name: 'Perfect Ten', description: 'Complete 10 perfect days total', category: 'perfect_day', earned: false, icon: '✨', requirement: 10 },
  { id: 'twenty_perfect', name: 'Twenty Perfect', description: 'Complete 20 perfect days total', category: 'perfect_day', earned: false, icon: '💎', requirement: 20 },
  { id: 'thirty_perfect', name: 'Thirty Perfect', description: 'Complete 30 perfect days total', category: 'perfect_day', earned: false, icon: '🔥', requirement: 30 },
  { id: 'fifty_perfect', name: 'Fifty Perfect', description: 'Complete 50 perfect days total', category: 'perfect_day', earned: false, icon: '👑', requirement: 50 },
  { id: 'seventyfive_perfect', name: 'Seventy Five Perfect', description: 'Complete 75 perfect days total', category: 'perfect_day', earned: false, icon: '🏆', requirement: 75 },
  { id: 'hundred_perfect', name: 'Hundred Perfect', description: 'Complete 100 perfect days total', category: 'perfect_day', earned: false, icon: '💯', requirement: 100 },
  { id: 'perfect_master', name: 'Perfect Master', description: 'Complete 200 perfect days total', category: 'perfect_day', earned: false, icon: '🎊', requirement: 200 },

  // STAGE & LEVEL BADGES (10)
  { id: 'stage_shifter', name: 'Stage Shifter', description: 'Advance from Beginner to Consistent stage', category: 'stage_level', earned: false, icon: '📈' },
  { id: 'confident_climber', name: 'Confident Climber', description: 'Advance to Confident stage', category: 'stage_level', earned: false, icon: '🎖️' },
  { id: 'level_five', name: 'Level Five', description: 'Reach Level 5 Flourishing', category: 'stage_level', earned: false, icon: '🌸' },
  { id: 'level_seven', name: 'Level Seven', description: 'Reach Level 7 Radiant', category: 'stage_level', earned: false, icon: '☀️' },
  { id: 'level_ten', name: 'Level Ten', description: 'Reach Level 10 SteadySteps Master', category: 'stage_level', earned: false, icon: '👑' },
  { id: 'goal_grower', name: 'Goal Grower', description: 'Experience your first goal progression increase', category: 'stage_level', earned: false, icon: '🌻' },
  { id: 'double_progression', name: 'Double Progression', description: 'Experience 2 goal progressions', category: 'stage_level', earned: false, icon: '🌼' },
  { id: 'triple_progression', name: 'Triple Progression', description: 'Experience 3 goal progressions', category: 'stage_level', earned: false, icon: '🌺' },
  { id: 'five_time_grower', name: 'Five Time Grower', description: 'Experience 5 goal progressions', category: 'stage_level', earned: false, icon: '🌷' },
  { id: 'maximum_achievement', name: 'Maximum Achievement', description: 'Reach maximum activity goal of 30 minutes', category: 'stage_level', earned: false, icon: '🏆' },

  // COMEBACK & RESILIENCE BADGES (8)
  { id: 'fresh_start', name: 'Fresh Start', description: 'Return after 3+ missed days', category: 'comeback', earned: false, icon: '🌅' },
  { id: 'resilient', name: 'Resilient', description: 'Return after 7+ missed days', category: 'comeback', earned: false, icon: '💪' },
  { id: 'never_give_up', name: 'Never Give Up', description: 'Return after 14+ missed days', category: 'comeback', earned: false, icon: '🦋' },
  { id: 'bounce_back', name: 'Bounce Back', description: 'Return after 21+ missed days', category: 'comeback', earned: false, icon: '🚀' },
  { id: 'monthly_return', name: 'Monthly Return', description: 'Return after 30+ missed days', category: 'comeback', earned: false, icon: '🌈' },
  { id: 'second_chance', name: 'Second Chance', description: 'Start a new streak after losing a streak of 14+ days', category: 'comeback', earned: false, icon: '🔄' },
  { id: 'third_wind', name: 'Third Wind', description: 'Start a new streak after losing a streak of 30+ days', category: 'comeback', earned: false, icon: '💨' },
  { id: 'unstoppable_spirit', name: 'Unstoppable Spirit', description: 'Rebuild a 30 day streak after previously losing one', category: 'comeback', earned: false, icon: '🔥' },

  // SPECIAL ACHIEVEMENT BADGES (10)
  { id: 'early_bird', name: 'Early Bird', description: 'Complete check-in before 8 AM for 7 days', category: 'special', earned: false, icon: '🐦' },
  { id: 'night_owl_converted', name: 'Night Owl Converted', description: 'Complete check-in before 9 PM for 14 days', category: 'special', earned: false, icon: '🦉' },
  { id: 'weekend_warrior', name: 'Weekend Warrior', description: 'Complete check-ins on 8 consecutive weekend days', category: 'special', earned: false, icon: '🎉' },
  { id: 'monday_motivation', name: 'Monday Motivation', description: 'Complete check-in every Monday for 8 weeks', category: 'special', earned: false, icon: '📅' },
  { id: 'habit_explorer', name: 'Habit Explorer', description: 'Unlock and try 5 habits from Habit Library', category: 'special', earned: false, icon: '🔍' },
  { id: 'habit_collector', name: 'Habit Collector', description: 'Unlock and try 10 habits from Habit Library', category: 'special', earned: false, icon: '📚' },
  { id: 'coach_connection', name: 'Coach Connection', description: 'Have 10 conversations with the AI Coach', category: 'special', earned: false, icon: '💬' },
  { id: 'coach_regular', name: 'Coach Regular', description: 'Have 50 conversations with the AI Coach', category: 'special', earned: false, icon: '🗣️' },
  { id: 'buddy_builder', name: 'Buddy Builder', description: 'Add your first accountability buddy', category: 'special', earned: false, icon: '🤝' },
  { id: 'community_creator', name: 'Community Creator', description: 'Refer 3 friends who complete their first week', category: 'special', earned: false, icon: '🌍' },
  { id: 'referral_champion', name: 'Referral Champion', description: 'Earn your first free month from referrals', category: 'special', earned: false, icon: '🏅' },

  // MOOD TRACKING BADGES (7)
  { id: 'mood_starter', name: 'Mood Starter', description: 'Complete your first mood check-in', category: 'mood', earned: false, icon: '😊' },
  { id: 'mood_week', name: 'Mood Week', description: 'Complete mood check-ins for 7 days', category: 'mood', earned: false, icon: '📊' },
  { id: 'mood_aware', name: 'Mood Aware', description: 'Complete mood check-ins for 14 days', category: 'mood', earned: false, icon: '🧠' },
  { id: 'mood_master', name: 'Mood Master', description: 'Complete mood check-ins for 30 days', category: 'mood', earned: false, icon: '💭' },
  { id: 'stress_reducer', name: 'Stress Reducer', description: 'Log improved mood after a stressed day 5 times', category: 'mood', earned: false, icon: '🧘' },
  { id: 'calm_collector', name: 'Calm Collector', description: 'Log calm mood for 7 consecutive days', category: 'mood', earned: false, icon: '☮️' },
  { id: 'emotional_intelligence', name: 'Emotional Intelligence', description: 'Complete mood check-ins for 90 days', category: 'mood', earned: false, icon: '❤️' },
];

// Habit Library items
export const HABIT_LIBRARY: HabitLibraryItem[] = [
  // Movement
  { id: 'stairs', name: 'Take stairs instead of elevator', description: 'Small choices add up to big changes', category: 'movement' },
  { id: 'park_far', name: 'Park farther away', description: 'Extra steps throughout the day', category: 'movement' },
  { id: 'stretch_hourly', name: 'Stand up and stretch every hour', description: 'Keep your body moving throughout work', category: 'movement' },
  { id: 'walk_after_meals', name: 'Take a 5-minute walk after meals', description: 'Aids digestion and boosts energy', category: 'movement' },
  { id: 'bedtime_stretch', name: 'Do gentle stretches before bed', description: 'Relax your body for better sleep', category: 'movement' },
  
  // Hydration
  { id: 'morning_water', name: 'Drink water first thing in the morning', description: 'Start your day hydrated', category: 'hydration' },
  { id: 'carry_bottle', name: 'Carry a water bottle throughout the day', description: 'Make hydration convenient', category: 'hydration' },
  { id: 'water_before_meals', name: 'Drink water before each meal', description: 'Stay hydrated and eat mindfully', category: 'hydration' },
  { id: 'replace_sugary', name: 'Replace one sugary drink with water', description: 'Cut sugar intake gradually', category: 'hydration' },
  { id: 'track_water', name: 'Track water intake with simple tally', description: 'Awareness leads to better habits', category: 'hydration' },
  
  // Nutrition
  { id: 'extra_veggie', name: 'Add one extra vegetable to lunch', description: 'Boost your nutrient intake', category: 'nutrition' },
  { id: 'fruit_breakfast', name: 'Eat a piece of fruit with breakfast', description: 'Start your day with vitamins', category: 'nutrition' },
  { id: 'prep_snacks', name: 'Prepare healthy snacks in advance', description: 'Set yourself up for success', category: 'nutrition' },
  { id: 'screen_free_meal', name: 'Eat without screens for one meal', description: 'Practice mindful eating', category: 'nutrition' },
  { id: 'new_recipe', name: 'Try one new healthy recipe this week', description: 'Expand your healthy options', category: 'nutrition' },
  
  // Mindfulness
  { id: 'deep_breaths', name: 'Take 3 deep breaths before eating', description: 'Calm your nervous system', category: 'mindfulness' },
  { id: 'morning_gratitude', name: 'Practice 2 minutes of morning gratitude', description: 'Start your day positively', category: 'mindfulness' },
  { id: 'hunger_cues', name: 'Notice hunger and fullness cues', description: 'Listen to your body', category: 'mindfulness' },
  { id: 'mindful_minute', name: 'Take a mindful minute before bed', description: 'Wind down peacefully', category: 'mindfulness' },
  { id: 'fresh_air', name: 'Step outside for fresh air daily', description: 'Connect with nature', category: 'mindfulness' },
  
  // Sleep
  { id: 'consistent_bedtime', name: 'Set consistent bedtime', description: 'Regulate your body clock', category: 'sleep' },
  { id: 'no_screens', name: 'Avoid screens 30 minutes before bed', description: 'Improve sleep quality', category: 'sleep' },
  { id: 'bedtime_routine', name: 'Create a simple bedtime routine', description: 'Signal your body it is time to rest', category: 'sleep' },
  { id: 'cool_bedroom', name: 'Keep bedroom cool and dark', description: 'Optimize your sleep environment', category: 'sleep' },
  { id: 'limit_caffeine', name: 'Limit caffeine after 2 PM', description: 'Protect your natural sleep', category: 'sleep' },
];

// Daily tips (50+)
export const DAILY_TIPS = [
  // Nutrition
  'Drinking a glass of water before meals can help reduce overeating.',
  'Adding protein to breakfast helps you stay full longer.',
  'Frozen vegetables are just as nutritious as fresh and easier to prepare.',
  'Eating slowly gives your brain time to register fullness.',
  'A handful of nuts makes a satisfying snack that keeps energy steady.',
  'Herbs and spices add flavor without extra calories.',
  'Reading nutrition labels helps you make informed choices.',
  'Smaller plates can help with portion control without feeling deprived.',
  'Fiber-rich foods keep you feeling satisfied between meals.',
  'Planning meals ahead reduces last-minute unhealthy choices.',
  
  // Movement
  'A 10-minute walk can boost your mood for up to 2 hours.',
  'Taking stairs burns 7 times more calories than the elevator.',
  'Stretching for 5 minutes improves flexibility and reduces tension.',
  'Walking after meals aids digestion and helps regulate blood sugar.',
  'Short movement breaks throughout the day add up to big benefits.',
  'Dancing to one song counts as joyful movement.',
  'Standing while on phone calls adds extra activity to your day.',
  'Gentle yoga before bed can improve sleep quality.',
  'Walking with a friend makes the time pass faster.',
  'Your body was made to move. Even small amounts matter.',
  
  // Hydration
  'Thirst is often mistaken for hunger. Try water first.',
  'Adding lemon or cucumber makes water more enjoyable.',
  'Keeping water visible reminds you to drink it.',
  'Herbal tea counts toward your daily hydration.',
  'Drinking water helps your body process nutrients efficiently.',
  
  // Mindset
  'Progress is not always visible on the scale. Trust the process.',
  'One missed day does not erase your progress.',
  'Comparing yourself to others distracts from your own journey.',
  'Small consistent actions beat big sporadic efforts.',
  'Being kind to yourself makes lasting change easier.',
  'Celebrate what you did, not what you did not do.',
  'Your body is working hard for you every single day.',
  'Healthy habits are a gift to your future self.',
  'Rest is productive. Your body needs recovery time.',
  'You are doing better than you think you are.',
  
  // Sleep
  'Quality sleep supports weight management and energy.',
  'A consistent bedtime helps regulate your body clock.',
  'Avoiding screens before bed improves sleep quality.',
  'A cool bedroom temperature promotes better rest.',
  'Even 15 extra minutes of sleep can improve your day.',
  
  // More tips
  'Morning sunlight helps regulate your circadian rhythm.',
  'Taking the scenic route adds extra steps naturally.',
  'Cooking at home gives you control over ingredients.',
  'Deep breathing can reduce stress in just 60 seconds.',
  'Connecting with friends supports mental wellness.',
  'Laughing burns calories and boosts mood hormones.',
  'Fresh air improves focus and energy levels.',
  'Gratitude practice has been linked to better health outcomes.',
  'Starting small builds momentum for bigger changes.',
  'Progress photos tell a better story than the scale.',
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
  'Did you eat slowly and mindfully for at least one meal today?',
];

export const getActivityGoalFromCommitment = (commitment: TimeCommitment): number => {
  switch (commitment) {
    case '5_to_10': return 5;
    case '10_to_15': return 10;
    case '15_to_20': return 15;
    case '20_to_30': return 20;
    case '30_to_45': return 30;
    case '45_to_60': return 45;
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

export const getMoodEmoji = (mood: Mood): string => {
  switch (mood) {
    case 'great': return '😄';
    case 'good': return '🙂';
    case 'okay': return '😐';
    case 'stressed': return '😟';
    case 'tired': return '😴';
  }
};

export const getMoodMessage = (mood: Mood): string => {
  switch (mood) {
    case 'great': return 'Wonderful! Keep that energy going.';
    case 'good': return 'Nice! Steady progress feels good.';
    case 'okay': return 'That is perfectly fine. You are still here.';
    case 'stressed': return 'I see you. Taking care of yourself today matters even more.';
    case 'tired': return 'Rest is part of the journey. Be gentle with yourself.';
  }
};

// Stripe subscription pricing
export const SUBSCRIPTION_PLANS = {
  monthly: {
    priceId: 'price_monthly_499', // Will be replaced with actual Stripe price ID
    amount: 499,
    interval: 'month',
    label: '$4.99 per month',
  },
  annual: {
    priceId: 'price_annual_2999', // Will be replaced with actual Stripe price ID
    amount: 2999,
    interval: 'year',
    label: '$29.99 per year (Save 50%)',
  },
};
