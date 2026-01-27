import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, RefreshCw, CreditCard, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';

type PaymentStatus = 'pending' | 'paid' | 'verifying';

const ProfileSetupPage = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Detect payment status from URL
  useEffect(() => {
    const paymentParam = searchParams.get('payment');
    
    if (paymentParam === 'success') {
      setPaymentStatus('verifying');
      // Verify with Stripe API
      verifyPaymentWithStripe();
    } else if (paymentParam === 'cancel') {
      setPaymentStatus('pending');
      toast.info(
        language === 'en' 
          ? 'Payment was cancelled. You can try again when ready.' 
          : 'El pago fue cancelado. Puedes intentarlo cuando estés lista.'
      );
    }
  }, [searchParams, language]);

  // Verify payment with Stripe API
  const verifyPaymentWithStripe = useCallback(async () => {
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Subscription check error:', error);
        setPaymentStatus('pending');
        return;
      }
      
      const hasValidSubscription = data && (
        data.subscribed || 
        data.status === 'active' || 
        data.status === 'trialing'
      );
      
      if (hasValidSubscription) {
        setPaymentStatus('paid');
        toast.success(
          language === 'en' 
            ? '✅ Payment received! You can now finish your profile.' 
            : '✅ ¡Pago recibido! Ahora puedes completar tu perfil.'
        );
      } else {
        setPaymentStatus('pending');
      }
    } catch (err) {
      console.error('Failed to verify payment:', err);
      setPaymentStatus('pending');
    } finally {
      setIsVerifying(false);
    }
  }, [language]);

  // Handle retry payment
  const handleRetryPayment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { isAnnual: false },
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
      toast.error(
        language === 'en' 
          ? 'Unable to start checkout. Please try again.' 
          : 'No se pudo iniciar el pago. Intenta de nuevo.'
      );
    }
  };

  // Handle complete profile
  const handleCompleteProfile = async () => {
    if (paymentStatus !== 'paid') return;
    
    setIsCompleting(true);
    try {
      // Update profile to mark onboarding as complete
      if (user) {
        await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('id', user.id);
      }
      
      toast.success(
        language === 'en' 
          ? 'Welcome to SteadySteps!' 
          : '¡Bienvenida a SteadySteps!'
      );
      
      // Navigate to dashboard
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Failed to complete profile:', error);
      toast.error(
        language === 'en' 
          ? 'Something went wrong. Please try again.' 
          : 'Algo salió mal. Por favor intenta de nuevo.'
      );
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="min-h-screen gradient-soft flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 text-center"
      >
        {/* Status Icon */}
        <div className="flex justify-center">
          {paymentStatus === 'paid' ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center"
            >
              <Check className="w-10 h-10 text-success" />
            </motion.div>
          ) : paymentStatus === 'verifying' ? (
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <RefreshCw className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">
            {paymentStatus === 'paid' 
              ? (language === 'en' ? 'Payment Successful!' : '¡Pago Exitoso!')
              : paymentStatus === 'verifying'
              ? (language === 'en' ? 'Verifying Payment...' : 'Verificando Pago...')
              : (language === 'en' ? 'Complete Your Payment' : 'Completa Tu Pago')
            }
          </h1>
          <p className="text-muted-foreground">
            {paymentStatus === 'paid'
              ? (language === 'en' 
                  ? '✅ Payment received! You can now finish your profile.' 
                  : '✅ ¡Pago recibido! Ahora puedes completar tu perfil.')
              : paymentStatus === 'verifying'
              ? (language === 'en' 
                  ? 'Please wait while we verify your payment...' 
                  : 'Por favor espera mientras verificamos tu pago...')
              : (language === 'en' 
                  ? 'Please complete payment to finish your profile.' 
                  : 'Por favor completa el pago para terminar tu perfil.')
            }
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {paymentStatus === 'paid' ? (
            <Button
              size="lg"
              onClick={handleCompleteProfile}
              disabled={isCompleting}
              className="w-full py-6 text-lg font-semibold"
            >
              {isCompleting ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  {language === 'en' ? 'Setting up...' : 'Configurando...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  {language === 'en' ? 'Complete Profile & Start' : 'Completar Perfil e Iniciar'}
                </>
              )}
            </Button>
          ) : paymentStatus === 'verifying' ? (
            <Button
              size="lg"
              disabled
              className="w-full py-6 text-lg font-semibold"
            >
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
              {language === 'en' ? 'Verifying...' : 'Verificando...'}
            </Button>
          ) : (
            <>
              <Button
                size="lg"
                onClick={handleRetryPayment}
                className="w-full py-6 text-lg font-semibold"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                {language === 'en' ? 'Retry Payment' : 'Reintentar Pago'}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={verifyPaymentWithStripe}
                disabled={isVerifying}
                className="w-full py-5"
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                    {language === 'en' ? 'Checking...' : 'Verificando...'}
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {language === 'en' ? "I've Already Paid" : 'Ya He Pagado'}
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSetupPage;
