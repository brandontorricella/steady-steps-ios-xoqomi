import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Share2, Gift, Trophy, Award, Users, UserPlus, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { toast } from 'sonner';
import { getUserProfile } from '@/lib/storage';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const CommunityPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const profile = getUserProfile();
  const [referralStats, setReferralStats] = useState({
    invited: 0,
    paidSignups: 0,
    freeMonthsEarned: 0,
  });
  const [loading, setLoading] = useState(true);
  
  const referralCode = user?.id?.slice(0, 8) || 'demo';
  const referralLink = `https://steadysteps.app/join?ref=${referralCode}`;
  
  const texts = {
    en: {
      title: 'Community',
      inviteFriends: 'Invite Friends',
      shareTitle: 'Share the Journey',
      shareDesc: 'Invite friends to join you on SteadySteps. When 2 friends sign up for a paid membership through your link, you get a FREE month!',
      copyLink: 'Copy Link',
      share: 'Share',
      yourRewards: 'Your Rewards',
      howItWorks: 'How It Works',
      step1: 'Share your unique referral link with friends',
      step2: 'When a friend signs up for a paid membership, it counts toward your reward',
      step3: 'After 2 paid referrals, you earn 1 FREE month of SteadySteps!',
      stats: {
        invited: 'Friends Invited',
        paidSignups: 'Paid Signups',
        freeMonths: 'Free Months Earned',
      },
      progressTitle: 'Your Progress',
      progressDesc: 'referrals until your next free month',
      rewardUnlocked: '🎉 You earned a free month!',
      buddies: 'Find Accountability Buddies',
      buddiesDesc: 'Connect with other SteadySteps members for extra motivation',
      viewBuddies: 'View Buddies',
      badges: 'Your Badges',
      viewBadges: 'View All Badges',
    },
    es: {
      title: 'Comunidad',
      inviteFriends: 'Invitar Amigas',
      shareTitle: 'Comparte el Camino',
      shareDesc: 'Invita a amigas a unirse a SteadySteps. ¡Cuando 2 amigas se suscriban a una membresía de pago a través de tu enlace, obtienes 1 MES GRATIS!',
      copyLink: 'Copiar Enlace',
      share: 'Compartir',
      yourRewards: 'Tus Recompensas',
      howItWorks: 'Cómo Funciona',
      step1: 'Comparte tu enlace único de referido con amigas',
      step2: 'Cuando una amiga se suscribe a una membresía de pago, cuenta para tu recompensa',
      step3: '¡Después de 2 referidos de pago, ganas 1 MES GRATIS de SteadySteps!',
      stats: {
        invited: 'Amigas Invitadas',
        paidSignups: 'Suscripciones de Pago',
        freeMonths: 'Meses Gratis Ganados',
      },
      progressTitle: 'Tu Progreso',
      progressDesc: 'referidos para tu próximo mes gratis',
      rewardUnlocked: '🎉 ¡Ganaste un mes gratis!',
      buddies: 'Encuentra Amigas de Responsabilidad',
      buddiesDesc: 'Conéctate con otros miembros de SteadySteps para motivación extra',
      viewBuddies: 'Ver Amigas',
      badges: 'Tus Insignias',
      viewBadges: 'Ver Todas las Insignias',
    },
  };

  const t = texts[language];

  useEffect(() => {
    const fetchReferralStats = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data: referrals, error } = await supabase
          .from('referrals')
          .select('*')
          .eq('referrer_id', user.id);

        if (error) throw error;

        const invited = referrals?.length || 0;
        const paidSignups = referrals?.filter(r => r.status === 'paid')?.length || 0;
        const freeMonthsEarned = Math.floor(paidSignups / 2);

        setReferralStats({ invited, paidSignups, freeMonthsEarned });
      } catch (error) {
        console.error('Error fetching referral stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralStats();
  }, [user?.id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success(language === 'en' ? 'Link copied!' : '¡Enlace copiado!');
  };

  const handleShare = async () => {
    const shareMessage = language === 'en' 
      ? `I'm using SteadySteps to build healthier habits one small step at a time. Join me! ${referralLink}`
      : `Estoy usando SteadySteps para crear hábitos más saludables paso a paso. ¡Únete! ${referralLink}`;

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

  const referralsToNextReward = 2 - (referralStats.paidSignups % 2);
  const progressPercent = ((referralStats.paidSignups % 2) / 2) * 100;

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
      </header>

      <main className="px-6 py-6 space-y-6">
        {/* Share Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl gradient-primary text-primary-foreground"
        >
          <div className="flex items-center gap-3 mb-3">
            <UserPlus className="w-6 h-6" />
            <h2 className="text-xl font-heading font-bold">{t.shareTitle}</h2>
          </div>
          <p className="text-sm opacity-90 mb-4">{t.shareDesc}</p>
          
          <div className="p-3 rounded-xl bg-background/20 mb-4">
            <p className="text-sm font-mono truncate">{referralLink}</p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleCopyLink} variant="secondary" className="flex-1">
              <Copy className="w-4 h-4 mr-2" />
              {t.copyLink}
            </Button>
            <Button onClick={handleShare} variant="secondary" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              {t.share}
            </Button>
          </div>
        </motion.section>

        {/* Progress to Free Month */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl border-2 border-border bg-card"
        >
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-heading font-bold">{t.progressTitle}</h2>
          </div>
          
          {referralsToNextReward === 0 ? (
            <div className="p-4 rounded-xl bg-success/10 border border-success/30 text-center">
              <p className="text-lg font-semibold text-success">{t.rewardUnlocked}</p>
            </div>
          ) : (
            <>
              <div className="h-4 rounded-full bg-secondary overflow-hidden mb-3">
                <motion.div 
                  className="h-full gradient-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                <span className="font-bold text-primary">{referralsToNextReward}</span> {t.progressDesc}
              </p>
            </>
          )}
        </motion.section>

        {/* How It Works */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-6 rounded-2xl border-2 border-border bg-card"
        >
          <h2 className="text-xl font-heading font-bold mb-4">{t.howItWorks}</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <p className="text-sm">{t.step1}</p>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <p className="text-sm">{t.step2}</p>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Gift className="w-4 h-4 text-accent" />
              </div>
              <p className="text-sm font-medium">{t.step3}</p>
            </div>
          </div>
        </motion.section>

        {/* Stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4"
        >
          <div className="p-4 rounded-xl border-2 border-border bg-card text-center">
            <p className="text-2xl font-bold text-primary">{referralStats.invited}</p>
            <p className="text-xs text-muted-foreground">{t.stats.invited}</p>
          </div>
          <div className="p-4 rounded-xl border-2 border-border bg-card text-center">
            <p className="text-2xl font-bold text-primary">{referralStats.paidSignups}</p>
            <p className="text-xs text-muted-foreground">{t.stats.paidSignups}</p>
          </div>
          <div className="p-4 rounded-xl border-2 border-border bg-card text-center">
            <p className="text-2xl font-bold text-accent">{referralStats.freeMonthsEarned}</p>
            <p className="text-xs text-muted-foreground">{t.stats.freeMonths}</p>
          </div>
        </motion.section>

        {/* Buddies Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-6 rounded-2xl border-2 border-border bg-card"
        >
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-heading font-bold">{t.buddies}</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{t.buddiesDesc}</p>
          <Button onClick={() => navigate('/buddies')} variant="outline" className="w-full">
            {t.viewBuddies}
          </Button>
        </motion.section>

        {/* Badges Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl border-2 border-border bg-card"
        >
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-heading font-bold">{t.badges}</h2>
          </div>
          <Button onClick={() => navigate('/badges')} variant="outline" className="w-full mt-4">
            {t.viewBadges}
          </Button>
        </motion.section>
      </main>

      <BottomNavigation />
    </div>
  );
};
