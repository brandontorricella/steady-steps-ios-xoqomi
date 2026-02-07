import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, RefreshCw, Loader2, Check, Crown, Sparkles } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Capacitor } from '@capacitor/core';
import {
  configureRevenueCat,
  getOfferings,
  purchasePackage,
  checkSubscriptionStatus,
  isRevenueCatAvailable,
  restorePurchases,
  RevenueCatPackage,
} from '@/services/revenuecat-service';

interface PaymentScreenProps {
  onNext: () => void;
}

// Demo account email for App Store review
const DEMO_EMAIL = 'demo@steadystepsapp.com';

export const PaymentScreen = ({ onNext }: PaymentScreenProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [monthlyPackage, setMonthlyPackage] = useState<RevenueCatPackage | null>(null);
  const [annualPackage, setAnnualPackage] = useState<RevenueCatPackage | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    console.log(message);
    setDebugLogs(prev => [...prev.slice(-20), `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  useEffect(() => {
    handlePaymentFlow();
  }, []);

  async function handlePaymentFlow() {
    setIsLoading(true);
    setError(null);

    try {
      addLog('=== PAYMENT SCREEN STARTED ===');
      addLog(`Platform: ${Capacitor.getPlatform()}`);
      addLog(`isNative: ${Capacitor.isNativePlatform()}`);
      addLog(`RevenueCat available: ${isRevenueCatAvailable()}`);

      if (!user) {
        addLog('No user found - cannot proceed');
        setError('Authentication required');
        setIsLoading(false);
        return;
      }

      addLog(`User ID: ${user.id}`);
      addLog(`User email: ${user.email}`);

      // Check for demo account
      if (user.email === DEMO_EMAIL) {
        addLog('Demo account - bypassing payment');
        await markOnboardingComplete(user.id);
        onNext();
        return;
      }

      // Check if user already has valid subscription in database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_product_id, onboarding_completed')
        .eq('id', user.id)
        .single();

      if (profileError) {
        addLog(`Profile fetch error: ${profileError.message}`);
      } else {
        addLog(`Profile: ${JSON.stringify(profile)}`);
      }

      // Check if already subscribed
      const isSubscribed = profile?.subscription_status === 'subscribed' || 
                          profile?.subscription_status === 'active';
      
      if (isSubscribed) {
        addLog('Already subscribed in database - proceeding to app');
        await markOnboardingComplete(user.id);
        onNext();
        return;
      }

      // Configure RevenueCat
      addLog('Configuring RevenueCat...');
      await configureRevenueCat(user.id);
      addLog('RevenueCat configured');

      // Check if already subscribed via RevenueCat
      const revenueCatSubscribed = await checkSubscriptionStatus();
      addLog(`RevenueCat subscription active: ${revenueCatSubscribed}`);
      
      if (revenueCatSubscribed) {
        addLog('Active subscription found via RevenueCat');
        await updateSubscriptionStatus(user.id);
        await markOnboardingComplete(user.id);
        onNext();
        return;
      }

      // Get offerings with comprehensive error handling
      addLog('Getting offerings...');
      
      let offering = null;
      try {
        offering = await getOfferings();
        addLog(`getOfferings returned: ${offering ? 'offering object' : 'null'}`);
      } catch (offeringsError: any) {
        addLog(`getOfferings threw error: ${offeringsError.message || offeringsError}`);
        // Don't throw here - we'll show an error UI instead
      }
      
      if (offering) {
        addLog(`Offering identifier: ${offering.identifier || 'unknown'}`);
        addLog(`Available packages count: ${offering.availablePackages?.length || 0}`);
        
        if (offering.availablePackages && offering.availablePackages.length > 0) {
          // Log all packages for debugging
          offering.availablePackages.forEach((pkg, index) => {
            addLog(`Package ${index}: type=${pkg.packageType}, id=${pkg.product?.identifier}, price=${pkg.product?.priceString}`);
          });
          
          const monthly = offering.availablePackages.find(
            pkg => pkg.packageType === 'MONTHLY' || pkg.product?.identifier === 'com.steadysteps.monthly'
          );
          const annual = offering.availablePackages.find(
            pkg => pkg.packageType === 'ANNUAL' || pkg.product?.identifier === 'com.steadysteps.annual'
          );
          
          if (monthly) {
            addLog(`Monthly package found: ${monthly.product?.priceString}`);
            setMonthlyPackage(monthly);
          } else {
            addLog('No monthly package found in offerings');
          }
          
          if (annual) {
            addLog(`Annual package found: ${annual.product?.priceString}`);
            setAnnualPackage(annual);
          } else {
            addLog('No annual package found in offerings');
          }
        } else {
          addLog('Offering has no available packages');
        }
      } else {
        addLog('No offerings available - will show error UI');
        setError(language === 'en' 
          ? 'Unable to load subscription plans. Please try again later.' 
          : 'No se pudieron cargar los planes. Por favor intenta más tarde.');
      }

      setIsLoading(false);

    } catch (err: any) {
      addLog('=== PAYMENT FLOW ERROR ===');
      addLog(`Error: ${err.message || err}`);
      setError(err.message || 'Unable to load payment options');
      setIsLoading(false);
    }
  }

  async function handlePurchase(pkg: RevenueCatPackage, planType: string) {
    if (!user) return;
    
    setIsPurchasing(planType);
    addLog(`Starting purchase for ${planType}...`);

    try {
      const success = await purchasePackage(pkg);
      
      if (success) {
        addLog('Purchase successful!');
        await updateSubscriptionStatus(user.id);
        await markOnboardingComplete(user.id);
        onNext();
      } else {
        addLog('Purchase cancelled or failed');
        setIsPurchasing(null);
      }
    } catch (err: any) {
      addLog(`Purchase error: ${err.message}`);
      setError(err.message || 'Unable to complete purchase');
      setIsPurchasing(null);
    }
  }

  async function updateSubscriptionStatus(userId: string) {
    try {
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'subscribed',
          trial_start_date: new Date().toISOString(),
        })
        .eq('id', userId);
      addLog('Database updated with subscription status');
    } catch (err) {
      addLog(`Error updating subscription: ${err}`);
    }
  }

  async function markOnboardingComplete(userId: string) {
    try {
      await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
        })
        .eq('id', userId);
      addLog('Onboarding marked complete');
    } catch (err) {
      addLog(`Error marking onboarding complete: ${err}`);
    }
  }

  async function handleRestore() {
    setIsRestoring(true);
    addLog('Starting restore...');
    
    try {
      const restored = await restorePurchases();
      addLog(`Restore result: ${restored}`);
      
      if (restored && user) {
        await updateSubscriptionStatus(user.id);
        await markOnboardingComplete(user.id);
        onNext();
      } else {
        setError(language === 'en' 
          ? 'No active subscription found' 
          : 'No se encontró suscripción activa');
      }
    } catch (err: any) {
      addLog(`Restore error: ${err.message}`);
      setError(err.message || 'Unable to restore purchases');
    } finally {
      setIsRestoring(false);
    }
  }

  const texts = {
    en: {
      loading: 'Loading...',
      title: 'Start Your Journey',
      subtitle: 'Choose your plan and begin transforming your health',
      monthly: 'Monthly',
      annual: 'Annual',
      perMonth: '/month',
      perYear: '/year',
      save: 'Save 30%',
      freeTrial: '7-day free trial',
      features: [
        'Personalized daily check-ins',
        'AI-powered fitness coach',
        'Progress tracking & insights',
        'Habit building tools',
        'Community support',
      ],
      subscribe: 'Start Free Trial',
      subscribing: 'Processing...',
      restore: 'Restore Purchases',
      restoring: 'Restoring...',
      termsNote: 'Cancel anytime. Subscription auto-renews after trial.',
      error: 'Something went wrong',
      tryAgain: 'Try Again',
    },
    es: {
      loading: 'Cargando...',
      title: 'Comienza Tu Viaje',
      subtitle: 'Elige tu plan y comienza a transformar tu salud',
      monthly: 'Mensual',
      annual: 'Anual',
      perMonth: '/mes',
      perYear: '/año',
      save: 'Ahorra 30%',
      freeTrial: '7 días de prueba gratis',
      features: [
        'Check-ins diarios personalizados',
        'Entrenador fitness con IA',
        'Seguimiento de progreso',
        'Herramientas de hábitos',
        'Apoyo comunitario',
      ],
      subscribe: 'Iniciar Prueba Gratis',
      subscribing: 'Procesando...',
      restore: 'Restaurar Compras',
      restoring: 'Restaurando...',
      termsNote: 'Cancela cuando quieras. Se renueva automáticamente.',
      error: 'Algo salió mal',
      tryAgain: 'Intentar de Nuevo',
    },
  };

  const localT = texts[language];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{localT.loading}</p>
      </div>
    );
  }

  // Error state with retry
  if (error && !monthlyPackage && !annualPackage) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">{localT.error}</h2>
        <p className="text-muted-foreground mb-6 max-w-xs">{error}</p>
        
        <div className="space-y-3 w-full max-w-xs">
          <Button onClick={() => handlePaymentFlow()} className="w-full" size="lg">
            <RefreshCw className="w-4 h-4 mr-2" />
            {localT.tryAgain}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleRestore} 
            disabled={isRestoring}
            className="w-full"
          >
            {isRestoring ? localT.restoring : localT.restore}
          </Button>
        </div>
      </div>
    );
  }

  // Main payment UI
  return (
    <div className="flex-1 flex flex-col px-6 py-8 overflow-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-heading font-bold mb-2">{localT.title}</h1>
        <p className="text-muted-foreground">{localT.subtitle}</p>
      </div>

      {/* Plan Selection */}
      <div className="space-y-4 mb-6">
        {/* Annual Plan */}
        {annualPackage && (
          <Card 
            className={`cursor-pointer transition-all ${
              selectedPlan === 'annual' 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => setSelectedPlan('annual')}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-lg">{localT.annual}</span>
                    <Badge variant="secondary" className="bg-success/10 text-success border-0">
                      {localT.save}
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">
                      {annualPackage.product.priceString || '$49.99'}
                    </span>
                    <span className="text-muted-foreground">{localT.perYear}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {localT.freeTrial}
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'annual' 
                    ? 'border-primary bg-primary' 
                    : 'border-muted-foreground/30'
                }`}>
                  {selectedPlan === 'annual' && (
                    <Check className="w-4 h-4 text-primary-foreground" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monthly Plan */}
        {monthlyPackage && (
          <Card 
            className={`cursor-pointer transition-all ${
              selectedPlan === 'monthly' 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => setSelectedPlan('monthly')}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className="font-semibold text-lg">{localT.monthly}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">
                      {monthlyPackage.product.priceString || '$5.99'}
                    </span>
                    <span className="text-muted-foreground">{localT.perMonth}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {localT.freeTrial}
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'monthly' 
                    ? 'border-primary bg-primary' 
                    : 'border-muted-foreground/30'
                }`}>
                  {selectedPlan === 'monthly' && (
                    <Check className="w-4 h-4 text-primary-foreground" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Features */}
      <div className="mb-8">
        <ul className="space-y-3">
          {localT.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-success" />
              </div>
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Subscribe Button */}
      <div className="space-y-3 mt-auto">
        <Button
          size="lg"
          className="w-full py-6 text-lg font-semibold"
          onClick={() => {
            const pkg = selectedPlan === 'annual' ? annualPackage : monthlyPackage;
            if (pkg) handlePurchase(pkg, selectedPlan);
          }}
          disabled={isPurchasing !== null || (!monthlyPackage && !annualPackage)}
        >
          {isPurchasing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {localT.subscribing}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              {localT.subscribe}
            </>
          )}
        </Button>

        <Button 
          variant="ghost" 
          onClick={handleRestore} 
          disabled={isRestoring}
          className="w-full"
        >
          {isRestoring ? localT.restoring : localT.restore}
        </Button>

        <p className="text-xs text-center text-muted-foreground px-4">
          {localT.termsNote}
        </p>

        {error && (
          <p className="text-xs text-center text-destructive">{error}</p>
        )}
      </div>
    </div>
  );
};
