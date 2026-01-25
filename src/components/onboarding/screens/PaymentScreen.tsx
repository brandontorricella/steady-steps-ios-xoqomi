import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Check, Shield, Sparkles } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PaymentScreenProps {
  onNext: () => void;
  onSkip?: () => void;
}

export const PaymentScreen = ({ onNext, onSkip }: PaymentScreenProps) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const trialEndDate = format(addDays(new Date(), 7), 'MMMM d, yyyy');

  const handleStartTrial = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { isAnnual: selectedPlan === 'annual' },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
        // User will return after payment, proceed to next screen
        setTimeout(() => {
          toast.success('You are all set! Let\'s begin.');
          onNext();
        }, 1000);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Unable to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    'Your personal AI fitness and nutrition coach',
    'Daily guidance that takes less than 60 seconds',
    'Progress tracking and achievement system',
    'Gentle reminders to keep you on track',
  ];

  return (
    <div className="flex-1 flex flex-col px-6 py-12 overflow-auto">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-heading font-bold mb-2 text-center"
      >
        Start Your Journey
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-muted-foreground text-center mb-6"
      >
        Join thousands of women building healthier habits
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
            <p className="font-semibold text-lg">Monthly</p>
            <p className="text-muted-foreground text-sm">Flexible, cancel anytime</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">$4.99</p>
            <p className="text-sm text-muted-foreground">/month</p>
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
            Save 50%
          </div>
          <div className="text-left">
            <p className="font-semibold text-lg">Annual</p>
            <p className="text-muted-foreground text-sm">Best value</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">$29.99</p>
            <p className="text-sm text-muted-foreground">/year</p>
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

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <Button
          size="lg"
          onClick={handleStartTrial}
          disabled={isLoading}
          className="w-full py-6 text-lg font-semibold"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {isLoading ? 'Opening checkout...' : 'Start My Free 7-Day Trial'}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          <Shield className="w-3 h-3 inline mr-1" />
          Your free trial starts today. You will not be charged until {trialEndDate}. Cancel anytime in settings.
        </p>

        <button
          onClick={onNext}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
        >
          Continue with free trial later
        </button>
      </motion.div>
    </div>
  );
};
