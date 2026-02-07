import { Capacitor } from '@capacitor/core';

const REVENUECAT_API_KEY = 'appl_XxDmzrFrcZOHxuguIdFkuJzBDnq';

let isConfigured = false;
let Purchases: any = null;
let LOG_LEVEL: any = null;

export interface RevenueCatPackage {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    priceString: string;
    price: number;
  };
}

export interface RevenueCatOffering {
  identifier: string;
  availablePackages: RevenueCatPackage[];
}

/**
 * Check if RevenueCat is available (native platform only)
 */
export function isRevenueCatAvailable(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Dynamically import RevenueCat to avoid web bundling issues
 */
async function getRevenueCatModule() {
  if (Purchases) return { Purchases, LOG_LEVEL };
  
  try {
    const module = await import('@revenuecat/purchases-capacitor');
    Purchases = module.Purchases;
    LOG_LEVEL = module.LOG_LEVEL;
    return { Purchases, LOG_LEVEL };
  } catch (error) {
    console.error('Failed to import RevenueCat module:', error);
    throw new Error('RevenueCat SDK not available');
  }
}

/**
 * Configure RevenueCat with user ID
 */
export async function configureRevenueCat(userId?: string): Promise<boolean> {
  if (isConfigured) {
    console.log('RevenueCat already configured');
    return true;
  }

  console.log('=== CONFIGURING REVENUECAT ===');
  console.log('User ID:', userId);
  console.log('API Key:', REVENUECAT_API_KEY);
  console.log('Platform:', Capacitor.getPlatform());
  console.log('isNative:', Capacitor.isNativePlatform());

  try {
    const { Purchases: RC, LOG_LEVEL: LOG } = await getRevenueCatModule();
    
    await RC.setLogLevel({ level: LOG.DEBUG });
    
    if (userId) {
      await RC.configure({ apiKey: REVENUECAT_API_KEY, appUserID: userId });
    } else {
      await RC.configure({ apiKey: REVENUECAT_API_KEY });
    }
    
    isConfigured = true;
    console.log('RevenueCat configured successfully');
    return true;
  } catch (error) {
    console.error('RevenueCat configure error:', error);
    throw error;
  }
}

/**
 * Get available offerings from RevenueCat
 */
export async function getOfferings(): Promise<RevenueCatOffering | null> {
  console.log('=== GETTING REVENUECAT OFFERINGS ===');

  try {
    const { Purchases: RC } = await getRevenueCatModule();
    
    console.log('Calling RC.getOfferings()...');
    const result = await RC.getOfferings();
    
    console.log('Full offerings result:', JSON.stringify(result, null, 2));
    
    if (!result) {
      console.log('getOfferings returned null/undefined');
      return null;
    }
    
    const { offerings } = result;
    
    if (!offerings) {
      console.log('offerings object is null/undefined');
      return null;
    }
    
    console.log('offerings.current:', offerings.current);
    console.log('offerings.all:', offerings.all);
    
    if (offerings.current) {
      console.log('Returning current offering:', offerings.current.identifier);
      console.log('Available packages:', offerings.current.availablePackages?.length || 0);
      return offerings.current as RevenueCatOffering;
    }
    
    // If no current offering, try to get the first available one
    if (offerings.all && Object.keys(offerings.all).length > 0) {
      const firstKey = Object.keys(offerings.all)[0];
      console.log('No current offering, using first available:', firstKey);
      return offerings.all[firstKey] as RevenueCatOffering;
    }
    
    console.log('No offerings available');
    return null;
  } catch (error) {
    console.error('Get offerings error:', error);
    throw error;
  }
}

/**
 * Purchase a package
 */
export async function purchasePackage(pkg: RevenueCatPackage): Promise<boolean> {
  console.log('=== PURCHASING PACKAGE ===');
  console.log('Package:', pkg);

  try {
    const { Purchases: RC } = await getRevenueCatModule();
    
    const { customerInfo } = await RC.purchasePackage({ aPackage: pkg });
    console.log('Purchase result:', customerInfo);
    
    const isActive = customerInfo.entitlements.active['pro'] !== undefined;
    console.log('Subscription active after purchase:', isActive);
    
    return isActive;
  } catch (error: any) {
    // Check if user cancelled
    if (error.code === 1 || error.message?.includes('cancelled') || error.message?.includes('canceled')) {
      console.log('User cancelled purchase');
      return false;
    }
    console.error('Purchase error:', error);
    throw error;
  }
}

/**
 * Check subscription status via RevenueCat
 */
export async function checkSubscriptionStatus(): Promise<boolean> {
  console.log('=== CHECKING SUBSCRIPTION STATUS ===');

  try {
    const { Purchases: RC } = await getRevenueCatModule();
    const { customerInfo } = await RC.getCustomerInfo();
    
    const isActive = customerInfo.entitlements.active['pro'] !== undefined;
    console.log('Subscription active:', isActive);
    console.log('Entitlements:', customerInfo.entitlements);
    
    return isActive;
  } catch (error) {
    console.error('Subscription check error:', error);
    return false;
  }
}

/**
 * Restore purchases via RevenueCat
 */
export async function restorePurchases(): Promise<boolean> {
  console.log('=== RESTORING PURCHASES ===');

  try {
    const { Purchases: RC } = await getRevenueCatModule();
    const { customerInfo } = await RC.restorePurchases();
    
    const isActive = customerInfo.entitlements.active['pro'] !== undefined;
    console.log('Restore result, active:', isActive);
    
    return isActive;
  } catch (error) {
    console.error('Restore error:', error);
    throw error;
  }
}

/**
 * Open Apple subscription management
 */
export function openSubscriptionManagement(): void {
  console.log('=== OPENING SUBSCRIPTION MANAGEMENT ===');
  window.open('https://apps.apple.com/account/subscriptions', '_blank');
}
