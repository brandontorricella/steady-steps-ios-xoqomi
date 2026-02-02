import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Shield, Sparkles, RefreshCw, AlertCircle, Smartphone } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { Capacitor } from '@capacitor/core';
import {
  configureRevenueCat,
  getOfferings,
  purchasePackage,
  restorePurchases,
  checkPremiumStatus,
  recordPurchaseInDatabase,
  isRevenueCatAvailable,
  PRODUCT_IDS,
  RevenueCatOffering,
  RevenueCatPackage,
} from '@/services/revenuecat-service';

interface PaymentScreenProps {
  onNext: () => void;
}

export const PaymentScreen = ({ onNext }: PaymentScreenProps) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [offerings, setOfferings] = useState<RevenueCatOffering | null>(null);
  const trialEndDate = format(addDays(new Date(), 7), 'MMMM d, yyyy');

  const isNative = Capacitor.isNativePlatform();

  // Initialize RevenueCat and check existing subscription
  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      if (!user) {
        setIsInitializing(false);
        return;
      }

      try {
        console.log('=== INITIALIZING PAYMENT SCREEN ===');
        console.log('Platform:', Capacitor.getPlatform());
        console.log('Is native:', isNative);

        // Check existing subscription first
        const premiumStatus = await checkPremiumStatus(user.id, user.email || undefined);
        
        if (premiumStatus.isPremium) {
          console.log('User already has premium access via:', premiumStatus.source);
          if (isMounted) {
            setSuccessMessage(
              language === 'en'
                ? 'Subscription verified! Redirecting...'
                : '¡Suscripción verificada! Redirigiendo...'
            );
            setTimeout(() => onNext(), 1500);
          }
          return;
        }

        // Configure RevenueCat if on native platform
        if (isNative) {
          const configured = await configureRevenueCat(user.id);
          
          if (configured && isMounted) {
            // Fetch offerings
            const fetchedOfferings = await getOfferings();
            console.log('Fetched offerings:', fetchedOfferings);
            
            if (fetchedOfferings) {
              setOfferings(fetchedOfferings);
            }
          }
        }

        if (isMounted) {
          setIsInitializing(false);
        }
      } catch (error) {
        console.error('Initialization error:', error);
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    }

    initialize();

    return () => {
      isMounted = false;
    };
  }, [user, isNative, language, onNext]);

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

      // Check if already has premium
      const premiumStatus = await checkPremiumStatus(user.id, user.email || undefined);
      if (premiumStatus.isPremium) {
        setSuccessMessage(
          language === 'en'
            ? 'You already have an active subscription!'
            : '¡Ya tienes una suscripción activa!'
        );
        setTimeout(() => onNext(), 1500);
        return;
      }

      // Handle native platform purchase
      if (isNative && offerings?.availablePackages) {
        // Find the right package
        const packageToPurchase = offerings.availablePackages.find(pkg => {
          if (selectedPlan === 'annual') {
            return pkg.packageType === 'ANNUAL' || 
                   pkg.identifier === '$rc_annual' || 
                   pkg.identifier === 'annual' ||
                   pkg.product.identifier === PRODUCT_IDS.ANNUAL;
          } else {
            return pkg.packageType === 'MONTHLY' || 
                   pkg.identifier === '$rc_monthly' || 
                   pkg.identifier === 'monthly' ||
                   pkg.product.identifier === PRODUCT_IDS.MONTHLY;
          }
        });

        if (!packageToPurchase) {
          console.error('Package not found. Available packages:', offerings.availablePackages);
          setErrorMessage(
            language === 'en'
              ? 'Subscription package not found. Please try again.'
              : 'Paquete de suscripción no encontrado. Intenta de nuevo.'
          );
          setIsLoading(false);
          return;
        }

        console.log('Purchasing package:', packageToPurchase);
        
        const result = await purchasePackage(packageToPurchase);

        if (result.success && result.customerInfo) {
          // Record in database
          await recordPurchaseInDatabase(
            user.id,
            selectedPlan === 'annual' ? PRODUCT_IDS.ANNUAL : PRODUCT_IDS.MONTHLY,
            result.customerInfo.originalAppUserId
          );

          setSuccessMessage(
            language === 'en'
              ? 'Purchase successful! Redirecting...'
              : '¡Compra exitosa! Redirigiendo...'
          );
          setTimeout(() => onNext(), 1500);
          return;
        } else if (result.cancelled) {
          // User cancelled - just reset loading state
          setIsLoading(false);
          return;
        } else {
          setErrorMessage(result.error || (
            language === 'en'
              ? 'Purchase failed. Please try again.'
              : 'La compra falló. Intenta de nuevo.'
          ));
          setIsLoading(false);
          return;
        }
      }

      // Web platform - show message to use iOS app
      setErrorMessage(
        language === 'en'
          ? 'In-app purchases are only available in the iOS app. Please download SteadySteps from the App Store to subscribe.'
          : 'Las compras en la aplicación solo están disponibles en la app de iOS. Descarga SteadySteps desde la App Store para suscribirte.'
      );
      setIsLoading(false);
      
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
    setIsVerifying(true);
    setErrorMessage(null);

    try {
      if (!user) {
        setErrorMessage(
          language === 'en'
            ? 'Please log in to restore purchases.'
            : 'Por favor inicia sesión para restaurar compras.'
        );
        setIsVerifying(false);
        return;
      }

      if (isNative) {
        // Use RevenueCat restore
        const result = await restorePurchases();
        
        if (result.success && result.customerInfo) {
          await recordPurchaseInDatabase(
            user.id,
            result.customerInfo.entitlements.active.premium?.identifier || PRODUCT_IDS.MONTHLY,
            result.customerInfo.originalAppUserId
          );

          setSuccessMessage(
            language === 'en'
              ? 'Subscription restored successfully!'
              : '¡Suscripción restaurada exitosamente!'
          );
          setTimeout(() => onNext(), 1500);
          return;
        } else {
          setErrorMessage(result.error || (
            language === 'en'
              ? 'No active subscription found.'
              : 'No se encontró suscripción activa.'
          ));
        }
      } else {
        // Web platform - check database
        const premiumStatus = await checkPremiumStatus(user.id, user.email || undefined);

        if (premiumStatus.isPremium) {
          setSuccessMessage(
            language === 'en'
              ? 'Subscription restored successfully!'
              : '¡Suscripción restaurada exitosamente!'
          );
          setTimeout(() => onNext(), 1500);
        } else {
          setErrorMessage(
            language === 'en'
              ? 'No active subscription found. To restore purchases made in the iOS app, please open the app on your iPhone.'
              : 'No se encontró suscripción activa. Para restaurar compras hechas en la app de iOS, abre la app en tu iPhone.'
          );
        }
      }
    } catch (error) {
      console.error('Restore error:', error);
      setErrorMessage(
        language === 'en'
          ? 'Unable to restore purchases. Please try again.'
          : 'No se pudieron restaurar las compras. Intenta de nuevo.'
      );
    } finally {
      setIsVerifying(false);
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

      const premiumStatus = await checkPremiumStatus(user.id, user.email || undefined);

      if (premiumStatus.isPremium) {
        setSuccessMessage(
          language === 'en'
            ? 'Payment verified! Redirecting...'
            : '¡Pago verificado! Redirigiendo...'
        );
        setTimeout(() => onNext(), 1500);
      } else {
        setErrorMessage(
          language === 'en'
            ? 'No payment found. Please subscribe via the iOS app to continue.'
            : 'No se encontró pago. Suscríbete a través de la app de iOS para continuar.'
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

  // Get prices from RevenueCat offerings or use defaults
  let monthlyPrice = '$5.99';
  let annualPrice = '$49.99';

  if (offerings?.availablePackages) {
    const monthlyPkg = offerings.availablePackages.find(pkg => 
      pkg.packageType === 'MONTHLY' || 
      pkg.identifier === '$rc_monthly' || 
      pkg.identifier === 'monthly' ||
      pkg.product.identifier === PRODUCT_IDS.MONTHLY
    );
    const annualPkg = offerings.availablePackages.find(pkg => 
      pkg.packageType === 'ANNUAL' || 
      pkg.identifier === '$rc_annual' || 
      pkg.identifier === 'annual' ||
      pkg.product.identifier === PRODUCT_IDS.ANNUAL
    );
    
    if (monthlyPkg?.product?.priceString) {
      monthlyPrice = monthlyPkg.product.priceString;
    }
    if (annualPkg?.product?.priceString) {
      annualPrice = annualPkg.product.priceString;
    }
  }

  // Show loading while initializing
  if (isInitializing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground">
          {language === 'en' ? 'Loading payment options...' : 'Cargando opciones de pago...'}
        </p>
      </div>
    );
  }

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

      {/* iOS App Notice - Only show on web */}
      {!isNative && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3"
        >
          <Smartphone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-primary">
              {language === 'en' ? 'Subscribe via iOS App' : 'Suscríbete vía App iOS'}
            </p>
            <p className="text-muted-foreground mt-1">
              {language === 'en' 
                ? 'Download SteadySteps from the App Store to subscribe with Apple Pay.' 
                : 'Descarga SteadySteps desde la App Store para suscribirte con Apple Pay.'}
            </p>
          </div>
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
            <p className="text-2xl font-bold text-primary">{monthlyPrice}</p>
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
            {language === 'en' ? 'Save 30%' : 'Ahorra 30%'}
          </div>
          <div className="text-left">
            <p className="font-semibold text-lg">{t('payment.annual')}</p>
            <p className="text-muted-foreground text-sm">{t('payment.annualDesc')}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{annualPrice}</p>
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
          disabled={isLoading || isVerifying}
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
          disabled={isLoading || isVerifying}
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
              {language === 'en' ? 'Restore Purchases' : 'Restaurar Compras'}
            </>
          )}
        </Button>

        {/* Verify Payment - For edge cases */}
        <button
          onClick={handleVerifyPayment}
          disabled={isLoading || isVerifying}
          className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-3 text-sm"
        >
          {language === 'en' ? "I've Already Subscribed" : 'Ya Estoy Suscrita'}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          <Shield className="w-3 h-3 inline mr-1" />
          {t('payment.trialNote')} {trialEndDate}. {t('payment.cancelAnytime')}
        </p>
      </motion.div>
    </div>
  );
};
