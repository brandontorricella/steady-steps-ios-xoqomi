import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Share2, Gift, Trophy, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { toast } from 'sonner';
import { getUserProfile } from '@/lib/storage';

export const ReferralPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const profile = getUserProfile();
  
  const referralLink = `https://steadysteps.app/join?ref=${profile?.id || 'demo'}`;
  const shareMessage = `I'm using SteadySteps to build healthier habits one small step at a time. Join me and we can support each other! ${referralLink}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Link copied!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on SteadySteps',
          text: shareMessage,
          url: referralLink,
        });
      } catch (error) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-8 pb-4 bg-card border-b border-border">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span>{t('common.back')}</span>
        </button>
        <h1 className="text-3xl font-heading font-bold">{t('referral.title')}</h1>
      </header>

      <main className="px-6 py-6 space-y-6">
        {/* Share Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl gradient-coral"
        >
          <h2 className="text-xl font-heading font-bold mb-2">{t('referral.shareTitle')}</h2>
          <p className="text-sm text-foreground/80 mb-4">{t('referral.shareDesc')}</p>
          
          <div className="p-3 rounded-xl bg-card/90 mb-4">
            <p className="text-sm font-mono text-muted-foreground truncate">{referralLink}</p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleCopyLink} variant="secondary" className="flex-1">
              <Copy className="w-4 h-4 mr-2" />
              {t('referral.copyLink')}
            </Button>
            <Button onClick={handleShare} className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              {t('referral.share')}
            </Button>
          </div>
        </motion.section>

        {/* Rewards Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl border-2 border-border bg-card"
        >
          <h2 className="text-xl font-heading font-bold mb-4">{t('referral.yourRewards')}</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-dusty-rose flex items-center justify-center">
                <Award className="w-6 h-6 text-dusty-rose-foreground" />
              </div>
              <p className="text-sm">{t('referral.rewards.signup')}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center">
                <Gift className="w-6 h-6 text-gold-foreground" />
              </div>
              <p className="text-sm">{t('referral.rewards.trial')}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm">{t('referral.rewards.week')}</p>
            </div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4"
        >
          <div className="p-4 rounded-xl border-2 border-border bg-card text-center">
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-xs text-muted-foreground">{t('referral.stats.invited')}</p>
          </div>
          <div className="p-4 rounded-xl border-2 border-border bg-card text-center">
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-xs text-muted-foreground">{t('referral.stats.joined')}</p>
          </div>
          <div className="p-4 rounded-xl border-2 border-border bg-card text-center">
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-xs text-muted-foreground">{t('referral.stats.earned')}</p>
          </div>
        </motion.section>
      </main>

      <BottomNavigation />
    </div>
  );
};
