import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Shield, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { 
  PRODUCT_IDS, 
  verifyPaymentStatus, 
  recordApplePurchase,
  recordRestoredPurchase 
} from '@/services/iap-service';

// Dynamically import expo-in-app-purchases (only works in native context)
let InAppPurchases: typeof import('expo-in-app-purchases') | null = null;

interface PaymentScreenProps {
  onNext: () => void;
}

export const PaymentScreen = ({ onNext }: PaymentScreenProps) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isIAPAvailable, setIsIAPAvailable] = useState(false);
  const trialEndDate = format(addDays(new Date(), 7), 'MMMM d, yyyy');

  // Initialize IAP on mount
  useEffect(() => {
    let mounted = true;
    
    async function initIAP() {
      try {
        // Try to import expo-in-app-purchases
        const iap = await import('expo-in-app-purchases');
        InAppPurchases = iap;
        
        await InAppPurchases.connectAsync();
        
        if (!mounted) return;
        setIsIAPAvailable(true);
        
        // Set up purchase listener
        InAppPurchases.setPurchaseListener(async ({ responseCode, results }) => {
          if (!user) return;
          
          if (responseCode === InAppPurchases!.IAPResponseCode.OK && results) {
            for (const purchase of results) {
              if (!purchase.acknowledged) {
                // Record purchase in database
                const transactionId = (purchase as any).transactionId || 
                  (purchase as any).orderId || 
                  String(Date.now());
                const result = await recordApplePurchase(
                  user.id,
                  purchase.productId,
                  transactionId
                );
                
                if (result.success) {
                  // Finish the transaction
                  await InAppPurchases!.finishTransactionAsync(purchase, true);
                  
                  setSuccessMessage(
                    language === 'en'
                      ? 'Purchase successful! Welcome to SteadySteps!'
                      : '¡Compra exitosa! ¡Bienvenida a SteadySteps!'
                  );
                  
                  setTimeout(() => {
                    onNext();
                  }, 1500);
                } else {
                  setErrorMessage(
                    language === 'en'
                      ? 'Failed to activate subscription. Please try again.'
                      : 'Error al activar suscripción. Intenta de nuevo.'
                  );
                }
              }
            }
          } else if (responseCode === InAppPurchases!.IAPResponseCode.USER_CANCELED) {
            console.log('User cancelled purchase');
            setIsLoading(false);
          } else {
            setErrorMessage(
              language === 'en'
                ? 'Purchase failed. Please try again.'
                : 'La compra falló. Intenta de nuevo.'
            );
            setIsLoading(false);
          }
        });
        
        // Fetch products from App Store
        const { results } = await InAppPurchases.getProductsAsync([
          PRODUCT_IDS.MONTHLY,
          PRODUCT_IDS.ANNUAL
        ]);
        console.log('Available products:', results);
        
      } catch (error) {
        console.log('IAP not available (web browser):', error);
        if (mounted) {
          setIsIAPAvailable(false);
        }
      }
    }
    
    initIAP();
    
    return () => {
      mounted = false;
      if (InAppPurchases) {
        InAppPurchases.disconnectAsync().catch(console.error);
      }
    };
  }, [user, language, onNext]);

  // Check payment status on mount (for returning users)
  useEffect(() => {
    if (user) {
      checkExistingPayment();
    }
  }, [user]);

  const checkExistingPayment = async () => {
    if (!user) return;
    
    const result = await verifyPaymentStatus(user.id, user.email || undefined);
    if (result.isPaid) {
      setSuccessMessage(
        language === 'en'
          ? 'Subscription verified! Redirecting...'
          : '¡Suscripción verificada! Redirigiendo...'
      );
      setTimeout(() => onNext(), 1500);
    }
  };

  const handleStartTrial = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (!user) {
        setErrorMessage(
          language === 'en'
            ? 'Please log in to continue.'
            : 'Por favor inicia sesión para continuar.'
        );
        setIsLoading(false);
        return;
      }

      // Check if already paid
      const verifyResult = await verifyPaymentStatus(user.id, user.email || undefined);
      if (verifyResult.isPaid) {
        setSuccessMessage(
          language === 'en'
            ? 'You already have an active subscription!'
            : '¡Ya tienes una suscripción activa!'
        );
        setTimeout(() => onNext(), 1500);
        return;
      }

      if (!isIAPAvailable || !InAppPurchases) {
        // Web fallback - show message about using iOS app
        setErrorMessage(
          language === 'en'
            ? 'In-app purchases are only available in the iOS app. Please download the app from the App Store.'
            : 'Las compras en la aplicación solo están disponibles en la app de iOS. Por favor descarga la app desde la App Store.'
        );
        setIsLoading(false);
        return;
      }

      const productId = selectedPlan === 'annual' 
        ? PRODUCT_IDS.ANNUAL 
        : PRODUCT_IDS.MONTHLY;
      
      // This opens Apple's native payment sheet
      await InAppPurchases.purchaseItemAsync(productId);
      
      // Result is handled by the purchase listener
      
    } catch (error) {
      console.error('Purchase error:', error);
      setErrorMessage(
        language === 'en'
          ? 'Unable to start purchase. Please try again.'
          : 'No se pudo iniciar la compra. Intenta de nuevo.'
      );
      setIsLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    setErrorMessage(null);

    try {
      if (!user) {
        setErrorMessage(
          language === 'en'
            ? 'Please log in to restore purchases.'
            : 'Por favor inicia sesión para restaurar compras.'
        );
        setIsRestoring(false);
        return;
      }

      if (!isIAPAvailable || !InAppPurchases) {
        setErrorMessage(
          language === 'en'
            ? 'Restore purchases is only available in the iOS app.'
            : 'Restaurar compras solo está disponible en la app de iOS.'
        );
        setIsRestoring(false);
        return;
      }

      const { results } = await InAppPurchases.getPurchaseHistoryAsync();

      if (results && results.length > 0) {
        const validPurchase = results.find(p => 
          p.productId === PRODUCT_IDS.MONTHLY || 
          p.productId === PRODUCT_IDS.ANNUAL
        );

        if (validPurchase) {
          const transactionId = (validPurchase as any).transactionId || 
            (validPurchase as any).orderId || 
            String(Date.now());
          const result = await recordRestoredPurchase(
            user.id,
            validPurchase.productId,
            transactionId
          );

          if (result.success) {
            setSuccessMessage(
              language === 'en'
                ? 'Purchases restored successfully!'
                : '¡Compras restauradas exitosamente!'
            );
            setTimeout(() => onNext(), 1500);
          } else {
            setErrorMessage(
              language === 'en'
                ? 'Failed to restore purchases. Please contact support.'
                : 'Error al restaurar compras. Contacta soporte.'
            );
          }
        } else {
          setErrorMessage(
            language === 'en'
              ? 'No active subscription found to restore.'
              : 'No se encontró suscripción activa para restaurar.'
          );
        }
      } else {
        setErrorMessage(
          language === 'en'
            ? 'No previous purchases found.'
            : 'No se encontraron compras anteriores.'
        );
      }
    } catch (error) {
      console.error('Restore error:', error);
      setErrorMessage(
        language === 'en'
          ? 'Unable to restore purchases. Please try again.'
          : 'No se pudieron restaurar las compras. Intenta de nuevo.'
      );
    } finally {
      setIsRestoring(false);
    }
  };

  const handleVerifyPayment = async () => {
    setIsVerifying(true);
    setErrorMessage(null);

    try {
      if (!user) {
        setErrorMessage(
          language === 'en'
            ? 'Please log in to verify payment.'
            : 'Por favor inicia sesión para verificar el pago.'
        );
        setIsVerifying(false);
        return;
      }

      const result = await verifyPaymentStatus(user.id, user.email || undefined);

      if (result.isPaid) {
        setSuccessMessage(
          language === 'en'
            ? 'Payment verified! Redirecting...'
            : '¡Pago verificado! Redirigiendo...'
        );
        setTimeout(() => onNext(), 1500);
      } else {
        setErrorMessage(
          language === 'en'
            ? 'No payment found. Please complete your purchase to continue.'
            : 'No se encontró pago. Completa tu compra para continuar.'
        );
      }
    } catch (error) {
      console.error('Verification error:', error);
      setErrorMessage(
        language === 'en'
          ? 'Unable to verify payment. Please try again.'
          : 'No se pudo verificar el pago. Intenta de nuevo.'
      );
    } finally {
      setIsVerifying(false);
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

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 p-4 bg-success/10 border border-success/20 rounded-xl flex items-center gap-3"
        >
          <Check className="w-5 h-5 text-success flex-shrink-0" />
          <span className="text-success text-sm font-medium">{successMessage}</span>
        </motion.div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <span className="text-destructive text-sm">{errorMessage}</span>
        </motion.div>
      )}

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
            {language === 'en' ? 'Save 50%' : 'Ahorra 50%'}
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
        <Button
          size="lg"
          onClick={handleStartTrial}
          disabled={isLoading || isRestoring || isVerifying}
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

        {/* Restore Purchases - Required by Apple */}
        <Button
          variant="outline"
          size="lg"
          onClick={handleRestorePurchases}
          disabled={isLoading || isRestoring || isVerifying}
          className="w-full py-5"
        >
          {isRestoring ? (
            <>
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
              {language === 'en' ? 'Restoring...' : 'Restaurando...'}
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Restore Purchases' : 'Restaurar Compras'}
            </>
          )}
        </Button>

        {/* Verify Payment - For edge cases */}
        <button
          onClick={handleVerifyPayment}
          disabled={isLoading || isRestoring || isVerifying}
          className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-3 text-sm"
        >
          {isVerifying ? (
            <>
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              {language === 'en' ? 'Verifying...' : 'Verificando...'}
            </>
          ) : (
            language === 'en' ? "I've Already Paid" : 'Ya He Pagado'
          )}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          <Shield className="w-3 h-3 inline mr-1" />
          {t('payment.trialNote')} {trialEndDate}. {t('payment.cancelAnytime')}
        </p>
      </motion.div>
    </div>
  );
};
