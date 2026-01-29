import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/hooks/useLanguage';

interface ConfidenceScreenProps {
  value: number;
  onChange: (value: number) => void;
  onNext: () => void;
}

export const ConfidenceScreen = ({ value, onChange, onNext }: ConfidenceScreenProps) => {
  const { language } = useLanguage();

  const texts = {
    en: {
      title: "How confident do you feel about fitness and nutrition?",
      subtitle: "Be honest — there's no wrong answer",
      labels: ['Not at all', 'A little', 'Somewhat', 'Fairly', 'Very confident'],
      description: [
        "That's okay! We'll start with the basics and guide you every step.",
        "A good starting point. We'll help build your knowledge gently.",
        "Nice! You have some foundation to build on.",
        "Great! We'll help you fine-tune your habits.",
        "Awesome! We'll focus on consistency and optimization."
      ],
    },
    es: {
      title: "¿Qué tan segura te sientes sobre fitness y nutrición?",
      subtitle: "Sé honesta — no hay respuesta incorrecta",
      labels: ['Nada', 'Un poco', 'Algo', 'Bastante', 'Muy segura'],
      description: [
        "¡Está bien! Empezaremos con lo básico y te guiaremos en cada paso.",
        "Un buen punto de partida. Te ayudaremos a construir conocimiento.",
        "¡Bien! Tienes una base sobre la cual construir.",
        "¡Genial! Te ayudaremos a perfeccionar tus hábitos.",
        "¡Excelente! Nos enfocaremos en consistencia y optimización."
      ],
    },
  };

  const t = texts[language];

  const getEmoji = (level: number) => {
    const emojis = ['😰', '🤔', '😊', '💪', '🌟'];
    return emojis[level - 1] || '😊';
  };

  return (
    <div className="flex-1 flex flex-col px-6 py-12 max-w-md mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl font-heading font-bold mb-3">{t.title}</h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 flex flex-col items-center justify-center"
      >
        {/* Emoji indicator */}
        <motion.div
          key={value}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-7xl mb-8"
        >
          {getEmoji(value)}
        </motion.div>

        {/* Current label */}
        <motion.p
          key={`label-${value}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-semibold text-primary mb-2"
        >
          {t.labels[value - 1]}
        </motion.p>

        {/* Description */}
        <motion.p
          key={`desc-${value}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground text-center mb-12 px-4"
        >
          {t.description[value - 1]}
        </motion.p>

        {/* Slider */}
        <div className="w-full max-w-xs px-4">
          <Slider
            value={[value]}
            onValueChange={(vals) => onChange(vals[0])}
            min={1}
            max={5}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button 
          size="lg" 
          onClick={onNext}
          className="w-full py-6 text-lg font-semibold"
        >
          {language === 'en' ? 'Continue' : 'Continuar'}
        </Button>
      </motion.div>
    </div>
  );
};
