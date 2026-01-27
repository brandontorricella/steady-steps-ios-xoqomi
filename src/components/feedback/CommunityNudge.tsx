import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface CommunityNudgeProps {
  habitType: 'activity' | 'nutrition' | 'checkin';
  isVisible: boolean;
}

const nudgeMessages = {
  en: {
    activity: [
      'Many other users completed their movement today!',
      'You are not alone—hundreds moved today!',
      'Join others who hit their activity goal!',
    ],
    nutrition: [
      'Other users made healthy swaps today!',
      'You are part of a community making better choices!',
      'Many chose water over soda today!',
    ],
    checkin: [
      'Thousands checked in today—join them!',
      'You are part of a supportive community!',
      'Others are on their journey too!',
    ],
  },
  es: {
    activity: [
      '¡Muchas usuarias completaron su movimiento hoy!',
      '¡No estás sola—cientos se movieron hoy!',
      '¡Únete a otras que lograron su meta de actividad!',
    ],
    nutrition: [
      '¡Otras usuarias hicieron cambios saludables hoy!',
      '¡Eres parte de una comunidad que toma mejores decisiones!',
      '¡Muchas eligieron agua en vez de refresco hoy!',
    ],
    checkin: [
      '¡Miles se registraron hoy—únete a ellas!',
      '¡Eres parte de una comunidad solidaria!',
      '¡Otras también están en su camino!',
    ],
  },
};

export const CommunityNudge = ({ habitType, isVisible }: CommunityNudgeProps) => {
  const { language } = useLanguage();
  
  if (!isVisible) return null;

  const messages = nudgeMessages[language][habitType];
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-accent/30 border border-accent/50"
    >
      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
        <Users className="w-4 h-4 text-accent-foreground" />
      </div>
      <p className="text-xs text-muted-foreground">{randomMessage}</p>
    </motion.div>
  );
};
