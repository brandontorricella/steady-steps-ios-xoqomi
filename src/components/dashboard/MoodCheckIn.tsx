import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mood, getMoodEmoji, getMoodMessage } from '@/lib/types';

interface MoodCheckInProps {
  selectedMood: Mood | null;
  onMoodSelect: (mood: Mood) => void;
  onSkip: () => void;
}

const moods: { value: Mood; label: string }[] = [
  { value: 'great', label: 'Great' },
  { value: 'good', label: 'Good' },
  { value: 'okay', label: 'Okay' },
  { value: 'stressed', label: 'Stressed' },
  { value: 'tired', label: 'Tired' },
];

export const MoodCheckIn = ({ selectedMood, onMoodSelect, onSkip }: MoodCheckInProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col items-center justify-center px-6 py-12"
    >
      <h1 className="text-2xl font-heading font-bold mb-2 text-center">
        How are you feeling today?
      </h1>
      <p className="text-muted-foreground text-center mb-8">
        This is just for you. No wrong answers.
      </p>

      <div className="flex gap-3 mb-8">
        {moods.map((mood) => (
          <motion.button
            key={mood.value}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onMoodSelect(mood.value)}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
              selectedMood === mood.value
                ? 'bg-primary/10 border-2 border-primary scale-110'
                : 'bg-card border-2 border-border hover:border-primary/30'
            }`}
          >
            <span className="text-3xl">{getMoodEmoji(mood.value)}</span>
            <span className="text-xs font-medium">{mood.label}</span>
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
            {getMoodMessage(selectedMood)}
          </p>
        </motion.div>
      )}

      <button
        onClick={onSkip}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Skip for today
      </button>
    </motion.div>
  );
};
