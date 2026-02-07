import { Capacitor } from '@capacitor/core';

const REVENUECAT_API_KEY = 'appl_XxDmzrFrcZOHxuguIdFkuJzBDnq';

let isConfigured = false;
let Purchases: any = null;
let LOG_LEVEL: any = null;

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
 * Show RevenueCat paywall
 */
export async function showPaywall(): Promise<boolean> {
  console.log('=== SHOWING REVENUECAT PAYWALL ===');

  try {
    const { Purchases: RC } = await getRevenueCatModule();
    
    const result = await RC.presentPaywall();
    console.log('Paywall result:', result);
    
    return result.paywallResponse === 'PURCHASED' || result.paywallResponse === 'RESTORED';
  } catch (error) {
    console.error('Show paywall error:', error);
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
