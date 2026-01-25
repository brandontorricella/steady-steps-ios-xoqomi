import { motion } from 'framer-motion';
import { Heart, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '@/lib/storage';

export const CoachTipCard = () => {
  const navigate = useNavigate();
  const profile = getUserProfile();

  const coachTips = [
    'Drinking water before meals can help you feel fuller. Try it today!',
    'A short walk after dinner aids digestion and boosts your mood.',
    'Remember, consistency matters more than perfection.',
    'Try adding one extra vegetable to your lunch today.',
    'Taking the stairs is a great way to add movement to your day.',
  ];

  // Rotate tips based on day
  const tipIndex = new Date().getDate() % coachTips.length;
  const tip = coachTips[tipIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl gradient-coral"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-accent-foreground/20 flex items-center justify-center flex-shrink-0">
          <Heart className="w-5 h-5 text-accent-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-semibold text-accent-foreground mb-1">
            Coach Lily says
          </h3>
          <p className="text-sm text-foreground mb-3">
            {tip}
          </p>
          <button
            onClick={() => navigate('/coach')}
            className="flex items-center gap-2 text-sm font-medium text-accent-foreground hover:underline"
          >
            <MessageCircle className="w-4 h-4" />
            Ask Coach More
          </button>
        </div>
      </div>
    </motion.div>
  );
};
