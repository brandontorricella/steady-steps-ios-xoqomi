import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Shield, Sparkles, RefreshCw, ExternalLink } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';

interface PaymentScreenProps {
  onNext: () => void;
}

export const PaymentScreen = ({ onNext }: PaymentScreenProps) => {
  const { t, language } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [checkoutOpened, setCheckoutOpened] = useState(false);
  const trialEndDate = format(addDays(new Date(), 7), 'MMMM d, yyyy');

  // Check subscription status
  const checkSubscriptionStatus = useCallback(async () => {
    setIsCheckingPayment(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Subscription check error:', error);
        return false;
      }
      
      // Check if user has valid subscription
      const hasValidSubscription = data && (
        data.subscribed || 
        data.status === 'active' || 
        data.status === 'trialing'
      );
      
      if (hasValidSubscription) {
        toast.success(language === 'en' ? 'Payment confirmed! Welcome to SteadySteps.' : '¡Pago confirmado! Bienvenida a SteadySteps.');
        onNext();
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Failed to check subscription:', err);
      return false;
    } finally {
      setIsCheckingPayment(false);
    }
  }, [onNext, language]);

  // Poll for payment completion after checkout is opened
  useEffect(() => {
    if (!checkoutOpened) return;
    
    const pollInterval = setInterval(async () => {
      const isSubscribed = await checkSubscriptionStatus();
      if (isSubscribed) {
        clearInterval(pollInterval);
      }
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(pollInterval);
  }, [checkoutOpened, checkSubscriptionStatus]);

  const handleStartTrial = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { isAnnual: selectedPlan === 'annual' },
      });

      if (error) throw error;
      if (data?.url) {
        // Open checkout in new tab
        window.open(data.url, '_blank');
        setCheckoutOpened(true);
        toast.info(
          language === 'en' 
            ? 'Complete payment in the new tab, then return here.' 
            : 'Completa el pago en la nueva pestaña, luego regresa aquí.'
        );
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(language === 'en' ? 'Unable to start checkout. Please try again.' : 'No se pudo iniciar el pago. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    t('payment.features.coach'),
    t('payment.features.daily'),
    t('payment.features.progress'),
    t('payment.features.reminders'),
  ];

  return (
    <div className="flex-1 flex flex-col px-6 py-12 overflow-auto">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-heading font-bold mb-2 text-center"
      >
        {t('payment.title')}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-muted-foreground text-center mb-6"
      >
        {t('payment.subtitle')}
      </motion.p>

      {/* Pricing Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3 mb-6"
      >
        <button
          onClick={() => setSelectedPlan('monthly')}
          className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
            selectedPlan === 'monthly'
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card hover:border-primary/50'
          }`}
        >
          <div className="text-left">
            <p className="font-semibold text-lg">{t('payment.monthly')}</p>
            <p className="text-muted-foreground text-sm">{t('payment.monthlyDesc')}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">$4.99</p>
            <p className="text-sm text-muted-foreground">{t('payment.perMonth')}</p>
          </div>
          {selectedPlan === 'monthly' && (
            <div className="ml-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
        </button>

        <button
          onClick={() => setSelectedPlan('annual')}
          className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between relative ${
            selectedPlan === 'annual'
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card hover:border-primary/50'
          }`}
        >
          <div className="absolute -top-2 left-4 px-2 py-0.5 bg-gold text-gold-foreground text-xs font-semibold rounded-full">
            {t('payment.save')}
          </div>
          <div className="text-left">
            <p className="font-semibold text-lg">{t('payment.annual')}</p>
            <p className="text-muted-foreground text-sm">{t('payment.annualDesc')}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">$29.99</p>
            <p className="text-sm text-muted-foreground">{t('payment.perYear')}</p>
          </div>
          {selectedPlan === 'annual' && (
            <div className="ml-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
        </button>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3 mb-6"
      >
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3 text-sm">
            <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-success" />
            </div>
            <span>{feature}</span>
          </div>
        ))}
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3 mt-auto"
      >
        {!checkoutOpened ? (
          <Button
            size="lg"
            onClick={handleStartTrial}
            disabled={isLoading}
            className="w-full py-6 text-lg font-semibold"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                {t('common.loading')}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                {t('payment.startTrial')}
              </>
            )}
          </Button>
        ) : (
          <>
            <Button
              size="lg"
              onClick={checkSubscriptionStatus}
              disabled={isCheckingPayment}
              className="w-full py-6 text-lg font-semibold"
            >
              {isCheckingPayment ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  {language === 'en' ? 'Verifying...' : 'Verificando...'}
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  {language === 'en' ? "I've Completed Payment" : "He Completado el Pago"}
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={handleStartTrial}
              disabled={isLoading}
              className="w-full py-5"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Reopen Checkout' : 'Reabrir Pago'}
            </Button>
            
            <p className="text-center text-xs text-muted-foreground animate-pulse">
              {language === 'en' 
                ? 'Automatically checking for payment completion...' 
                : 'Verificando automáticamente el pago...'}
            </p>
          </>
        )}

        <p className="text-center text-xs text-muted-foreground">
          <Shield className="w-3 h-3 inline mr-1" />
          {t('payment.trialNote')} {trialEndDate}. {t('payment.cancelAnytime')}
        </p>
      </motion.div>
    </div>
  );
};
