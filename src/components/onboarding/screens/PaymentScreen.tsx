 import { useState, useEffect, useCallback } from 'react';
 import { Button } from '@/components/ui/button';
 import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
 import { useLanguage } from '@/hooks/useLanguage';
 import { useAuth } from '@/hooks/useAuth';
 import { supabase } from '@/integrations/supabase/client';
 import { Capacitor } from '@capacitor/core';
 import {
   configureSuperwall,
   showPaywall,
   checkSubscriptionStatus,
   hasActiveSubscription,
   restorePurchases,
   isSuperwallAvailable,
 } from '@/services/superwall-service';
 
 interface PaymentScreenProps {
   onNext: () => void;
 }
 
 // Demo account email for App Store review
 const DEMO_EMAIL = 'demo@steadystepsapp.com';
 
 export const PaymentScreen = ({ onNext }: PaymentScreenProps) => {
   const { language } = useLanguage();
   const { user } = useAuth();
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [showRetry, setShowRetry] = useState(false);
   const [isRestoring, setIsRestoring] = useState(false);
   const [debugLogs, setDebugLogs] = useState<string[]>([]);
 
   const addLog = useCallback((message: string) => {
     console.log(message);
     setDebugLogs(prev => [...prev.slice(-20), `${new Date().toLocaleTimeString()}: ${message}`]);
   }, []);
 
   useEffect(() => {
     handlePaymentFlow();
   }, []);
 
   async function handlePaymentFlow() {
     setIsLoading(true);
     setError(null);
     setShowRetry(false);
 
     try {
       addLog('=== PAYMENT SCREEN STARTED ===');
       addLog(`Platform: ${Capacitor.getPlatform()}`);
       addLog(`isNative: ${Capacitor.isNativePlatform()}`);
       addLog(`Superwall available: ${isSuperwallAvailable()}`);
 
       if (!user) {
         addLog('No user found - cannot proceed');
         setError('Authentication required');
         setShowRetry(true);
         setIsLoading(false);
         return;
       }
 
       addLog(`User ID: ${user.id}`);
       addLog(`User email: ${user.email}`);
 
       // Check for demo account
       if (user.email === DEMO_EMAIL) {
         addLog('Demo account - bypassing payment');
         await markOnboardingComplete(user.id);
         onNext();
         return;
       }
 
       // Check if user already has valid subscription in database
       const { data: profile, error: profileError } = await supabase
         .from('profiles')
         .select('subscription_status, subscription_product_id, onboarding_completed')
         .eq('id', user.id)
         .single();
 
       if (profileError) {
         addLog(`Profile fetch error: ${profileError.message}`);
       } else {
         addLog(`Profile: ${JSON.stringify(profile)}`);
       }
 
       // Check if already subscribed
       const isSubscribed = profile?.subscription_status === 'subscribed' || 
                           profile?.subscription_status === 'active';
       
       if (isSubscribed) {
         addLog('Already subscribed in database - proceeding to app');
         await markOnboardingComplete(user.id);
         onNext();
         return;
       }
 
       // Configure Superwall
       addLog('Configuring Superwall...');
       await configureSuperwall(user.id);
       addLog('Superwall configured');
 
       // Check if already subscribed via Superwall
       const superwallSubscribed = await hasActiveSubscription();
       addLog(`Superwall subscription active: ${superwallSubscribed}`);
       
       if (superwallSubscribed) {
         addLog('Active subscription found via Superwall');
         await updateSubscriptionStatus(user.id);
         await markOnboardingComplete(user.id);
         onNext();
         return;
       }
 
       // Show Superwall paywall
       addLog('Showing Superwall paywall...');
       setIsLoading(false);
       
       await showPaywall();
       addLog('Paywall closed');
 
       // Check subscription status after paywall closes
       setIsLoading(true);
       const status = await checkSubscriptionStatus();
       addLog(`Status after paywall: ${status}`);
 
       if (status === 'ACTIVE') {
         addLog('User subscribed successfully');
         await updateSubscriptionStatus(user.id);
         await markOnboardingComplete(user.id);
         onNext();
       } else {
         addLog('User did not subscribe');
         setShowRetry(true);
         setIsLoading(false);
       }
 
     } catch (err: any) {
       addLog('=== PAYMENT FLOW ERROR ===');
       addLog(`Error: ${err.message || err}`);
       setError(err.message || 'Unable to load payment options');
       setShowRetry(true);
       setIsLoading(false);
     }
   }
 
   async function updateSubscriptionStatus(userId: string) {
     try {
       await supabase
         .from('profiles')
         .update({
           subscription_status: 'subscribed',
           trial_start_date: new Date().toISOString(),
         })
         .eq('id', userId);
       addLog('Database updated with subscription status');
     } catch (err) {
       addLog(`Error updating subscription: ${err}`);
     }
   }
 
   async function markOnboardingComplete(userId: string) {
     try {
       await supabase
         .from('profiles')
         .update({
           onboarding_completed: true,
         })
         .eq('id', userId);
       addLog('Onboarding marked complete');
     } catch (err) {
       addLog(`Error marking onboarding complete: ${err}`);
     }
   }
 
   async function handleRestore() {
     setIsRestoring(true);
     addLog('Starting restore...');
     
     try {
       await restorePurchases();
       const status = await checkSubscriptionStatus();
       addLog(`Restore status: ${status}`);
       
       if (status === 'ACTIVE' && user) {
         await updateSubscriptionStatus(user.id);
         await markOnboardingComplete(user.id);
         onNext();
       } else {
         setError(language === 'en' 
           ? 'No active subscription found' 
           : 'No se encontró suscripción activa');
       }
     } catch (err: any) {
       addLog(`Restore error: ${err.message}`);
       setError(err.message || 'Unable to restore purchases');
     } finally {
       setIsRestoring(false);
     }
   }
 
   function handleRetry() {
     handlePaymentFlow();
   }
 
   const texts = {
     en: {
       loading: 'Loading...',
       subscriptionRequired: 'Subscription Required',
       subscriptionDesc: 'A subscription is required to access SteadySteps and start your fitness journey.',
       viewOptions: 'View Subscription Options',
       restore: 'Restore Purchases',
       restoring: 'Restoring...',
       tryAgain: 'Try Again',
       unableToLoad: 'Unable to Load',
       checkConnection: 'Could not connect to the App Store. Please check your internet connection.',
     },
     es: {
       loading: 'Cargando...',
       subscriptionRequired: 'Suscripción Requerida',
       subscriptionDesc: 'Se requiere una suscripción para acceder a SteadySteps y comenzar tu viaje fitness.',
       viewOptions: 'Ver Opciones de Suscripción',
       restore: 'Restaurar Compras',
       restoring: 'Restaurando...',
       tryAgain: 'Intentar de Nuevo',
       unableToLoad: 'No se pudo cargar',
       checkConnection: 'No se pudo conectar con la App Store. Verifica tu conexión a internet.',
     },
   };
 
   const localT = texts[language];
 
   // Debug panel component
   const DebugPanel = () => (
     <div style={{
       background: 'black',
       color: 'lime',
       padding: '10px',
       fontSize: '10px',
       maxHeight: '200px',
       overflow: 'auto',
       marginBottom: '20px',
       width: '100%',
       textAlign: 'left',
       borderRadius: '8px'
     }}>
       <p>Platform: {Capacitor.getPlatform()}</p>
       <p>isNative: {String(Capacitor.isNativePlatform())}</p>
       <p>Superwall: {String(isSuperwallAvailable())}</p>
       <p>User: {user?.id?.slice(0, 8) || 'none'}...</p>
       <p>Error: {error || 'none'}</p>
       <hr style={{ margin: '5px 0', borderColor: 'lime' }} />
       {debugLogs.slice(-10).map((log, i) => (
         <p key={i} style={{ margin: '2px 0' }}>{log}</p>
       ))}
     </div>
   );
 
   // Loading state
   if (isLoading) {
     return (
       <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
         <DebugPanel />
         <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
         <p className="text-muted-foreground">{localT.loading}</p>
       </div>
     );
   }
 
   // Error or retry state
   if (showRetry) {
     return (
       <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
         <DebugPanel />
         
         <AlertCircle className="w-12 h-12 text-destructive mb-4" />
         <h2 className="text-xl font-semibold mb-2">
           {error ? localT.unableToLoad : localT.subscriptionRequired}
         </h2>
         <p className="text-muted-foreground mb-6 max-w-xs">
           {error || localT.subscriptionDesc}
         </p>
         
         <div className="space-y-3 w-full max-w-xs">
           <Button onClick={handleRetry} className="w-full" size="lg">
             <RefreshCw className="w-4 h-4 mr-2" />
             {error ? localT.tryAgain : localT.viewOptions}
           </Button>
           
           <Button 
             variant="outline" 
             onClick={handleRestore} 
             disabled={isRestoring}
             className="w-full"
           >
             {isRestoring ? localT.restoring : localT.restore}
           </Button>
         </div>
       </div>
     );
   }
 
   // Default: Superwall will show its own UI
   return null;
 };