import { Purchases, LOG_LEVEL, PURCHASES_ERROR_CODE } from '@revenuecat/purchases-capacitor';
import { supabase } from '@/integrations/supabase/client';
import { Capacitor } from '@capacitor/core';

// =====================================================
// REVENUECAT SERVICE - Apple In-App Purchases
// =====================================================

export const REVENUECAT_API_KEY = 'appl_XxDmzrFrcZOHxuguIdFkuJzBDnq';

export const PRODUCT_IDS = {
  MONTHLY: 'com.steadysteps.monthly',
  ANNUAL: 'com.steadysteps.annual',
} as const;

export const ENTITLEMENT_ID = 'premium';

// Demo account for App Store review
const DEMO_EMAIL = 'demo@steadystepsapp.com';

export interface RevenueCatOffering {
  identifier: string;
  availablePackages: RevenueCatPackage[];
}

export interface RevenueCatPackage {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    priceString: string;
    price: number;
  };
}

export interface CustomerInfo {
  entitlements: {
    active: Record<string, {
      identifier: string;
      isActive: boolean;
      willRenew: boolean;
      expirationDate?: string;
    }>;
  };
  originalAppUserId: string;
  originalPurchaseDate?: string;
}

let isConfigured = false;

/**
 * Check if RevenueCat is available (native platform only)
 */
export function isRevenueCatAvailable(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Configure RevenueCat with user ID
 */
export async function configureRevenueCat(userId: string): Promise<boolean> {
  if (!isRevenueCatAvailable()) {
    console.log('RevenueCat not available on web platform');
    return false;
  }

  try {
    if (isConfigured) {
      console.log('RevenueCat already configured');
      return true;
    }

    console.log('Configuring RevenueCat with user:', userId);
    
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
    
    await Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
      appUserID: userId,
    });

    isConfigured = true;
    console.log('RevenueCat configured successfully');
    return true;
  } catch (error) {
    console.error('Failed to configure RevenueCat:', error);
    return false;
  }
}

/**
 * Get available offerings from RevenueCat
 */
export async function getOfferings(): Promise<RevenueCatOffering | null> {
  if (!isRevenueCatAvailable()) {
    console.log('RevenueCat not available - returning null offerings');
    return null;
  }

  try {
    const offerings = await Purchases.getOfferings();
    console.log('Fetched offerings:', offerings);
    
    if (offerings.current) {
      return offerings.current as unknown as RevenueCatOffering;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return null;
  }
}

/**
 * Purchase a package
 */
export async function purchasePackage(packageToPurchase: RevenueCatPackage): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
  cancelled?: boolean;
}> {
  if (!isRevenueCatAvailable()) {
    return { 
      success: false, 
      error: 'In-app purchases require the native iOS app.' 
    };
  }

  try {
    console.log('Purchasing package:', packageToPurchase);
    
    const { customerInfo } = await Purchases.purchasePackage({
      aPackage: packageToPurchase as any,
    });

    console.log('Purchase result:', customerInfo);
    
    // Check if premium entitlement is now active
    if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
      return { 
        success: true, 
        customerInfo: customerInfo as unknown as CustomerInfo 
      };
    }

    return { 
      success: false, 
      error: 'Purchase completed but subscription not activated.' 
    };
  } catch (error: any) {
    console.error('Purchase error:', error);
    
    // Check if user cancelled
    if (
      error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR ||
      error.code === 'PURCHASE_CANCELLED' ||
      error.message?.includes('cancel')
    ) {
      return { success: false, cancelled: true };
    }

    return { 
      success: false, 
      error: error.message || 'Purchase failed. Please try again.' 
    };
  }
}

/**
 * Restore previous purchases
 */
export async function restorePurchases(): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  if (!isRevenueCatAvailable()) {
    return { 
      success: false, 
      error: 'Restore purchases requires the native iOS app.' 
    };
  }

  try {
    console.log('Restoring purchases...');
    const { customerInfo } = await Purchases.restorePurchases();
    
    console.log('Restore result:', customerInfo);
    
    if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
      return { 
        success: true, 
        customerInfo: customerInfo as unknown as CustomerInfo 
      };
    }

    return { 
      success: false, 
      error: 'No active subscription found.' 
    };
  } catch (error: any) {
    console.error('Restore error:', error);
    return { 
      success: false, 
      error: error.message || 'Unable to restore purchases.' 
    };
  }
}

/**
 * Get current customer info
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!isRevenueCatAvailable()) {
    return null;
  }

  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo as unknown as CustomerInfo;
  } catch (error) {
    console.error('Failed to get customer info:', error);
    return null;
  }
}

/**
 * Check if user has active premium subscription
 */
export async function checkPremiumStatus(userId: string, userEmail?: string): Promise<{
  isPremium: boolean;
  source: 'revenuecat' | 'database' | 'demo';
  expirationDate?: string;
}> {
  // Demo account bypass
  if (userEmail === DEMO_EMAIL) {
    return { isPremium: true, source: 'demo' };
  }

  // Check RevenueCat first if available
  if (isRevenueCatAvailable()) {
    try {
      const { customerInfo } = await Purchases.getCustomerInfo();
      const premiumEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
      
      if (premiumEntitlement?.isActive) {
        // Also update database to keep in sync
        await syncSubscriptionToDatabase(userId, customerInfo as unknown as CustomerInfo);
        
        return { 
          isPremium: true, 
          source: 'revenuecat',
          expirationDate: premiumEntitlement.expirationDate
        };
      }
    } catch (error) {
      console.error('RevenueCat status check failed:', error);
    }
  }

  // Fall back to database check
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_product_id')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Database check error:', error);
      return { isPremium: false, source: 'database' };
    }

    // Require both active status AND Apple product ID
    const paidStatuses = ['active', 'subscribed'];
    const hasValidStatus = profile.subscription_status && paidStatuses.includes(profile.subscription_status);
    const hasAppleTransaction = profile.subscription_product_id && 
      (profile.subscription_product_id === PRODUCT_IDS.MONTHLY || 
       profile.subscription_product_id === PRODUCT_IDS.ANNUAL);

    return { 
      isPremium: hasValidStatus && hasAppleTransaction, 
      source: 'database' 
    };
  } catch (error) {
    console.error('Premium status check failed:', error);
    return { isPremium: false, source: 'database' };
  }
}

/**
 * Sync RevenueCat subscription to database
 */
export async function syncSubscriptionToDatabase(
  userId: string, 
  customerInfo: CustomerInfo
): Promise<void> {
  try {
    const premiumEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
    
    if (premiumEntitlement?.isActive) {
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_product_id: premiumEntitlement.identifier,
          onboarding_completed: true,
        })
        .eq('id', userId);
      
      console.log('Subscription synced to database');
    }
  } catch (error) {
    console.error('Failed to sync subscription to database:', error);
  }
}

/**
 * Record successful purchase in database
 */
export async function recordPurchaseInDatabase(
  userId: string,
  productId: string,
  transactionId?: string
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
