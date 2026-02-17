import { useState, useEffect } from 'react';
import { Browser } from '@capacitor/browser';
 import { motion } from 'framer-motion';
 import { ArrowLeft, CreditCard, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
 import { useNavigate } from 'react-router-dom';
 import { Button } from '@/components/ui/button';
 import { useLanguage } from '@/hooks/useLanguage';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import {
  configureRevenueCat,
  checkSubscriptionStatus,
  restorePurchases,
  isRevenueCatAvailable,
} from '@/services/revenuecat-service';
 
 export const SubscriptionPage = () => {
   const navigate = useNavigate();
   const { t, language } = useLanguage();
   const [showCancelFlow, setShowCancelFlow] = useState(false);
   const [cancelStep, setCancelStep] = useState(1);
   const [cancelConfirmed, setCancelConfirmed] = useState(false);
   const [isProcessing, setIsProcessing] = useState(false);
   
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
 
          // Configure RevenueCat if on native platform
          if (isRevenueCatAvailable()) {
            await configureRevenueCat(user.id);
            const isActive = await checkSubscriptionStatus();
            if (isActive) {
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
 
    
 
    // Handle restore purchases
    const handleRestorePurchases = async () => {
      setIsRestoring(true);
      try {
        const restored = await restorePurchases();
        
        if (restored && userId) {
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
        toast.error(language === 'en' 
          ? 'Unable to restore purchases. Please try again or contact support@steadystepsapp.com.' 
          : 'No se pudieron restaurar las compras. Intenta de nuevo o contacta support@steadystepsapp.com.');
     } finally {
       setIsRestoring(false);
     }
   };
 
    // Handle manage subscription - opens Apple subscription management
     const handleManageSubscription = async () => {
       try {
         await Browser.open({ 
           url: 'https://apps.apple.com/account/subscriptions',
           presentationStyle: 'popover' as any
         });
       } catch (error) {
         console.error('Error opening subscription management:', error);
         toast.info(
           language === 'en'
             ? 'To manage your subscription, go to Settings > Apple ID > Subscriptions on your device.'
             : 'Para gestionar tu suscripción, ve a Ajustes > Apple ID > Suscripciones en tu dispositivo.'
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
            <div className="max-w-lg mx-auto">
              <button 
                onClick={() => { setShowCancelFlow(false); setCancelStep(1); setCancelConfirmed(false); }}
                className="flex items-center gap-2 text-muted-foreground mb-4 min-h-[44px] min-w-[44px]"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>{t('common.back')}</span>
              </button>
            </div>
          </header>

          <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-lg mx-auto">
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
          <div className="max-w-lg mx-auto">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-muted-foreground mb-4 min-h-[44px] min-w-[44px]"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t('common.back')}</span>
            </button>
            <h1 className="text-3xl font-heading font-bold">{t('subscription.title')}</h1>
          </div>
        </header>

        <main className="px-6 py-6 space-y-6 max-w-lg mx-auto">
          {/* Current Plan */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="p-6 rounded-2xl border-2 border-border bg-card"
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-heading font-semibold">
                {language === 'en' ? 'Current Plan' : 'Plan Actual'}
              </h2>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                subscriptionStatus === 'Active' 
                  ? 'bg-success/20 text-success' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {subscriptionStatus}
              </span>
            </div>
            <p className="text-lg font-bold">
              {currentPlan === 'annual' 
                ? (language === 'en' ? 'Annual ($49.99/year)' : 'Anual ($49.99/año)')
                : (language === 'en' ? 'Monthly ($5.99/month)' : 'Mensual ($5.99/mes)')}
            </p>
          </motion.section>

          {/* Manage Subscription */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }} 
            className="p-6 rounded-2xl border-2 border-border bg-card"
          >
            <p className="text-sm text-muted-foreground mb-4">
              {language === 'en'
                ? 'To change your subscription plan or cancel, tap the button below. This will open your device\'s Subscription Settings.'
                : 'Para cambiar tu plan de suscripción o cancelar, toca el botón de abajo. Esto abrirá los Ajustes de Suscripción de tu dispositivo.'}
            </p>

            <Button onClick={handleManageSubscription} className="w-full bg-success hover:bg-success/90 text-success-foreground font-medium">
              <span>{language === 'en' ? 'Manage Subscription in Settings' : 'Gestionar Suscripción en Ajustes'}</span>
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>

            <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>{language === 'en' ? 'Switch between Monthly and Annual' : 'Cambiar entre Mensual y Anual'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>{language === 'en' ? 'Update payment method' : 'Actualizar método de pago'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>{language === 'en' ? 'Cancel subscription' : 'Cancelar suscripción'}</span>
              </li>
            </ul>
          </motion.section>

          {/* Restore Purchases */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }} 
          >
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
          </motion.section>

        <p className="text-xs text-center text-muted-foreground px-4 pb-2">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/legal?tab=terms');
            }}
            className="underline text-success"
          >
            {language === 'en' ? 'Terms of Use' : 'Términos de Uso'}
          </a>
          {' · '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/legal?tab=privacy');
            }}
            className="underline text-success"
          >
            {language === 'en' ? 'Privacy Policy' : 'Política de Privacidad'}
          </a>
        </p>
      </main>
       <BottomNavigation />
     </div>
   );
 };