import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Check, AlertTriangle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';

export const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [showCancelFlow, setShowCancelFlow] = useState(false);
  const [cancelStep, setCancelStep] = useState(1);
  const [cancelConfirmed, setCancelConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (error) {
      toast.error('Unable to open subscription management');
    }
  };

  // Handle plan change - opens Stripe checkout with the new plan
  const handleChangePlan = async (isAnnual: boolean) => {
    setIsChangingPlan(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { isAnnual },
      });

      if (error) throw error;
      if (data?.url) {
        const checkoutUrl = data.url.startsWith('https://') ? data.url : data.url.replace('http://', 'https://');
        
        // Detect iOS
        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent || '');
        const isWebView = isIOS && !/Safari/.test(navigator.userAgent || '');
        const isStandalone = (window.navigator as any).standalone === true;
        
        if (isIOS && (isWebView || isStandalone)) {
          window.location.href = checkoutUrl;
        } else {
          window.open(checkoutUrl, '_blank');
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(language === 'en' ? 'Unable to start checkout' : 'No se pudo iniciar el pago');
    } finally {
      setIsChangingPlan(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!cancelConfirmed) return;
    
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success(t('subscription.cancelComplete'));
        setShowCancelFlow(false);
        setCancelStep(1);
        setCancelConfirmed(false);
      }
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
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="p-6 rounded-2xl border-2 border-border bg-card"
        >
          <h2 className="font-heading font-semibold mb-2">{t('subscription.yourPlan')}</h2>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg font-bold">SteadySteps Monthly</span>
            <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-xs font-medium">
              {t('subscription.active')}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">$4.99/month</p>
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
              disabled={isChangingPlan}
              className="w-full p-4 rounded-xl border-2 border-primary bg-primary/5 flex items-center justify-between"
            >
              <div className="text-left">
                <p className="font-semibold">{language === 'en' ? 'Monthly' : 'Mensual'}</p>
                <p className="text-sm text-muted-foreground">$4.99/month</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">$4.99</span>
                <Check className="w-5 h-5 text-primary" />
              </div>
            </button>
            
            <button
              onClick={() => handleChangePlan(true)}
              disabled={isChangingPlan}
              className="w-full p-4 rounded-xl border-2 border-border hover:border-primary/50 flex items-center justify-between relative transition-colors"
            >
              <div className="absolute -top-2 left-4 px-2 py-0.5 bg-gold text-gold-foreground text-xs font-semibold rounded-full">
                {language === 'en' ? 'Save 50%' : 'Ahorra 50%'}
              </div>
              <div className="text-left">
                <p className="font-semibold">{language === 'en' ? 'Annual' : 'Anual'}</p>
                <p className="text-sm text-muted-foreground">$29.99/year</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">$29.99</span>
                <Sparkles className="w-5 h-5 text-gold" />
              </div>
            </button>
          </div>
          {isChangingPlan && (
            <p className="text-center text-sm text-muted-foreground mt-3 animate-pulse">
              {language === 'en' ? 'Opening payment...' : 'Abriendo pago...'}
            </p>
          )}
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }} 
          className="p-6 rounded-2xl border-2 border-border bg-card"
        >
          <h2 className="font-heading font-semibold mb-4">{t('subscription.paymentMethod')}</h2>
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <span>{t('subscription.cardEnding')} ****</span>
          </div>
        </motion.section>

        <Button onClick={handleManageSubscription} className="w-full">
          {t('subscription.updatePayment')}
        </Button>
        
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
