import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Shield, Check } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TermsScreenProps {
  onNext: () => void;
}

export const TermsScreen = ({ onNext }: TermsScreenProps) => {
  const { t, language } = useLanguage();
  const [termsViewed, setTermsViewed] = useState(false);
  const [privacyViewed, setPrivacyViewed] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleOpenTerms = () => {
    setShowTerms(true);
    setTermsViewed(true);
  };

  const handleOpenPrivacy = () => {
    setShowPrivacy(true);
    setPrivacyViewed(true);
  };

  return (
    <div className="flex-1 flex flex-col px-6 py-12">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-heading font-bold mb-2 text-center"
      >
        {t('terms.title')}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-muted-foreground text-center mb-8"
      >
        {t('terms.subtitle')}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 max-w-sm mx-auto w-full"
      >
        {/* Terms Link */}
        <button
          onClick={handleOpenTerms}
          className="w-full p-4 rounded-xl border-2 border-border bg-card hover:border-primary/50 transition-all flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <FileText className="w-5 h-5 text-muted-foreground" />
          </div>
          <span className="flex-1 text-left font-medium">{t('terms.termsLink')}</span>
          {termsViewed && (
            <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
              <Check className="w-4 h-4 text-success" />
            </div>
          )}
        </button>

        {/* Privacy Link */}
        <button
          onClick={handleOpenPrivacy}
          className="w-full p-4 rounded-xl border-2 border-border bg-card hover:border-primary/50 transition-all flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <Shield className="w-5 h-5 text-muted-foreground" />
          </div>
          <span className="flex-1 text-left font-medium">{t('terms.privacyLink')}</span>
          {privacyViewed && (
            <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
              <Check className="w-4 h-4 text-success" />
            </div>
          )}
        </button>

        {/* Agreement Checkbox */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border mt-6">
          <Checkbox
            id="terms-agree"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked === true)}
          />
          <label htmlFor="terms-agree" className="text-sm leading-relaxed cursor-pointer">
            {t('terms.agree')}
          </label>
        </div>

        <Button
          size="lg"
          onClick={onNext}
          disabled={!agreed}
          className="w-full py-6 text-lg font-semibold mt-6"
        >
          {t('common.continue')}
        </Button>
      </motion.div>

      {/* Terms Modal */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{t('terms.termsLink')}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground text-sm mb-4">Last Updated: January 2026</p>
              
              <h3>1. Acceptance of Terms</h3>
              <p>By downloading, accessing, or using SteadySteps, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the app.</p>

              <h3>2. Description of Service</h3>
              <p>SteadySteps is a habit-tracking and wellness app designed to help users build healthy habits through daily check-ins, progress tracking, and motivational support.</p>

              <h3>3. Not Medical Advice</h3>
              <p>SteadySteps provides general wellness information and habit-tracking tools only. The content in this app, including advice from the AI Coach feature, is for informational and motivational purposes only and is not intended as medical advice, diagnosis, or treatment.</p>

              <h3>4. No Guaranteed Results</h3>
              <p>Individual results vary. SteadySteps does not guarantee any specific health outcomes, weight loss, fitness improvements, or other results.</p>

              <h3>5. Subscription Terms</h3>
              <p>SteadySteps offers subscription plans to access premium features:</p>
              <ul>
                <li>Monthly subscription: $4.99 per month</li>
                <li>Annual subscription: $29.99 per year</li>
              </ul>
              <p>Free Trial: New users receive a 7-day free trial. Your subscription will automatically begin after the trial ends unless cancelled.</p>

              <h3>6. User Accounts</h3>
              <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>

              <h3>7. Limitation of Liability</h3>
              <p>To the maximum extent permitted by law, SteadySteps and its owners shall not be liable for any indirect, incidental, special, consequential, or punitive damages.</p>

              <h3>8. Contact Us</h3>
              <p>If you have questions about these Terms, please contact us at support@steadystepsapp.com.</p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Privacy Modal */}
      <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
        <DialogContent className="max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{t('terms.privacyLink')}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground text-sm mb-4">Last Updated: January 2026</p>
              
              <h3>1. Information We Collect</h3>
              <p><strong>Account Information:</strong> When you create an account, we collect your name, email address, and payment information (processed securely through Stripe).</p>
              <p><strong>Profile Information:</strong> Information you provide during onboarding, including your wellness goals and notification preferences.</p>
              <p><strong>Usage Data:</strong> Information about how you use the app, including daily check-ins, activity completions, and progress information.</p>

              <h3>2. How We Use Your Information</h3>
              <ul>
                <li>Provide and operate the SteadySteps app</li>
                <li>Track your progress and display achievements</li>
                <li>Personalize your experience</li>
                <li>Send notifications and reminders</li>
                <li>Process subscription payments</li>
              </ul>

              <h3>3. Data Storage and Security</h3>
              <p>We use industry-standard security measures to protect your personal information. Your data is stored on secure servers with encryption.</p>

              <h3>4. We Do Not Sell Your Data</h3>
              <p>We do not sell, rent, or trade your personal information to third parties for their marketing purposes.</p>

              <h3>5. Your Rights and Choices</h3>
              <p><strong>Access and Download:</strong> You can request a copy of your data through the Privacy settings.</p>
              <p><strong>Deletion:</strong> You can delete your account and all associated data at any time through the app settings.</p>

              <h3>6. Children's Privacy</h3>
              <p>SteadySteps is not intended for children under 13 years of age.</p>

              <h3>7. Contact Us</h3>
              <p>If you have questions about this Privacy Policy, please contact us at privacy@steadystepsapp.com.</p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};
