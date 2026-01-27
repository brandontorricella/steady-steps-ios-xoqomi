import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, RefreshCw, CreditCard, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';
import { clearUserProfile } from '@/lib/storage';

type PaymentStatus = 'pending' | 'paid' | 'verifying' | 'cancelling';

const ProfileSetupPage = () => {
  const { user, signOut } = useAuth();
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
        
        // Send payment confirmation email
        try {
          await supabase.functions.invoke('send-payment-confirmation');
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Don't block the flow if email fails
        }
        
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

  // Handle cancel and delete user data
  const handleCancelAndGoBack = async () => {
    setPaymentStatus('cancelling');
    
    try {
      // Delete all user data since they didn't complete payment
      const { error } = await supabase.functions.invoke('delete-incomplete-signup');
      
      if (error) {
        console.error('Failed to delete user data:', error);
      }
      
      // Clear local storage
      clearUserProfile();
      
      // Sign out
      await signOut();
      
      toast.info(
        language === 'en' 
          ? 'Account cancelled. You can sign up again anytime.' 
          : 'Cuenta cancelada. Puedes registrarte de nuevo cuando quieras.'
      );
      
      // Navigate back to the beginning (onboarding/language selection)
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Error during cancellation:', err);
      // Still navigate away even if there's an error
      navigate('/', { replace: true });
    }
  };

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
          // iOS: Open in Safari
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
          ) : paymentStatus === 'verifying' || paymentStatus === 'cancelling' ? (
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
              : paymentStatus === 'cancelling'
              ? (language === 'en' ? 'Cancelling...' : 'Cancelando...')
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
              : paymentStatus === 'cancelling'
              ? (language === 'en' 
                  ? 'Cleaning up your account...' 
                  : 'Limpiando tu cuenta...')
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
          ) : paymentStatus === 'verifying' || paymentStatus === 'cancelling' ? (
            <Button
              size="lg"
              disabled
              className="w-full py-6 text-lg font-semibold"
            >
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
              {paymentStatus === 'cancelling' 
                ? (language === 'en' ? 'Cancelling...' : 'Cancelando...')
                : (language === 'en' ? 'Verifying...' : 'Verificando...')
              }
            </Button>
          ) : (
            <>
              <Button
                size="lg"
                onClick={handleRetryPayment}
                className="w-full py-6 text-lg font-semibold"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                {language === 'en' ? 'Complete Payment' : 'Completar Pago'}
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

              {/* Cancel and go back button */}
              <button
                onClick={handleCancelAndGoBack}
                className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-3 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                {language === 'en' ? 'Cancel and start over' : 'Cancelar y empezar de nuevo'}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSetupPage;
