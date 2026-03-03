import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Share2, Gift, Crown, Bell, UserPlus, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const ReferralSection = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [referralStats, setReferralStats] = useState({ invited: 0, paidSignups: 0, freeMonthsEarned: 0 });
  const [loading, setLoading] = useState(true);
  const [hasNewReward, setHasNewReward] = useState(false);

  const referralCode = user?.id?.slice(0, 8) || 'demo';
  const referralLink = `https://steadysteps.lovable.app/auth?ref=${referralCode}`;

  const texts = {
    en: {
      shareTitle: 'Share the Journey',
      shareDesc: 'Invite friends to join you on SteadySteps. When 2 friends sign up for a paid membership, you get a FREE month!',
      copyLink: 'Copy Link',
      share: 'Share',
      howItWorks: 'How It Works',
      step1: 'Share your unique referral link with friends',
      step2: 'When a friend signs up for a paid membership, it counts toward your reward',
      step3: 'After 2 paid referrals, you earn 1 FREE month of SteadySteps!',
      progressTitle: 'Your Progress',
      progressDesc: 'referrals until your next free month',
      rewardUnlocked: '🎉 You earned a free month!',
      newReward: 'New Reward!',
      newRewardDesc: 'You earned a free month from your referrals!',
      badges: 'Your Badges',
      viewBadges: 'View All Badges',
      stats: { invited: 'Friends Invited', paidSignups: 'Paid Signups', freeMonths: 'Free Months Earned' },
    },
    es: {
      shareTitle: 'Comparte el Camino',
      shareDesc: 'Invita a amigas a unirse a SteadySteps. ¡Cuando 2 amigas se suscriban, obtienes 1 MES GRATIS!',
      copyLink: 'Copiar Enlace',
      share: 'Compartir',
      howItWorks: 'Cómo Funciona',
      step1: 'Comparte tu enlace único de referido con amigas',
      step2: 'Cuando una amiga se suscribe a una membresía de pago, cuenta para tu recompensa',
      step3: '¡Después de 2 referidos de pago, ganas 1 MES GRATIS!',
      progressTitle: 'Tu Progreso',
      progressDesc: 'referidos para tu próximo mes gratis',
      rewardUnlocked: '🎉 ¡Ganaste un mes gratis!',
      newReward: '¡Nueva Recompensa!',
      newRewardDesc: '¡Ganaste un mes gratis de tus referidos!',
      badges: 'Tus Insignias',
      viewBadges: 'Ver Todas las Insignias',
      stats: { invited: 'Amigas Invitadas', paidSignups: 'Suscripciones de Pago', freeMonths: 'Meses Gratis Ganados' },
    },
  };
  const t = texts[language];

  useEffect(() => {
    const fetchReferralStats = async () => {
      if (!user?.id) { setLoading(false); return; }
      try {
        const { data: referrals, error } = await supabase.from('referrals').select('*').eq('referrer_id', user.id);
        if (error) throw error;
        const invited = referrals?.length || 0;
        const paidSignups = referrals?.filter(r => r.status === 'paid')?.length || 0;
        const freeMonthsEarned = Math.floor(paidSignups / 2);
        const previousFreeMonths = Math.floor((paidSignups - 1) / 2);
        if (freeMonthsEarned > previousFreeMonths && paidSignups > 0 && paidSignups % 2 === 0) setHasNewReward(true);
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
      ? `I'm using SteadySteps to build healthier habits. Join me! ${referralLink}`
      : `Estoy usando SteadySteps para crear hábitos más saludables. ¡Únete! ${referralLink}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Join me on SteadySteps', text: shareMessage, url: referralLink }); }
      catch { handleCopyLink(); }
    } else { handleCopyLink(); }
  };

  const referralsToNextReward = 2 - (referralStats.paidSignups % 2);
  const progressPercent = ((referralStats.paidSignups % 2) / 2) * 100;

  return (
    <>
      {hasNewReward && (
        <motion.section initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 rounded-2xl bg-success/10 border-2 border-success">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-6 h-6 text-success" />
            <h2 className="text-xl font-heading font-bold text-success">{t.newReward}</h2>
          </div>
          <p className="text-sm text-success/90">{t.newRewardDesc}</p>
          <Button onClick={() => setHasNewReward(false)} variant="outline" className="mt-4 border-success text-success hover:bg-success/10">
            {language === 'en' ? 'Dismiss' : 'Cerrar'}
          </Button>
        </motion.section>
      )}

      {/* Share Section */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl gradient-primary text-primary-foreground">
        <div className="flex items-center gap-3 mb-3">
          <UserPlus className="w-6 h-6" />
          <h2 className="text-xl font-heading font-bold">{t.shareTitle}</h2>
        </div>
        <p className="text-sm opacity-90 mb-4">{t.shareDesc}</p>
        <div className="p-3 rounded-xl bg-background/20 mb-4">
          <p className="text-sm font-mono truncate">{referralLink}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleCopyLink} variant="secondary" className="flex-1"><Copy className="w-4 h-4 mr-2" />{t.copyLink}</Button>
          <Button onClick={handleShare} variant="secondary" className="flex-1"><Share2 className="w-4 h-4 mr-2" />{t.share}</Button>
        </div>
      </motion.section>

      {/* Progress */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl border-2 border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <Crown className="w-6 h-6 text-accent" />
          <h2 className="text-xl font-heading font-bold">{t.progressTitle}</h2>
        </div>
        {referralStats.paidSignups > 0 && referralStats.paidSignups % 2 === 0 ? (
          <div className="p-4 rounded-xl bg-success/10 border border-success/30 text-center">
            <p className="text-lg font-semibold text-success">{t.rewardUnlocked}</p>
          </div>
        ) : (
          <>
            <div className="h-4 rounded-full bg-secondary overflow-hidden mb-3">
              <motion.div className="h-full gradient-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.8 }} />
            </div>
            <p className="text-sm text-muted-foreground text-center"><span className="font-bold text-primary">{referralsToNextReward}</span> {t.progressDesc}</p>
          </>
        )}
      </motion.section>

      {/* How It Works */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="p-6 rounded-2xl border-2 border-border bg-card">
        <h2 className="text-xl font-heading font-bold mb-4">{t.howItWorks}</h2>
        <div className="space-y-4">
          {[t.step1, t.step2].map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">{i + 1}</span>
              </div>
              <p className="text-sm">{step}</p>
            </div>
          ))}
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Gift className="w-4 h-4 text-accent" />
            </div>
            <p className="text-sm font-medium">{t.step3}</p>
          </div>
        </div>
      </motion.section>

      {/* Stats */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-3 gap-4">
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

      {/* Badges */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="p-6 rounded-2xl border-2 border-border bg-card">
        <div className="flex items-center gap-3 mb-2">
          <Award className="w-6 h-6 text-accent" />
          <h2 className="text-xl font-heading font-bold">{t.badges}</h2>
        </div>
        <Button onClick={() => navigate('/badges')} variant="outline" className="w-full mt-4">{t.viewBadges}</Button>
      </motion.section>
    </>
  );
};
