import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Clock, Battery, Zap, Brain, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export type BiggestObstacle = 'time' | 'motivation' | 'energy' | 'stress' | 'confusion';

interface ObstacleScreenProps {
  value: BiggestObstacle;
  onChange: (value: BiggestObstacle) => void;
  onNext: () => void;
}

export const ObstacleScreen = ({ value, onChange, onNext }: ObstacleScreenProps) => {
  const { language } = useLanguage();

  const texts = {
    en: {
      title: "What's your biggest obstacle?",
      subtitle: "Understanding your challenges helps us support you better",
      time: "I don't have enough time",
      motivation: "I struggle with motivation",
      energy: "I'm always tired",
      stress: "Stress gets in my way",
      confusion: "I don't know where to start",
    },
    es: {
      title: "¿Cuál es tu mayor obstáculo?",
      subtitle: "Entender tus desafíos nos ayuda a apoyarte mejor",
      time: "No tengo suficiente tiempo",
      motivation: "Me cuesta motivarme",
      energy: "Siempre estoy cansada",
      stress: "El estrés me impide avanzar",
      confusion: "No sé por dónde empezar",
    },
  };

  const t = texts[language];

  const options: { id: BiggestObstacle; label: string; icon: typeof Clock }[] = [
    { id: 'time', label: t.time, icon: Clock },
    { id: 'motivation', label: t.motivation, icon: Battery },
    { id: 'energy', label: t.energy, icon: Zap },
    { id: 'stress', label: t.stress, icon: Brain },
    { id: 'confusion', label: t.confusion, icon: HelpCircle },
  ];

  return (
    <div className="flex-1 flex flex-col px-6 py-12 max-w-md mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-heading font-bold mb-3">{t.title}</h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </motion.div>

      <div className="space-y-3 flex-1">
        {options.map((option, index) => {
          const Icon = option.icon;
          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onChange(option.id)}
              className={`w-full p-4 rounded-2xl text-left transition-all flex items-center gap-4 ${
                value === option.id
                  ? 'gradient-primary text-primary-foreground shadow-glow'
                  : 'border-2 border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                value === option.id ? 'bg-primary-foreground/20' : 'bg-secondary'
              }`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="font-medium">{option.label}</span>
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button 
          size="lg" 
          onClick={onNext}
          className="w-full py-6 text-lg font-semibold mt-8"
        >
          {language === 'en' ? 'Continue' : 'Continuar'}
        </Button>
      </motion.div>
    </div>
  );
};
