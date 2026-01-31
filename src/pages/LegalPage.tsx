import { useState } from 'react';
import { ArrowLeft, FileText, Shield, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';

const TERMS_CONTENT = `STEADYSTEPS TERMS AND CONDITIONS

Last Updated: January 2025

Welcome to SteadySteps. By using this app, you agree to these terms. Please read them carefully.

1. ACCEPTANCE OF TERMS

By downloading, accessing, or using SteadySteps, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the app.

2. DESCRIPTION OF SERVICE

SteadySteps is a habit-tracking and wellness app designed to help users build healthy habits through daily check-ins, progress tracking, and motivational support. The app includes features such as activity tracking, nutrition habit monitoring, an AI coaching assistant, badges, progress reports, and accountability buddy connections.

3. NOT MEDICAL ADVICE

IMPORTANT: SteadySteps provides general wellness information and habit-tracking tools only. The content in this app, including advice from the AI Coach feature, is for informational and motivational purposes only.

This app is NOT intended as medical advice, diagnosis, or treatment. The information provided should not be used as a substitute for professional medical advice.

Always consult a qualified healthcare provider before starting any fitness or nutrition program, especially if you have any health conditions, are pregnant, or are taking medications.

Do not disregard professional medical advice or delay seeking it because of information provided in this app.

SteadySteps, its creators, and its affiliates are not responsible for any health decisions you make based on app content.

4. NO GUARANTEED RESULTS

Individual results vary significantly. SteadySteps does not guarantee any specific health outcomes, weight loss, fitness improvements, or other results.

Your results depend on many factors including but not limited to:
- Your individual effort and consistency
- Your starting health condition
- Your adherence to the program
- Genetic factors
- Other lifestyle factors outside the app

Testimonials or success stories shared within the app or in marketing materials represent individual experiences and are not guarantees of similar results.

5. SUBSCRIPTION TERMS

SteadySteps offers subscription plans to access premium features.

Subscription Options:
- Monthly subscription: $4.99 USD per month
- Annual subscription: $41.88 USD per year (30% savings)

Free Trial:
New users receive a 7-day free trial. A valid payment method is required to start the trial. You will not be charged during the trial period. If you do not cancel before the trial ends, your subscription will automatically begin and your payment method will be charged.

Automatic Renewal:
All subscriptions automatically renew at the end of each billing period (monthly or annually) unless you cancel at least 24 hours before the renewal date. Your payment method will be charged automatically at the then-current subscription rate.

Cancellation:
You may cancel your subscription at any time through the app settings (Profile > Subscription > Cancel Subscription). Cancellation takes effect at the end of your current billing period. You will retain access to premium features until that date.

No Refunds:
No refunds are provided for partial billing periods or unused portions of a subscription. If you cancel, you will continue to have access until the end of your current billing period.

Price Changes:
We reserve the right to change subscription prices at any time. Price changes will be communicated in advance and will apply to billing periods starting after the effective date of the change. Your continued use of the app after a price change constitutes acceptance of the new price.

6. USER ACCOUNTS

You are responsible for:
- Maintaining the confidentiality of your account credentials
- All activities that occur under your account
- Providing accurate and complete information when creating your account
- Updating your information if it changes

You must notify us immediately of any unauthorized use of your account.

You must be at least 18 years old to create an account and use this app.

7. USER CONTENT

You retain ownership of any content you submit to the app, including check-in data, coach conversations, and profile information.

By submitting content, you grant SteadySteps a non-exclusive, worldwide, royalty-free license to use, store, and process your content solely for the purpose of providing and improving the service.

8. ACCEPTABLE USE

You agree not to:
- Use the app for any unlawful purpose
- Attempt to gain unauthorized access to any part of the app or its systems
- Interfere with or disrupt the app or servers
- Upload malicious code or content
- Impersonate any person or entity
- Use the app to harass, abuse, or harm others
- Share your account credentials with others

9. AI COACH FEATURE

The AI Coach (Coach Lily) is an artificial intelligence assistant designed to provide general fitness and nutrition information and motivation.

The AI Coach:
- Provides general wellness information only
- Is not a substitute for professional medical, nutritional, or fitness advice
- May occasionally provide inaccurate or incomplete information
- Should not be relied upon for medical decisions

10. BUDDY FEATURE

The buddy feature allows you to connect with other users for accountability support.

By using this feature, you agree to:
- Interact respectfully with other users
- Not share inappropriate or harmful content
- Report any concerning behavior to support

SteadySteps is not responsible for interactions between users.

11. INTELLECTUAL PROPERTY

All content in SteadySteps, including but not limited to text, graphics, logos, icons, images, audio, and software, is the property of SteadySteps or its licensors and is protected by copyright, trademark, and other intellectual property laws.

You may not copy, modify, distribute, sell, or lease any part of the app or its content without our express written permission.

12. DISCLAIMER OF WARRANTIES

THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

We do not warrant that the app will be uninterrupted, error-free, or free of viruses or other harmful components.

13. LIMITATION OF LIABILITY

TO THE MAXIMUM EXTENT PERMITTED BY LAW, STEADYSTEPS AND ITS OWNERS, EMPLOYEES, AFFILIATES, AND PARTNERS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM:
- YOUR USE OF OR INABILITY TO USE THE APP
- ANY CONTENT OR INFORMATION OBTAINED FROM THE APP
- UNAUTHORIZED ACCESS TO YOUR DATA
- ANY HEALTH DECISIONS OR OUTCOMES RELATED TO APP USE

OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SERVICE IN THE TWELVE MONTHS PRECEDING THE CLAIM.

14. INDEMNIFICATION

You agree to indemnify and hold harmless SteadySteps and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the app or violation of these terms.

15. CHANGES TO TERMS

We may update these Terms and Conditions from time to time. We will notify you of significant changes through the app or by email to the address associated with your account.

Your continued use of the app after changes are posted constitutes acceptance of the updated terms.

16. TERMINATION

We reserve the right to suspend or terminate your account at any time if you violate these terms or engage in conduct we deem harmful to other users, the app, or SteadySteps.

You may terminate your account at any time by deleting your account through the app settings.

17. GOVERNING LAW

These terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles.

18. DISPUTE RESOLUTION

Any disputes arising from these terms or your use of the app shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, except that you may bring claims in small claims court if eligible.

You agree to waive any right to participate in class action lawsuits or class-wide arbitration.

19. SEVERABILITY

If any provision of these terms is found to be unenforceable, the remaining provisions will continue in full force and effect.

20. ENTIRE AGREEMENT

These Terms and Conditions, together with our Privacy Policy, constitute the entire agreement between you and SteadySteps regarding your use of the app.

21. CONTACT US

If you have questions about these Terms and Conditions, please contact us at:

Email: support@steadystepsapp.com`;

const PRIVACY_CONTENT = `STEADYSTEPS PRIVACY POLICY

Last Updated: January 2025

SteadySteps ("we," "our," or "us") respects your privacy. This Privacy Policy explains what information we collect, how we use it, how we protect it, and your choices regarding your data.

By using SteadySteps, you agree to the collection and use of information in accordance with this policy.

1. INFORMATION WE COLLECT

1.1 Information You Provide

Account Information:
- Name
- Email address
- Password (encrypted)
- Payment information (processed securely through Stripe; we do not store full card numbers)

Profile Information:
- Wellness goals selected during onboarding
- Activity level
- Nutrition challenges
- Notification preferences
- Language preference

1.2 Information Generated Through Use

Usage Data:
- Daily check-in responses (activity completion, nutrition habits)
- Streak and progress data
- Badge achievements
- Mood check-in selections (if you choose to use this feature)
- Habit library selections
- Weekly summary data

Coach Conversations:
- Questions you ask the AI Coach
- Conversation history (used to provide contextual responses)

Buddy Connections:
- Buddy relationships
- Encouragement messages sent and received

1.3 Automatically Collected Information

Device Information:
- Device type (iPhone, Android, etc.)
- Operating system version
- App version
- Unique device identifiers

Usage Analytics:
- Features used
- Time spent in app
- Screens visited
- Crash reports

2. HOW WE USE YOUR INFORMATION

We use your information to:

Provide the Service:
- Create and manage your account
- Track your progress and display achievements
- Enable the AI Coach to respond to your questions
- Send notifications you have enabled
- Connect you with buddies

Personalize Your Experience:
- Customize Coach responses based on your goals
- Adjust difficulty progression based on your activity
- Show relevant daily tips

Process Payments:
- Process subscription payments through Stripe
- Manage trials and renewals
- Handle refund requests

Improve Our Service:
- Analyze usage patterns to improve features
- Fix bugs and technical issues
- Develop new features

Communicate With You:
- Send service-related announcements
- Respond to support requests
- Send optional marketing communications (with your consent)

Comply With Legal Obligations:
- Respond to legal requests
- Enforce our terms
- Protect against fraud

3. DATA STORAGE AND SECURITY

We implement industry-standard security measures to protect your personal information:

- Data is encrypted in transit using TLS/SSL
- Data is encrypted at rest
- Access to user data is restricted to authorized personnel
- Regular security audits and updates
- Secure password hashing

Payment information is processed by Stripe, a PCI-DSS compliant payment processor. We do not store your full credit card number on our servers.

While we take reasonable precautions, no method of electronic storage or transmission is 100% secure. We cannot guarantee absolute security of your data.

4. WE DO NOT SELL YOUR DATA

We do not sell, rent, or trade your personal information to third parties for their marketing purposes.

We will never sell your data. Period.

5. THIRD-PARTY SERVICES

We use the following third-party services to operate SteadySteps:

Stripe (Payment Processing):
- Processes subscription payments
- Stores payment method information
- Their privacy policy: https://stripe.com/privacy

AI Services (Coach Feature):
- Processes your questions to generate responses
- We do not use your conversations to train AI models
- Conversations are processed in real-time and not retained by the AI provider

Analytics Services:
- Help us understand how users interact with the app
- Data is aggregated and anonymized where possible

Cloud Hosting:
- Stores app data securely
- Located in the United States

We require all third-party service providers to protect your information and use it only for the purposes we specify.

6. DATA RETENTION

We retain your data for as long as your account is active and as needed to provide you with our services.

If you delete your account:
- Your personal data will be deleted within 30 days
- Some anonymized, aggregated data may be retained for analytics
- Data required for legal compliance may be retained as required by law

Backup copies may persist for up to 90 days before being fully purged.

7. YOUR RIGHTS AND CHOICES

7.1 Access and Download Your Data

You can request a copy of your data at any time through:
Profile > Settings > Privacy > Download My Data

We will provide your data in a portable format within 30 days.

7.2 Correct Your Information

You can update your profile information at any time through the app:
Profile > Edit Profile

7.3 Delete Your Data

You can delete your account and all associated data at any time through:
Profile > Settings > Privacy > Delete Account

This action is permanent and cannot be undone. Deleting your account will:
- Remove all your personal information
- Delete your progress and check-in history
- Cancel your subscription
- Remove you from buddy connections

7.4 Manage Notifications

You can control which notifications you receive through:
Profile > Notification Settings

7.5 Opt Out of Marketing

You can opt out of marketing communications by:
- Clicking "unsubscribe" in any marketing email
- Adjusting your notification settings in the app

7.6 Data Portability

You have the right to receive your data in a structured, commonly used format and to transmit it to another service.

8. CHILDREN'S PRIVACY

SteadySteps is not intended for children under 13 years of age (or under 16 in certain jurisdictions).

We do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13, we will delete that information promptly.

If you believe we have collected information from a child under 13, please contact us immediately at support@steadystepsapp.com.

9. INTERNATIONAL USERS

SteadySteps is operated from the United States. If you access the app from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States.

By using the app, you consent to the transfer of your information to the United States, which may have different data protection laws than your country of residence.

For users in the European Economic Area (EEA), we rely on the following legal bases for processing:
- Contract performance (to provide our services)
- Legitimate interests (to improve our services)
- Consent (for optional features and marketing)

10. CALIFORNIA PRIVACY RIGHTS

If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):

- Right to know what personal information we collect
- Right to delete your personal information
- Right to opt out of the sale of personal information (we do not sell your data)
- Right to non-discrimination for exercising your rights

To exercise these rights, contact us at support@steadystepsapp.com.

11. CHANGES TO THIS POLICY

We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons.

We will notify you of significant changes by:
- Posting a notice in the app
- Sending an email to your registered address
- Updating the "Last Updated" date at the top of this policy

Your continued use of the app after changes are posted constitutes acceptance of the updated policy.

12. CONTACT US

If you have questions about this Privacy Policy, want to exercise your data rights, or have concerns about how we handle your information, please contact us:

Email: support@steadystepsapp.com

We will respond to your inquiry within 30 days.`;

export const LegalPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showDocument, setShowDocument] = useState<'terms' | 'privacy' | null>(null);

  if (showDocument) {
    const content = showDocument === 'terms' ? TERMS_CONTENT : PRIVACY_CONTENT;
    const title = showDocument === 'terms' ? t('legal.terms') : t('legal.privacy');

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="px-6 pt-8 pb-4 bg-card border-b border-border flex items-center justify-between">
          <h1 className="text-xl font-heading font-bold">{title}</h1>
          <button 
            onClick={() => setShowDocument(null)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </header>
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
              {content}
            </pre>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-8 pb-4 bg-card border-b border-border">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-muted-foreground mb-4 min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('common.back')}</span>
        </button>
        <h1 className="text-3xl font-heading font-bold">{t('legal.title')}</h1>
      </header>

      <main className="px-6 py-6 space-y-4">
        <button 
          onClick={() => setShowDocument('terms')}
          className="w-full p-4 rounded-xl border-2 border-border bg-card flex items-center gap-4 hover:border-primary/50 transition-colors min-h-[44px]"
        >
          <FileText className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium">{t('legal.terms')}</span>
        </button>
        <button 
          onClick={() => setShowDocument('privacy')}
          className="w-full p-4 rounded-xl border-2 border-border bg-card flex items-center gap-4 hover:border-primary/50 transition-colors min-h-[44px]"
        >
          <Shield className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium">{t('legal.privacy')}</span>
        </button>
      </main>
      <BottomNavigation />
    </div>
  );
};
