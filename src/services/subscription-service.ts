import { supabase } from '@/integrations/supabase/client';

// =====================================================
// SUBSCRIPTION SERVICE - Handles subscription operations
// =====================================================

export interface SubscriptionStatus {
  subscribed: boolean;
  status: 'trial' | 'active' | 'trialing' | 'canceled' | 'none' | string;
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

/**
 * Check subscription status via edge function
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

    const { data, error } = await supabase.functions.invoke('check-subscription');

    if (error) {
      console.error('Subscription check error:', error);
      return { success: false, error: error.message };
    }

    const status: SubscriptionStatus = {
      subscribed: data?.subscribed ?? false,
      status: data?.status || 'none',
      productId: data?.productId,
      subscriptionEnd: data?.subscriptionEnd
    };

    // Update cache
    subscriptionCache = {
      data: status,
      timestamp: Date.now()
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
    status.status === 'trialing';
}

/**
 * Clear subscription cache (call after payment or cancellation)
 */
export function clearSubscriptionCache(): void {
  subscriptionCache = null;
}

/**
 * Create checkout session for subscription
 */
export async function createCheckoutSession(
  priceId: string,
  successUrl?: string,
  cancelUrl?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const origin = window.location.origin;
    
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: {
        priceId,
        successUrl: successUrl || `${origin}/profile-setup?payment=success`,
        cancelUrl: cancelUrl || `${origin}/profile-setup?payment=cancel`
      }
    });

    if (error) {
      console.error('Checkout creation error:', error);
      return { success: false, error: error.message };
    }

    if (!data?.url) {
      return { success: false, error: 'No checkout URL returned' };
    }

    return { success: true, url: data.url };
  } catch (error) {
    console.error('Checkout creation failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Open customer portal for subscription management
 */
export async function openCustomerPortal(): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('customer-portal');

    if (error) {
      console.error('Customer portal error:', error);
      return { success: false, error: error.message };
    }

    if (!data?.url) {
      return { success: false, error: 'No portal URL returned' };
    }

    return { success: true, url: data.url };
  } catch (error) {
    console.error('Customer portal failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.functions.invoke('cancel-subscription');

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
