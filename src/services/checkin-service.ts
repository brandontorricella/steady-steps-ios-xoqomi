import { supabase } from '@/integrations/supabase/client';
import { DailyCheckin } from '@/lib/types';

// =====================================================
// CHECKIN SERVICE - Handles all check-in operations
// =====================================================

const PAGE_SIZE = 30;

export interface CheckinResult {
  success: boolean;
  data?: DailyCheckin | DailyCheckin[];
  error?: string;
}

export interface PaginatedCheckins {
  success: boolean;
  data?: DailyCheckin[];
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
  error?: string;
}

/**
 * Get check-ins for a user with pagination
 */
export async function getCheckins(
  userId: string, 
  page: number = 1,
  pageSize: number = PAGE_SIZE
): Promise<PaginatedCheckins> {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('daily_checkins')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching checkins:', error);
      return { success: false, error: error.message };
    }

    const checkins = (data || []).map(mapDatabaseToCheckin);
    const totalCount = count || 0;

    return {
      success: true,
      data: checkins,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasMore: to < totalCount - 1
      }
    };
  } catch (error) {
    console.error('Get checkins failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get check-ins for a date range (optimized for calendar view)
 */
export async function getCheckinsForDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<CheckinResult> {
  try {
    const { data, error } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching checkins for range:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: (data || []).map(mapDatabaseToCheckin)
    };
  } catch (error) {
    console.error('Get checkins for range failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get today's check-in for a user
 */
export async function getTodayCheckin(userId: string): Promise<CheckinResult> {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (error) {
      console.error('Error fetching today checkin:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: data ? mapDatabaseToCheckin(data) : undefined
    };
  } catch (error) {
    console.error('Get today checkin failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Save or update a check-in
 */
export async function saveCheckin(
  userId: string,
  checkin: Partial<DailyCheckin>
): Promise<CheckinResult> {
  try {
    const date = checkin.date || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_checkins')
      .upsert({
        user_id: userId,
        date,
        mood: checkin.mood,
        energy_level: checkin.energyLevel,
        sleep_quality: checkin.sleepQuality,
        stress_level: checkin.stressLevel,
        activity_completed: checkin.activityCompleted,
        nutrition_responses: checkin.nutritionResponses,
        habit_completion: checkin.habitCompletion,
        checkin_completed: checkin.checkinCompleted ?? true,
        points_earned: checkin.pointsEarned,
        library_habits_completed: checkin.libraryHabitsCompleted,
      }, {
        onConflict: 'user_id,date'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving checkin:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: mapDatabaseToCheckin(data)
    };
  } catch (error) {
    console.error('Save checkin failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get weekly stats for a user
 */
export async function getWeeklyStats(userId: string): Promise<{
  success: boolean;
  stats?: {
    checkins: number;
    activityCompletions: number;
    nutritionScore: number;
    averageMood: string | null;
    averageEnergy: number | null;
  };
  error?: string;
}> {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', userId)
      .gte('date', weekAgoStr)
      .lte('date', today);

    if (error) {
      console.error('Error fetching weekly stats:', error);
      return { success: false, error: error.message };
    }

    const checkins = data || [];
    const activityCompletions = checkins.filter(c => c.activity_completed).length;
    const nutritionScore = checkins.reduce((sum, c) => {
      const responses = c.nutrition_responses as (boolean | null)[] || [];
      return sum + responses.filter(r => r === true).length;
    }, 0);

    // Calculate average energy
    const energyLevels = checkins
      .map(c => c.energy_level)
      .filter((e): e is number => e !== null);
    const averageEnergy = energyLevels.length > 0
      ? Math.round(energyLevels.reduce((a, b) => a + b, 0) / energyLevels.length * 10) / 10
      : null;

    // Get most common mood
    const moodCounts: Record<string, number> = {};
    checkins.forEach(c => {
      if (c.mood) {
        moodCounts[c.mood] = (moodCounts[c.mood] || 0) + 1;
      }
    });
    const averageMood = Object.entries(moodCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return {
      success: true,
      stats: {
        checkins: checkins.length,
        activityCompletions,
        nutritionScore,
        averageMood,
        averageEnergy
      }
    };
  } catch (error) {
    console.error('Get weekly stats failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// =====================================================
// MAPPING FUNCTIONS
// =====================================================

interface DatabaseCheckin {
  id: string;
  user_id: string;
  date: string;
  mood: string | null;
  energy_level: number | null;
  sleep_quality: number | null;
  stress_level: number | null;
  activity_completed: boolean | null;
  nutrition_responses: unknown;
  habit_completion: string | null;
  checkin_completed: boolean | null;
  points_earned: number | null;
  library_habits_completed: string[] | null;
  created_at: string | null;
}

function mapDatabaseToCheckin(data: DatabaseCheckin): DailyCheckin {
  // Map database habitCompletion to valid HabitCompletion type
  let habitCompletion: DailyCheckin['habitCompletion'] = undefined;
  if (data.habit_completion === 'yes' || data.habit_completion === 'somewhat' || data.habit_completion === 'no') {
    habitCompletion = data.habit_completion;
  }

  return {
    date: data.date,
    mood: data.mood as DailyCheckin['mood'],
    energyLevel: data.energy_level ?? undefined,
    sleepQuality: data.sleep_quality ?? undefined,
    stressLevel: data.stress_level ?? undefined,
    activityCompleted: data.activity_completed ?? false,
    nutritionResponses: (data.nutrition_responses as (boolean | null)[]) || [],
    habitCompletion,
    checkinCompleted: data.checkin_completed ?? false,
    pointsEarned: data.points_earned ?? 0,
    libraryHabitsCompleted: data.library_habits_completed || [],
  };
}
