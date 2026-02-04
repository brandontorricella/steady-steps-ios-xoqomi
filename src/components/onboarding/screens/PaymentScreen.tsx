import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Shield, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
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
  PRODUCT_IDS,
  RevenueCatOffering,
} from '@/services/revenuecat-service';

interface PaymentScreenProps {
  onNext: () => void;
}

// Robust platform detection for TestFlight/native iOS
const detectPlatform = (): 'native' | 'web' => {
  // Log all detection methods for debugging
  console.log('=== PLATFORM DETECTION ===');
  console.log('Capacitor.isNativePlatform():', Capacitor.isNativePlatform());
  console.log('Capacitor.getPlatform():', Capacitor.getPlatform());
  console.log('window.Capacitor:', (window as any).Capacitor);
  console.log('navigator.userAgent:', navigator.userAgent);

  // Check Capacitor native platform first
  if (Capacitor.isNativePlatform()) {
    console.log('Detected: Native via Capacitor.isNativePlatform()');
    return 'native';
  }

  // Fallback: check if Capacitor platform is ios/android
  const platform = Capacitor.getPlatform();
  if (platform === 'ios' || platform === 'android') {
    console.log('Detected: Native via Capacitor.getPlatform():', platform);
    return 'native';
  }

  // Fallback: check window.Capacitor object
  const windowCapacitor = (window as any).Capacitor;
  if (windowCapacitor?.platform === 'ios' || windowCapacitor?.platform === 'android') {
    console.log('Detected: Native via window.Capacitor.platform:', windowCapacitor.platform);
    return 'native';
  }

  // Fallback: check user agent for iOS app webview indicators
  const userAgent = navigator.userAgent || '';
  
  // Check for our app name in user agent (if configured in Capacitor)
  if (userAgent.includes('SteadySteps')) {
    console.log('Detected: Native via userAgent containing SteadySteps');
    return 'native';
  }

  // Check for iOS standalone mode (installed PWA or native app)
  if ((window.navigator as any).standalone === true) {
    console.log('Detected: Native via navigator.standalone');
    return 'native';
  }

  // Check for Capacitor iOS bridge
  if ((window as any).webkit?.messageHandlers?.Capacitor) {
    console.log('Detected: Native via webkit.messageHandlers.Capacitor');
    return 'native';
  }

  console.log('Detected: Web (no native indicators found)');
  return 'web';
};

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
  const [initFailed, setInitFailed] = useState(false);
  const trialEndDate = format(addDays(new Date(), 7), 'MMMM d, yyyy');

  const detectedPlatform = detectPlatform();
  console.log('Final platform detection result:', detectedPlatform);

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
        console.log('User ID:', user.id);
        console.log('User Email:', user.email);

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

        // Always try to configure RevenueCat (no platform check)
        console.log('Configuring RevenueCat...');
        const configured = await configureRevenueCat(user.id);
        console.log('RevenueCat configured:', configured);

        if (configured) {
          // Fetch offerings
          console.log('Fetching offerings...');
          const fetchedOfferings = await getOfferings();
          console.log('Fetched offerings:', fetchedOfferings);
          
          if (fetchedOfferings && isMounted) {
            setOfferings(fetchedOfferings);
          } else if (!fetchedOfferings && isMounted) {
            console.warn('No offerings returned from RevenueCat');
            // Don't fail - user might still be able to restore purchases
          }
        } else {
          console.warn('RevenueCat configuration returned false');
          if (isMounted) {
            setInitFailed(true);
          }
        }

        if (isMounted) {
          setIsInitializing(false);
        }
      } catch (error) {
        console.error('=== INITIALIZATION ERROR ===');
        console.error('Error:', error);
        if (isMounted) {
          setInitFailed(true);
          setIsInitializing(false);
        }
      }
    }

    initialize();

    return () => {
      isMounted = false;
    };
  }, [user, language, onNext]);

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

      // Attempt purchase if offerings available
      if (offerings?.availablePackages) {
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
      } else {
        // No offerings available
        setErrorMessage(
          language === 'en'
            ? 'Unable to load subscription options. Please check your connection and try again.'
            : 'No se pudieron cargar las opciones de suscripción. Verifica tu conexión e intenta de nuevo.'
        );
        setIsLoading(false);
      }
      
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

      // Try RevenueCat restore
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
        // Also check database as fallback
        const premiumStatus = await checkPremiumStatus(user.id, user.email || undefined);
        
        if (premiumStatus.isPremium) {
          setSuccessMessage(
            language === 'en'
              ? 'Subscription restored successfully!'
              : '¡Suscripción restaurada exitosamente!'
          );
          setTimeout(() => onNext(), 1500);
        } else {
          setErrorMessage(result.error || (
            language === 'en'
              ? 'No active subscription found.'
              : 'No se encontró suscripción activa.'
          ));
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

  const handleRetry = () => {
    setInitFailed(false);
    setIsInitializing(true);
    setErrorMessage(null);
    window.location.reload();
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

  // Show error state if initialization failed
  if (initFailed && !offerings) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          {language === 'en' ? 'Unable to Load' : 'No se pudo cargar'}
        </h2>
        <p className="text-muted-foreground mb-6">
          {language === 'en' 
            ? 'Could not connect to the App Store. Please check your internet connection and try again.'
            : 'No se pudo conectar a la App Store. Verifica tu conexión a internet e intenta de nuevo.'}
        </p>
        <Button onClick={handleRetry} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          {language === 'en' ? 'Try Again' : 'Intentar de nuevo'}
        </Button>
        <Button 
          variant="ghost" 
          onClick={handleRestorePurchases} 
          className="mt-4"
          disabled={isVerifying}
        >
          {isVerifying 
            ? (language === 'en' ? 'Checking...' : 'Verificando...') 
            : (language === 'en' ? 'Restore Purchases' : 'Restaurar compras')}
        </Button>
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
          <div key={index} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-primary" />
            </div>
            <span className="text-sm text-foreground">{feature}</span>
          </div>
        ))}
      </motion.div>

      {/* Security Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-2 mb-6 text-muted-foreground"
      >
        <Shield className="w-4 h-4" />
        <span className="text-xs">{t('payment.secure')}</span>
      </motion.div>

      {/* Start Trial Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={handleStartTrial}
          disabled={isLoading}
          className="w-full h-14 text-lg font-semibold gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              {language === 'en' ? 'Processing...' : 'Procesando...'}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {t('payment.startTrial')}
            </>
          )}
        </Button>
      </motion.div>

      {/* Trial Terms */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-xs text-muted-foreground mt-4"
      >
        {language === 'en'
          ? `Your free trial starts today. You will not be charged until ${trialEndDate}. ${selectedPlan === 'annual' ? `Then ${annualPrice}/year.` : `Then ${monthlyPrice}/month.`} Cancel anytime.`
          : `Tu prueba gratuita comienza hoy. No se te cobrará hasta el ${trialEndDate}. ${selectedPlan === 'annual' ? `Después ${annualPrice}/año.` : `Después ${monthlyPrice}/mes.`} Cancela cuando quieras.`}
      </motion.p>

      {/* Restore Purchases */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-6 text-center"
      >
        <button
          onClick={handleRestorePurchases}
          disabled={isVerifying}
          className="text-sm text-primary hover:underline flex items-center gap-2 mx-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
          {isVerifying 
            ? (language === 'en' ? 'Restoring...' : 'Restaurando...') 
            : t('payment.restore')}
        </button>
      </motion.div>
    </div>
  );
};
