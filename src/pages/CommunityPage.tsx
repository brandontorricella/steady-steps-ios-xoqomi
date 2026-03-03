import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { CommunityFeed } from '@/components/community/CommunityFeed';
import { AccountabilityMatching } from '@/components/community/AccountabilityMatching';
import { ReferralSection } from '@/components/community/ReferralSection';

export const CommunityPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'feed' | 'connect'>('feed');

  const texts = {
    en: {
      title: 'Community',
      feed: 'Feed',
      connect: 'Connect',
    },
    es: {
      title: 'Comunidad',
      feed: 'Feed',
      connect: 'Conectar',
    },
  };
  const t = texts[language];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-8 pb-4 bg-card border-b border-border">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground mb-4 min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{language === 'en' ? 'Back' : 'Atrás'}</span>
        </button>
        <h1 className="text-3xl font-heading font-bold">{t.title}</h1>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 p-1 rounded-xl bg-secondary">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'feed'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            {t.feed}
          </button>
          <button
            onClick={() => setActiveTab('connect')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'connect'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            <Users className="w-4 h-4" />
            {t.connect}
          </button>
        </div>
      </header>

      <main className="px-6 py-6">
        {activeTab === 'feed' ? (
          <CommunityFeed />
        ) : (
          <div className="space-y-6">
            <AccountabilityMatching />
            <ReferralSection />
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};
