import { supabase } from '@/integrations/supabase/client';

// =====================================================
// APPLE IN-APP PURCHASE SERVICE
// =====================================================

export const PRODUCT_IDS = {
  MONTHLY: 'com.steadysteps.monthly',
  ANNUAL: 'com.steadysteps.annual',
} as const;

// Demo account for Apple App Review
const DEMO_EMAIL = 'demo@steadystepsapp.com';

export interface IAPProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceAmountMicros: number;
  priceCurrencyCode: string;
}

export interface PaymentVerificationResult {
  isPaid: boolean;
  status: 'subscribed' | 'trial' | 'none' | 'error' | 'demo';
  message?: string;
  subscriptionType?: string;
}

/**
 * Verify payment status by checking database
 * This replaces Stripe subscription checks
 */
export async function verifyPaymentStatus(userId: string, userEmail?: string): Promise<PaymentVerificationResult> {
  try {
    // Demo account bypass for Apple App Review
    if (userEmail === DEMO_EMAIL) {
      return { 
        isPaid: true, 
        status: 'demo',
        message: 'Demo account access granted.'
      };
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_product_id')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking payment status:', error);
      return { 
        isPaid: false, 
        status: 'error',
        message: 'Unable to verify payment status. Please try again.'
      };
    }

    // Check the subscription status
    const validStatuses = ['trial', 'active', 'trialing', 'subscribed'];
    
    if (profile.subscription_status && validStatuses.includes(profile.subscription_status)) {
      return { 
        isPaid: true, 
        status: 'subscribed',
        subscriptionType: profile.subscription_product_id || undefined,
        message: 'Subscription verified successfully.'
      };
    }

    return { 
      isPaid: false, 
      status: 'none',
      message: 'No active subscription found. Please subscribe to continue.'
    };

  } catch (error) {
    console.error('Payment verification error:', error);
    return { 
      isPaid: false, 
      status: 'error',
      message: 'Unable to verify payment. Please try again.'
    };
  }
}

/**
 * Check if valid subscription exists
 */
export function isValidSubscription(result?: PaymentVerificationResult): boolean {
  if (!result) return false;
  return result.isPaid || result.status === 'subscribed' || result.status === 'demo';
}

/**
 * Record successful Apple IAP purchase in database
 */
export async function recordApplePurchase(
  userId: string,
  productId: string,
  transactionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_product_id: productId,
        trial_start_date: new Date().toISOString(),
        onboarding_completed: true,
      })
      .eq('id', userId);

    if (error) {
      console.error('Failed to record purchase:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Record purchase error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Record restored purchase
 */
export async function recordRestoredPurchase(
  userId: string,
  productId: string,
  transactionId: string
): Promise<{ success: boolean; error?: string }> {
  return recordApplePurchase(userId, productId, transactionId);
}

/**
 * Cancel subscription (update local status)
 */
export async function cancelSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'cancelled',
        subscription_end_date: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Failed to cancel subscription:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
