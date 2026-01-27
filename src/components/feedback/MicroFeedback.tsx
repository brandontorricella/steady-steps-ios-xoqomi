import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';

interface MicroFeedbackProps {
  type: 'activity' | 'nutrition' | 'streak' | 'checkin' | 'badge' | 'general';
  isVisible: boolean;
  onDismiss?: () => void;
}

const feedbackMessages = {
  en: {
    activity: [
      'Small win today! 🌟',
      'Every step counts!',
      'You showed up for yourself!',
      'Movement is medicine!',
      'Your body thanks you!',
    ],
    nutrition: [
      'Healthy choice made! 🥗',
      'One swap at a time!',
      'Progress, not perfection!',
      'Nourishing your body!',
      'Small choices, big impact!',
    ],
    streak: [
      'Streak on fire! 🔥',
      'Consistency is key!',
      'You are building momentum!',
      'Day by day, stronger!',
      'Unstoppable!',
    ],
    checkin: [
      'Great job checking in!',
      'You are showing up!',
      'Another day, another step!',
      'Proud of you!',
      'Keep going!',
    ],
    badge: [
      'Achievement unlocked! 🏆',
      'You earned this!',
      'Celebrate this win!',
      'Badge collected!',
      'Milestone reached!',
    ],
    general: [
      'You are doing great!',
      'Keep it up!',
      'One day at a time!',
      'Progress is progress!',
      'You got this!',
    ],
  },
  es: {
    activity: [
      '¡Pequeña victoria hoy! 🌟',
      '¡Cada paso cuenta!',
      '¡Te presentaste por ti misma!',
      '¡El movimiento es medicina!',
      '¡Tu cuerpo te lo agradece!',
    ],
    nutrition: [
      '¡Elección saludable! 🥗',
      '¡Un cambio a la vez!',
      '¡Progreso, no perfección!',
      '¡Nutriendo tu cuerpo!',
      '¡Pequeñas elecciones, gran impacto!',
    ],
    streak: [
      '¡Racha en llamas! 🔥',
      '¡La consistencia es clave!',
      '¡Estás ganando impulso!',
      '¡Día a día, más fuerte!',
      '¡Imparable!',
    ],
    checkin: [
      '¡Excelente registro!',
      '¡Estás presente!',
      '¡Otro día, otro paso!',
      '¡Orgullosa de ti!',
      '¡Sigue adelante!',
    ],
    badge: [
      '¡Logro desbloqueado! 🏆',
      '¡Te lo ganaste!',
      '¡Celebra esta victoria!',
      '¡Insignia coleccionada!',
      '¡Meta alcanzada!',
    ],
    general: [
      '¡Lo estás haciendo genial!',
      '¡Sigue así!',
      '¡Un día a la vez!',
      '¡El progreso es progreso!',
      '¡Tú puedes!',
    ],
  },
};

export const MicroFeedback = ({ type, isVisible, onDismiss }: MicroFeedbackProps) => {
  const { language } = useLanguage();
  const messages = feedbackMessages[language][type];
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          transition={{ type: 'spring', duration: 0.5 }}
          onClick={onDismiss}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-40 px-6 py-3 rounded-full bg-card border-2 border-primary/30 shadow-glow cursor-pointer"
        >
          <p className="text-sm font-medium text-center">{randomMessage}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast-style micro feedback for inline use
export const InlineFeedback = ({ message, isVisible }: { message: string; isVisible: boolean }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="overflow-hidden"
      >
        <div className="p-3 rounded-xl bg-success/10 border border-success/30 text-center mb-4">
          <p className="text-success text-sm font-medium">{message}</p>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);
