import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, RefreshCw, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';
import { clearUserProfile } from '@/lib/storage';
import { verifyPaymentStatus } from '@/services/iap-service';

type PaymentStatus = 'pending' | 'paid' | 'verifying' | 'cancelling';

const ProfileSetupPage = () => {
  const { user, signOut } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Check payment status on mount
  useEffect(() => {
    if (user) {
      checkPaymentStatus();
    }
  }, [user]);

  // Verify payment status from database (Apple IAP)
  const checkPaymentStatus = useCallback(async () => {
    if (!user) return;
    
    setIsVerifying(true);
    try {
      const result = await verifyPaymentStatus(user.id, user.email || undefined);
      
      if (result.isPaid) {
        setPaymentStatus('paid');
        toast.success(
          language === 'en' 
            ? '✅ Subscription verified! You can now finish your profile.' 
            : '✅ ¡Suscripción verificada! Ahora puedes completar tu perfil.'
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
  }, [user, language]);

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

  // Handle verify payment button click
  const handleVerifyPayment = async () => {
    if (!user) {
      toast.error(
        language === 'en' 
          ? 'Please log in to continue.' 
          : 'Por favor inicia sesión para continuar.'
      );
      return;
    }
    
    setIsVerifying(true);
    try {
      const result = await verifyPaymentStatus(user.id, user.email || undefined);
      
      if (result.isPaid) {
        setPaymentStatus('paid');
        toast.success(
          language === 'en' 
            ? '✅ Subscription verified!' 
            : '✅ ¡Suscripción verificada!'
        );
      } else {
        toast.error(
          language === 'en' 
            ? '❌ No active subscription found. Please complete your purchase.' 
            : '❌ No se encontró suscripción activa. Por favor completa tu compra.'
        );
      }
    } catch (err) {
      console.error('Failed to verify payment:', err);
      toast.error(
        language === 'en' 
          ? '❌ Unable to verify payment. Please try again.' 
          : '❌ No se pudo verificar el pago. Intenta de nuevo.'
      );
    } finally {
      setIsVerifying(false);
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

  // Navigate back to payment screen in onboarding
  const handleGoToPayment = () => {
    navigate('/');
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
              ? (language === 'en' ? 'Subscription Active!' : '¡Suscripción Activa!')
              : paymentStatus === 'verifying'
              ? (language === 'en' ? 'Verifying...' : 'Verificando...')
              : paymentStatus === 'cancelling'
              ? (language === 'en' ? 'Cancelling...' : 'Cancelando...')
              : (language === 'en' ? 'Complete Your Purchase' : 'Completa Tu Compra')
            }
          </h1>
          <p className="text-muted-foreground">
            {paymentStatus === 'paid'
              ? (language === 'en' 
                  ? '✅ Your subscription is active! Finish setting up your profile.' 
                  : '✅ ¡Tu suscripción está activa! Termina de configurar tu perfil.')
              : paymentStatus === 'verifying'
              ? (language === 'en' 
                  ? 'Please wait while we verify your subscription...' 
                  : 'Por favor espera mientras verificamos tu suscripción...')
              : paymentStatus === 'cancelling'
              ? (language === 'en' 
                  ? 'Cleaning up your account...' 
                  : 'Limpiando tu cuenta...')
              : (language === 'en' 
                  ? 'Please complete your purchase to access SteadySteps.' 
                  : 'Por favor completa tu compra para acceder a SteadySteps.')
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
                onClick={handleGoToPayment}
                className="w-full py-6 text-lg font-semibold"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {language === 'en' ? 'Go to Payment' : 'Ir al Pago'}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleVerifyPayment}
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
