 import { Capacitor } from '@capacitor/core';
 
 const SUPERWALL_API_KEY = 'pk_BM5TTdlngfufc6_IVITZu';
 
 let isConfigured = false;
 let Superwall: any = null;
 
 /**
  * Check if Superwall is available (native platform only)
  */
 export function isSuperwallAvailable(): boolean {
   return Capacitor.isNativePlatform();
 }
 
 /**
  * Dynamically import Superwall to avoid web bundling issues
  */
 async function getSuperwallModule() {
   if (Superwall) return Superwall;
   
   try {
     const module = await import('@capawesome/capacitor-superwall');
     Superwall = module.Superwall;
     return Superwall;
   } catch (error) {
     console.error('Failed to import Superwall module:', error);
     throw new Error('Superwall SDK not available');
   }
 }
 
 /**
  * Configure Superwall with user ID
  */
 export async function configureSuperwall(userId?: string): Promise<boolean> {
   if (isConfigured) {
     console.log('Superwall already configured');
     return true;
   }
 
   console.log('=== CONFIGURING SUPERWALL ===');
   console.log('User ID:', userId);
   console.log('API Key:', SUPERWALL_API_KEY);
   console.log('Platform:', Capacitor.getPlatform());
   console.log('isNative:', Capacitor.isNativePlatform());
 
   try {
     const SW = await getSuperwallModule();
     
     await SW.configure({
       apiKey: SUPERWALL_API_KEY,
       userId: userId || undefined,
     });
     
     isConfigured = true;
     console.log('Superwall configured successfully');
     return true;
   } catch (error) {
     console.error('Superwall configure error:', error);
     throw error;
   }
 }
 
 /**
  * Show Superwall paywall
  */
 export async function showPaywall(): Promise<any> {
   console.log('=== SHOWING SUPERWALL PAYWALL ===');
 
   try {
     const SW = await getSuperwallModule();
     
     const result = await SW.register({
       event: 'app_launch',
     });
     
     console.log('Paywall result:', result);
     return result;
   } catch (error) {
     console.error('Show paywall error:', error);
     throw error;
   }
 }
 
 /**
  * Check subscription status via Superwall
  */
 export async function checkSubscriptionStatus(): Promise<string> {
   console.log('=== CHECKING SUBSCRIPTION STATUS ===');
 
   try {
     const SW = await getSuperwallModule();
     const status = await SW.getSubscriptionStatus();
     console.log('Subscription status:', status);
     return status?.status || 'UNKNOWN';
   } catch (error) {
     console.error('Subscription check error:', error);
     return 'UNKNOWN';
   }
 }
 
 /**
  * Restore purchases via Superwall
  */
 export async function restorePurchases(): Promise<any> {
   console.log('=== RESTORING PURCHASES ===');
 
   try {
     const SW = await getSuperwallModule();
     const result = await SW.restorePurchases();
     console.log('Restore result:', result);
     return result;
   } catch (error) {
     console.error('Restore error:', error);
     throw error;
   }
 }
 
 /**
  * Check if user has active subscription
  */
 export async function hasActiveSubscription(): Promise<boolean> {
   try {
     const status = await checkSubscriptionStatus();
     return status === 'ACTIVE';
   } catch (error) {
     console.error('Error checking active subscription:', error);
     return false;
   }
 }
 
 /**
  * Open Apple subscription management
  */
 export async function showManageSubscriptions(): Promise<void> {
   console.log('=== SHOWING SUBSCRIPTION MANAGEMENT ===');
   
   try {
     // Open Apple's subscription management page
     window.open('https://apps.apple.com/account/subscriptions', '_blank');
   } catch (error) {
     console.error('Error opening subscription management:', error);
     throw error;
   }
 }