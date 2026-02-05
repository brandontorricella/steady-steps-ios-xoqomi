 import { useState, useEffect } from 'react';
 import { motion } from 'framer-motion';
 import { ArrowLeft, CreditCard, Check, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
 import { useNavigate } from 'react-router-dom';
 import { Button } from '@/components/ui/button';
 import { useLanguage } from '@/hooks/useLanguage';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 import { BottomNavigation } from '@/components/navigation/BottomNavigation';
 import {
   configureSuperwall,
   showPaywall,
   checkSubscriptionStatus,
   restorePurchases,
   showManageSubscriptions,
   isSuperwallAvailable,
 } from '@/services/superwall-service';
 
 export const SubscriptionPage = () => {
   const navigate = useNavigate();
   const { t, language } = useLanguage();
   const [showCancelFlow, setShowCancelFlow] = useState(false);
   const [cancelStep, setCancelStep] = useState(1);
   const [cancelConfirmed, setCancelConfirmed] = useState(false);
   const [isProcessing, setIsProcessing] = useState(false);
   const [isChangingPlan, setIsChangingPlan] = useState(false);
   const [isRestoring, setIsRestoring] = useState(false);
   const [subscriptionStatus, setSubscriptionStatus] = useState<string>('Loading...');
   const [currentPlan, setCurrentPlan] = useState<'monthly' | 'annual'>('monthly');
   const [userId, setUserId] = useState<string | null>(null);
 
   // Initialize and fetch current subscription info
   useEffect(() => {
     async function initialize() {
       try {
         const { data: { user } } = await supabase.auth.getUser();
         if (!user) return;
         
         setUserId(user.id);
 
         // Check current plan from database
         const { data: profile } = await supabase
           .from('profiles')
           .select('subscription_product_id, subscription_status')
           .eq('id', user.id)
           .single();
 
         if (profile?.subscription_product_id?.includes('annual')) {
           setCurrentPlan('annual');
         }
         
         setSubscriptionStatus(profile?.subscription_status === 'subscribed' || profile?.subscription_status === 'active' 
           ? 'Active' 
           : 'Inactive');
 
         // Configure Superwall if on native platform
         if (isSuperwallAvailable()) {
           await configureSuperwall(user.id);
           const status = await checkSubscriptionStatus();
           if (status === 'ACTIVE') {
             setSubscriptionStatus('Active');
           }
         }
       } catch (error) {
         console.error('Error initializing subscription page:', error);
         setSubscriptionStatus('Unknown');
       }
     }
 
     initialize();
   }, []);
 
   // Handle plan change via Superwall
   const handleChangePlan = async (isAnnual: boolean) => {
     if (!isSuperwallAvailable()) {
       toast.info(
         language === 'en'
           ? 'Plan changes are only available in the iOS app. Go to Settings > Apple ID > Subscriptions.'
           : 'Los cambios de plan solo están disponibles en la app iOS. Ve a Ajustes > Apple ID > Suscripciones.'
       );
       return;
     }
 
     setIsChangingPlan(true);
     try {
       // Show Superwall paywall for plan change
       await showPaywall();
       
       // Check if subscription was updated
       const status = await checkSubscriptionStatus();
       
       if (status === 'ACTIVE' && userId) {
         await supabase
           .from('profiles')
           .update({
             subscription_status: 'active',
           })
           .eq('id', userId);
 
         toast.success(
           language === 'en' 
             ? 'Plan updated successfully!' 
             : '¡Plan actualizado exitosamente!'
         );
         setCurrentPlan(isAnnual ? 'annual' : 'monthly');
         setSubscriptionStatus('Active');
       }
     } catch (error) {
       console.error('Plan change error:', error);
       toast.error(
         language === 'en' 
           ? 'Unable to change plan. Please try again.' 
           : 'No se pudo cambiar el plan. Intenta de nuevo.'
       );
     } finally {
       setIsChangingPlan(false);
     }
   };
 
   // Handle restore purchases
   const handleRestorePurchases = async () => {
     setIsRestoring(true);
     try {
       await restorePurchases();
       const status = await checkSubscriptionStatus();
       
       if (status === 'ACTIVE' && userId) {
         await supabase
           .from('profiles')
           .update({ subscription_status: 'subscribed' })
           .eq('id', userId);
         setSubscriptionStatus('Active');
         toast.success(language === 'en' ? 'Purchases restored successfully!' : '¡Compras restauradas exitosamente!');
       } else {
         toast.info(language === 'en' ? 'No active subscription found.' : 'No se encontró suscripción activa.');
       }
     } catch (error) {
       console.error('Restore error:', error);
       toast.error(language === 'en' ? 'Unable to restore purchases. Please try again.' : 'No se pudieron restaurar las compras.');
     } finally {
       setIsRestoring(false);
     }
   };
 
   // Handle manage subscription - opens Apple subscription management
   const handleManageSubscription = async () => {
     try {
       await showManageSubscriptions();
     } catch (error) {
       toast.info(
         language === 'en'
           ? 'To manage your subscription, go to Settings > Apple ID > Subscriptions on your iPhone.'
           : 'Para gestionar tu suscripción, ve a Ajustes > Apple ID > Suscripciones en tu iPhone.'
       );
     }
   };
 
   // Handle cancel subscription
   const handleCancelSubscription = async () => {
     if (!cancelConfirmed) return;
     
     setIsProcessing(true);
     try {
       const { data: { user } } = await supabase.auth.getUser();
       
       if (user) {
         await supabase
           .from('profiles')
           .update({
             subscription_status: 'cancelled',
             subscription_product_id: null,
             subscription_end_date: new Date().toISOString(),
           })
           .eq('id', user.id);
       }
 
       toast.success(
         language === 'en'
           ? 'Subscription cancelled. Remember to also cancel in Settings > Apple ID > Subscriptions.'
           : 'Suscripción cancelada. Recuerda también cancelar en Ajustes > Apple ID > Suscripciones.'
       );
       setShowCancelFlow(false);
       setCancelStep(1);
       setCancelConfirmed(false);
       navigate('/settings');
     } catch (error) {
       toast.error(t('common.error'));
     } finally {
       setIsProcessing(false);
     }
   };
 
   // Cancel Flow
   if (showCancelFlow) {
     return (
       <div className="min-h-screen bg-background pb-24">
         <header className="px-6 pt-8 pb-4 bg-card border-b border-border">
           <button 
             onClick={() => { setShowCancelFlow(false); setCancelStep(1); setCancelConfirmed(false); }}
             className="flex items-center gap-2 text-muted-foreground mb-4 min-h-[44px] min-w-[44px]"
           >
             <ArrowLeft className="w-5 h-5" />
             <span>{t('common.back')}</span>
           </button>
         </header>
 
         <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
           {cancelStep === 1 && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-sm text-center">
               <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-6">
                 <AlertTriangle className="w-8 h-8 text-warning" />
               </div>
               <h1 className="text-2xl font-heading font-bold mb-4">{t('subscription.cancelTitle')}</h1>
               <p className="text-muted-foreground mb-6">{t('subscription.cancelDesc')}</p>
               <ul className="text-left space-y-2 mb-8">
                 {(t('subscription.cancelFeatures') as unknown as string[]).map((item: string, i: number) => (
                   <li key={i} className="flex items-start gap-2 text-sm">
                     <span className="text-destructive">•</span>
                     <span>{item}</span>
                   </li>
                 ))}
               </ul>
               <Button onClick={() => setShowCancelFlow(false)} className="w-full mb-3">
                 {t('subscription.keepSubscription')}
               </Button>
               <button 
                 onClick={() => setCancelStep(2)} 
                 className="text-muted-foreground text-sm hover:underline"
               >
                 {t('subscription.continueCanceling')}
               </button>
             </motion.div>
           )}
 
           {cancelStep === 2 && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-sm text-center">
               <h1 className="text-2xl font-heading font-bold mb-4">Before you go...</h1>
               <p className="text-muted-foreground mb-6">Would any of these help you stay?</p>
               <div className="space-y-3 mb-8">
                 <button 
                   onClick={() => { navigate('/settings'); setShowCancelFlow(false); }}
                   className="w-full p-4 rounded-xl border-2 border-border bg-card text-left hover:border-primary/50 transition-colors"
                 >
                   <p className="font-medium">Make it easier</p>
                   <p className="text-sm text-muted-foreground">Reduce my goals</p>
                 </button>
                 <button 
                   onClick={() => setCancelStep(3)}
                   className="w-full p-4 rounded-xl border-2 border-destructive/30 bg-card text-left hover:border-destructive/50 transition-colors"
                 >
                   <p className="font-medium text-destructive">I still want to cancel</p>
                 </button>
               </div>
             </motion.div>
           )}
 
           {cancelStep === 3 && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-sm text-center">
               <h1 className="text-2xl font-heading font-bold mb-4">{t('subscription.confirmCancel')}</h1>
               <p className="text-muted-foreground mb-6">
                 Your subscription will remain active until your current billing period ends.
               </p>
               <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-border bg-card mb-6 text-left">
                 <input 
                   type="checkbox"
                   checked={cancelConfirmed}
                   onChange={(e) => setCancelConfirmed(e.target.checked)}
                   className="mt-1"
                 />
                 <label className="text-sm">
                   I understand I will lose access to premium features at the end of my billing period.
                 </label>
               </div>
               <div className="space-y-3">
                 <Button onClick={() => setShowCancelFlow(false)} className="w-full">
                   Go Back
                 </Button>
                 <Button 
                   variant="destructive" 
                   onClick={handleCancelSubscription}
                   disabled={!cancelConfirmed || isProcessing}
                   className="w-full"
                 >
                   {isProcessing ? t('common.loading') : t('subscription.confirmCancel')}
                 </Button>
               </div>
             </motion.div>
           )}
         </main>
         <BottomNavigation />
       </div>
     );
   }
 
   return (
     <div className="min-h-screen bg-background pb-24">
       <header className="px-6 pt-8 pb-4 bg-card border-b border-border">
         <button 
           onClick={() => navigate(-1)} 
           className="flex items-center gap-2 text-muted-foreground mb-4 min-h-[44px] min-w-[44px]"
         >
           <ArrowLeft className="w-5 h-5" />
           <span>{t('common.back')}</span>
         </button>
         <h1 className="text-3xl font-heading font-bold">{t('subscription.title')}</h1>
       </header>
 
       <main className="px-6 py-6 space-y-6">
         {/* Current Status */}
         <motion.section 
           initial={{ opacity: 0, y: 20 }} 
           animate={{ opacity: 1, y: 0 }} 
           className="p-6 rounded-2xl border-2 border-border bg-card"
         >
           <h2 className="font-heading font-semibold mb-2">{t('subscription.yourPlan')}</h2>
           <div className="flex items-center justify-between mb-4">
             <div>
               <span className="text-lg font-bold">SteadySteps {currentPlan === 'annual' ? 'Annual' : 'Monthly'}</span>
               <p className="text-sm text-muted-foreground">
                 {currentPlan === 'annual' ? '$49.99/year' : '$5.99/month'}
               </p>
             </div>
             <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
               subscriptionStatus === 'Active' 
                 ? 'bg-success/20 text-success' 
                 : 'bg-muted text-muted-foreground'
             }`}>
               {subscriptionStatus}
             </span>
           </div>
         </motion.section>
 
         {/* Plan Change Options */}
         <motion.section 
           initial={{ opacity: 0, y: 20 }} 
           animate={{ opacity: 1, y: 0 }} 
           transition={{ delay: 0.15 }} 
           className="p-6 rounded-2xl border-2 border-border bg-card"
         >
           <h2 className="font-heading font-semibold mb-4">
             {language === 'en' ? 'Change Your Plan' : 'Cambiar Tu Plan'}
           </h2>
           <div className="space-y-3">
             <button
               onClick={() => handleChangePlan(false)}
               disabled={isChangingPlan || currentPlan === 'monthly'}
               className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-colors ${
                 currentPlan === 'monthly' 
                   ? 'border-primary bg-primary/5' 
                   : 'border-border hover:border-primary/50'
               }`}
             >
               <div className="text-left">
                 <p className="font-semibold">{language === 'en' ? 'Monthly' : 'Mensual'}</p>
                 <p className="text-sm text-muted-foreground">$5.99/{language === 'en' ? 'month' : 'mes'}</p>
               </div>
               <div className="flex items-center gap-2">
                 <span className={currentPlan === 'monthly' ? 'text-primary font-bold' : 'font-bold'}>$5.99</span>
                 {currentPlan === 'monthly' && <Check className="w-5 h-5 text-primary" />}
               </div>
             </button>
             
             <button
               onClick={() => handleChangePlan(true)}
               disabled={isChangingPlan || currentPlan === 'annual'}
               className={`w-full p-4 rounded-xl border-2 flex items-center justify-between relative transition-colors ${
                 currentPlan === 'annual' 
                   ? 'border-primary bg-primary/5' 
                   : 'border-border hover:border-primary/50'
               }`}
             >
               <div className="absolute -top-2 left-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                 {language === 'en' ? 'Save 30%' : 'Ahorra 30%'}
               </div>
               <div className="text-left">
                 <p className="font-semibold">{language === 'en' ? 'Annual' : 'Anual'}</p>
                 <p className="text-sm text-muted-foreground">$49.99/{language === 'en' ? 'year' : 'año'}</p>
               </div>
               <div className="flex items-center gap-2">
                 <span className={currentPlan === 'annual' ? 'text-primary font-bold' : 'font-bold'}>$49.99</span>
                 {currentPlan === 'annual' && <Check className="w-5 h-5 text-primary" />}
               </div>
             </button>
           </div>
           {isChangingPlan && (
             <div className="flex items-center justify-center gap-2 mt-3">
               <Loader2 className="w-4 h-4 animate-spin" />
               <p className="text-sm text-muted-foreground">
                 {language === 'en' ? 'Opening payment...' : 'Abriendo pago...'}
               </p>
             </div>
           )}
         </motion.section>
 
         {/* Manage Subscription */}
         <motion.section 
           initial={{ opacity: 0, y: 20 }} 
           animate={{ opacity: 1, y: 0 }} 
           transition={{ delay: 0.2 }} 
           className="p-6 rounded-2xl border-2 border-border bg-card"
         >
           <h2 className="font-heading font-semibold mb-4">
             {language === 'en' ? 'Subscription Management' : 'Gestión de Suscripción'}
           </h2>
           <div className="space-y-3">
             <Button onClick={handleManageSubscription} variant="outline" className="w-full justify-between">
               <span>{language === 'en' ? 'Manage Subscription' : 'Gestionar Suscripción'}</span>
               <CreditCard className="w-4 h-4" />
             </Button>
             <Button 
               onClick={handleRestorePurchases} 
               variant="outline" 
               disabled={isRestoring}
               className="w-full justify-between"
             >
               <span>{isRestoring 
                 ? (language === 'en' ? 'Restoring...' : 'Restaurando...') 
                 : (language === 'en' ? 'Restore Purchases' : 'Restaurar Compras')}</span>
               <RefreshCw className={`w-4 h-4 ${isRestoring ? 'animate-spin' : ''}`} />
             </Button>
           </div>
         </motion.section>
         
         <button 
           onClick={() => setShowCancelFlow(true)} 
           className="w-full text-center text-sm text-muted-foreground hover:text-destructive transition-colors py-2 min-h-[44px]"
         >
           {t('subscription.cancelSubscription')}
         </button>
       </main>
       <BottomNavigation />
     </div>
   );
 };