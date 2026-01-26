import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';

export const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (error) {
      toast.error('Unable to open subscription management');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-8 pb-4 bg-card border-b border-border">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span>{t('common.back')}</span>
        </button>
        <h1 className="text-3xl font-heading font-bold">{t('subscription.title')}</h1>
      </header>

      <main className="px-6 py-6 space-y-6">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl border-2 border-border bg-card">
          <h2 className="font-heading font-semibold mb-2">{t('subscription.yourPlan')}</h2>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg font-bold">SteadySteps Monthly</span>
            <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-xs font-medium">{t('subscription.active')}</span>
          </div>
          <p className="text-sm text-muted-foreground">$4.99/month</p>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl border-2 border-border bg-card">
          <h2 className="font-heading font-semibold mb-4">{t('subscription.paymentMethod')}</h2>
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <span>{t('subscription.cardEnding')} ****</span>
          </div>
        </motion.section>

        <Button onClick={handleManageSubscription} className="w-full">{t('subscription.updatePayment')}</Button>
        
        <button onClick={handleManageSubscription} className="w-full text-center text-sm text-muted-foreground hover:text-destructive transition-colors py-2">
          {t('subscription.cancelSubscription')}
        </button>
      </main>
      <BottomNavigation />
    </div>
  );
};
