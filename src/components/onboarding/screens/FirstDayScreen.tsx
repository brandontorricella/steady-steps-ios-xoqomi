import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { UserProfile, getActivityGoalFromCommitment } from '@/lib/types';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface FirstDayScreenProps {
  profile: UserProfile;
  onComplete: () => void;
}

export const FirstDayScreen = ({ profile, onComplete }: FirstDayScreenProps) => {
  const { t, language } = useLanguage();
  const activityMinutes = getActivityGoalFromCommitment(profile.dailyTimeCommitment);

  const title = language === 'es' ? 'Tu primer paso comienza ahora' : 'Your first step starts now';
  const buttonText = language === 'es' ? 'Entendido' : 'Got It';

  const description = language === 'es' 
    ? <>Hoy, tu único objetivo es completar <span className="font-bold text-foreground">{activityMinutes} minutos</span> de movimiento suave. Esto puede ser caminar, estirar, o cualquier movimiento que te resulte cómodo.</>
    : <>Today, your only goal is to complete <span className="font-bold text-foreground">{activityMinutes} minutes</span> of gentle movement. This can be walking, stretching, or any movement that feels comfortable.</>;

  const note = language === 'es' 
    ? 'Esta noche, te haremos algunas preguntas simples sobre tu día. Eso es todo.'
    : 'Tonight, we will ask you a few simple questions about your day. That is it.';

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="w-20 h-20 rounded-full gradient-coral flex items-center justify-center shadow-glow mb-8"
      >
        <Sparkles className="w-10 h-10 text-accent-foreground" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-heading font-bold mb-4"
      >
        {title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-lg text-muted-foreground max-w-sm leading-relaxed"
      >
        {description}
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground max-w-sm mt-6 leading-relaxed"
      >
        {note}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12"
      >
        <Button size="lg" onClick={onComplete} className="px-12 py-6 text-lg font-semibold">
          {buttonText}
        </Button>
      </motion.div>
    </div>
  );
};