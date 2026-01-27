import { motion } from 'framer-motion';
import { Mood, getMoodEmoji, getMoodMessage } from '@/lib/types';
import { useLanguage } from '@/hooks/useLanguage';

interface MoodCheckInProps {
  selectedMood: Mood | null;
  onMoodSelect: (mood: Mood) => void;
  onSkip: () => void;
}

const moodLabels = {
  en: {
    great: 'Great',
    good: 'Good',
    okay: 'Okay',
    stressed: 'Stressed',
    tired: 'Tired',
  },
  es: {
    great: 'Muy bien',
    good: 'Bien',
    okay: 'Regular',
    stressed: 'Estresada',
    tired: 'Cansada',
  },
};

const moodMessages = {
  en: {
    great: 'Wonderful! Keep that energy going.',
    good: 'Nice! Steady progress feels good.',
    okay: 'That is perfectly fine. You are still here.',
    stressed: 'I see you. Taking care of yourself matters even more today.',
    tired: 'Rest is part of the journey. Be gentle with yourself.',
  },
  es: {
    great: '¡Maravilloso! Mantén esa energía.',
    good: '¡Bien! El progreso constante se siente bien.',
    okay: 'Está perfectamente bien. Todavía estás aquí.',
    stressed: 'Te veo. Cuidarte a ti misma importa aún más hoy.',
    tired: 'El descanso es parte del camino. Sé gentil contigo misma.',
  },
};

const moods: Mood[] = ['great', 'good', 'okay', 'stressed', 'tired'];

export const MoodCheckIn = ({ selectedMood, onMoodSelect, onSkip }: MoodCheckInProps) => {
  const { language } = useLanguage();

  const texts = {
    en: {
      title: 'How are you feeling today?',
      subtitle: 'This is just for you. No wrong answers.',
      skip: 'Skip for today',
    },
    es: {
      title: '¿Cómo te sientes hoy?',
      subtitle: 'Esto es solo para ti. Sin respuestas incorrectas.',
      skip: 'Saltar por hoy',
    },
  };

  const t = texts[language];
  const labels = moodLabels[language];
  const messages = moodMessages[language];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col items-center justify-center px-6 py-12"
    >
      <h1 className="text-2xl font-heading font-bold mb-2 text-center">
        {t.title}
      </h1>
      <p className="text-muted-foreground text-center mb-8">
        {t.subtitle}
      </p>

      <div className="flex gap-3 mb-8">
        {moods.map((mood) => (
          <motion.button
            key={mood}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onMoodSelect(mood)}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
              selectedMood === mood
                ? 'bg-primary/10 border-2 border-primary scale-110'
                : 'bg-card border-2 border-border hover:border-primary/30'
            }`}
          >
            <span className="text-3xl">{getMoodEmoji(mood)}</span>
            <span className="text-xs font-medium">{labels[mood]}</span>
          </motion.button>
        ))}
      </div>

      {selectedMood && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-accent text-center max-w-sm mb-8"
        >
          <p className="text-accent-foreground font-medium">
            {messages[selectedMood]}
          </p>
        </motion.div>
      )}

      <button
        onClick={onSkip}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {t.skip}
      </button>
    </motion.div>
  );
};
