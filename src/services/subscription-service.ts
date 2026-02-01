import { supabase } from '@/integrations/supabase/client';
import { verifyPaymentStatus as verifyIAPPayment, isValidSubscription as isValidIAPSubscription } from './iap-service';

// =====================================================
// SUBSCRIPTION SERVICE - Handles subscription operations
// Now uses Apple In-App Purchases instead of Stripe
// =====================================================

export interface SubscriptionStatus {
  subscribed: boolean;
  status: 'trial' | 'active' | 'trialing' | 'canceled' | 'none' | 'demo' | string;
  productId?: string;
  subscriptionEnd?: string;
}

export interface SubscriptionResult {
  success: boolean;
  data?: SubscriptionStatus;
  error?: string;
}

// Cache subscription status to reduce API calls
let subscriptionCache: {
  data: SubscriptionStatus | null;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 60 * 1000; // 1 minute

// Demo account for Apple App Review
const DEMO_EMAIL = 'demo@steadystepsapp.com';

/**
 * Check subscription status from database
 * This replaces the old Stripe-based check
 */
export async function checkSubscriptionStatus(
  forceRefresh: boolean = false
): Promise<SubscriptionResult> {
  try {
    // Return cached data if valid and not forcing refresh
    if (!forceRefresh && subscriptionCache) {
      const cacheAge = Date.now() - subscriptionCache.timestamp;
      if (cacheAge < CACHE_DURATION && subscriptionCache.data) {
        return { success: true, data: subscriptionCache.data };
      }
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'No user found' };
    }

    // Demo account bypass for Apple App Review
    if (user.email === DEMO_EMAIL) {
      const demoStatus: SubscriptionStatus = {
        subscribed: true,
        status: 'demo',
      };
      subscriptionCache = { data: demoStatus, timestamp: Date.now() };
      return { success: true, data: demoStatus };
    }

    // Check database for subscription status
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_product_id, subscription_end_date')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Subscription check error:', error);
      return { success: false, error: error.message };
    }

    const validStatuses = ['trial', 'active', 'trialing', 'subscribed'];
    const isSubscribed = profile?.subscription_status && 
      validStatuses.includes(profile.subscription_status);

    const status: SubscriptionStatus = {
      subscribed: isSubscribed,
      status: profile?.subscription_status || 'none',
      productId: profile?.subscription_product_id || undefined,
      subscriptionEnd: profile?.subscription_end_date || undefined,
    };

    // Update cache
    subscriptionCache = {
      data: status,
      timestamp: Date.now(),
    };

    return { success: true, data: status };
  } catch (error) {
    console.error('Subscription check failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Check if user has valid subscription
 */
export function isValidSubscription(status?: SubscriptionStatus): boolean {
  if (!status) return false;
  return status.subscribed || 
    status.status === 'trial' || 
    status.status === 'active' || 
    status.status === 'trialing' ||
    status.status === 'subscribed' ||
    status.status === 'demo';
}

/**
 * Clear subscription cache (call after purchase or cancellation)
 */
export function clearSubscriptionCache(): void {
  subscriptionCache = null;
}

/**
 * Cancel subscription - updates local database
 * For Apple subscriptions, users manage through Settings > Subscriptions
 */
export async function cancelSubscription(): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'No user found' };
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'cancelled',
        subscription_end_date: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error('Cancel subscription error:', error);
      return { success: false, error: error.message };
    }

    // Clear cache after cancellation
    clearSubscriptionCache();

    return { success: true };
  } catch (error) {
    console.error('Cancel subscription failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Re-export IAP functions for convenience
export { verifyIAPPayment as verifyPaymentStatus, isValidIAPSubscription };
