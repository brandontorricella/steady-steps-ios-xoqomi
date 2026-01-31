import { z } from 'zod';

// =====================================================
// INPUT VALIDATION SCHEMAS
// =====================================================

// Profile validation
export const profileUpdateSchema = z.object({
  firstName: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Name contains invalid characters')
    .optional(),
  email: z.string()
    .trim()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .optional(),
  language: z.enum(['en', 'es']).optional(),
  primaryGoal: z.enum(['weight_loss', 'energy', 'habits', 'confidence']).optional(),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active']).optional(),
  primaryNutritionChallenge: z.enum(['portions', 'snacking', 'vegetables', 'water', 'sugar', 'planning', 'eating_out', 'unsure']).optional(),
  dailyTimeCommitment: z.enum(['5_to_10', '10_to_20', '20_to_30', '30_to_45', '45_to_60']).optional(),
  morningReminderTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format')
    .optional(),
  eveningReminderTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format')
    .optional(),
  middayNudgeEnabled: z.boolean().optional(),
  biggestObstacle: z.enum(['time', 'motivation', 'knowledge', 'support', 'consistency']).optional(),
  dietPreference: z.enum(['no_preference', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo', 'mediterranean', 'gluten_free', 'dairy_free']).optional(),
  fitnessConfidence: z.number().min(1).max(5).optional(),
});

// Checkin validation
export const checkinSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  mood: z.enum(['great', 'good', 'okay', 'tough', 'struggling']).optional(),
  energyLevel: z.number().min(1).max(5).optional(),
  sleepQuality: z.number().min(1).max(5).optional(),
  stressLevel: z.number().min(1).max(5).optional(),
  activityCompleted: z.boolean().optional(),
  nutritionResponses: z.array(z.boolean().nullable()).max(10).optional(),
  habitCompletion: z.enum(['none', 'partial', 'all']).optional(),
});

// Coach message validation
export const coachMessageSchema = z.object({
  message: z.string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message must be less than 2000 characters'),
});

// Buddy connection validation
export const buddyConnectionSchema = z.object({
  buddyId: z.string().uuid('Invalid buddy ID'),
  status: z.enum(['pending', 'active', 'declined']).optional(),
});

// Exit feedback validation
export const exitFeedbackSchema = z.object({
  reason: z.enum([
    'too_busy',
    'too_confusing',
    'no_results',
    'not_expected',
    'too_expensive',
    'other'
  ]),
});

// =====================================================
// VALIDATION HELPER FUNCTIONS
// =====================================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => e.message);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}

// =====================================================
// SANITIZATION FUNCTIONS
// =====================================================

/**
 * Sanitize text for safe display (prevents XSS)
 * Strips all HTML tags and escapes special characters
 */
export function sanitizeForDisplay(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize text for use in URLs
 */
export function sanitizeForUrl(text: string): string {
  if (!text) return '';
  return encodeURIComponent(text.trim());
}

/**
 * Validate and sanitize a UUID
 */
export function isValidUuid(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// =====================================================
// RATE LIMITING (Client-side tracking)
// =====================================================

interface RateLimitEntry {
  count: number;
  lastAttempt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_CONFIG = {
  login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  coachMessage: { maxAttempts: 20, windowMs: 60 * 1000 }, // 20 messages per minute
  checkin: { maxAttempts: 10, windowMs: 60 * 1000 }, // 10 checkins per minute
};

export function checkRateLimit(
  key: string,
  type: keyof typeof RATE_LIMIT_CONFIG
): { allowed: boolean; retryAfterMs?: number } {
  const config = RATE_LIMIT_CONFIG[type];
  const entry = rateLimitStore.get(key);
  const now = Date.now();

  if (!entry) {
    rateLimitStore.set(key, { count: 1, lastAttempt: now });
    return { allowed: true };
  }

  // Reset if window expired
  if (now - entry.lastAttempt > config.windowMs) {
    rateLimitStore.set(key, { count: 1, lastAttempt: now });
    return { allowed: true };
  }

  // Check if exceeded
  if (entry.count >= config.maxAttempts) {
    const retryAfterMs = config.windowMs - (now - entry.lastAttempt);
    return { allowed: false, retryAfterMs };
  }

  // Increment count
  entry.count++;
  entry.lastAttempt = now;
  rateLimitStore.set(key, entry);
  return { allowed: true };
}

export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}
