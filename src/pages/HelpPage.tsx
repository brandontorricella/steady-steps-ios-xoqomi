import { ArrowLeft, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';

const faqs = [
  { q: 'How do I change my daily goals?', a: 'Your goals adjust automatically based on your consistency. Go to Profile > Settings > App Preferences to adjust manually.' },
  { q: 'What happens if I miss a day?', a: 'Missing a day resets your streak, but all your other progress is saved. You can earn Comeback badges for returning.' },
  { q: 'How does the AI Coach work?', a: 'Coach Lily is an AI assistant trained to answer questions about fitness and nutrition. Tap the Coach tab anytime.' },
  { q: 'How do I cancel my subscription?', a: 'Go to Profile > Subscription > Cancel Subscription. You\'ll keep access until your current billing period ends.' },
  { q: 'How do I delete my account?', a: 'Go to Profile > Settings > Privacy > Delete My Account. This permanently removes all your data.' },
];

export const HelpPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-8 pb-4 bg-card border-b border-border">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span>{t('common.back')}</span>
        </button>
        <h1 className="text-3xl font-heading font-bold">{t('help.title')}</h1>
      </header>

      <main className="px-6 py-6 space-y-6">
        <section>
          <h2 className="font-heading font-semibold mb-4">{t('help.faq')}</h2>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-xl border-2 border-border bg-card overflow-hidden">
                <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full p-4 flex items-center justify-between text-left">
                  <span className="font-medium">{faq.q}</span>
                  {openIndex === index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {openIndex === index && <div className="px-4 pb-4 text-sm text-muted-foreground">{faq.a}</div>}
              </div>
            ))}
          </div>
        </section>

        <section className="p-6 rounded-2xl border-2 border-border bg-card">
          <h2 className="font-heading font-semibold mb-2">{t('help.needHelp')}</h2>
          <p className="text-muted-foreground text-sm mb-4">{t('help.hereForYou')}</p>
          <a href="mailto:support@steadystepsapp.com" className="flex items-center gap-2 text-primary font-medium">
            <Mail className="w-5 h-5" />
            {t('help.emailSupport')}
          </a>
          <p className="text-xs text-muted-foreground mt-2">{t('help.responseTime')}</p>
        </section>
      </main>
      <BottomNavigation />
    </div>
  );
};
