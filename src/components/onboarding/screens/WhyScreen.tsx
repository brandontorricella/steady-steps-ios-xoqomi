import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface WhyScreenProps {
  value: string | null;
  onChange: (value: string) => void;
  onNext: () => void;
}

export const WhyScreen = ({ value, onChange, onNext }: WhyScreenProps) => {
  const { language } = useLanguage();
  const [text, setText] = useState(value || '');

  const texts = {
    en: {
      title: 'One Last Thing...',
      question: 'Why are you building these habits?',
      subtitle: "This will be your anchor when motivation is low. Make it personal.",
      placeholder: "I want to have energy to play with my kids... I want to feel like myself again... I want to show my daughter what self-care looks like...",
      save: 'Save My Why',
      skip: 'Skip for now',
      charCount: 'characters',
    },
    es: {
      title: 'Una Última Cosa...',
      question: '¿Por qué estás construyendo estos hábitos?',
      subtitle: 'Este será tu ancla cuando la motivación sea baja. Hazlo personal.',
      placeholder: 'Quiero tener energía para jugar con mis hijos... Quiero volver a sentirme yo misma... Quiero mostrarle a mi hija lo que es el autocuidado...',
      save: 'Guardar Mi Por Qué',
      skip: 'Saltar por ahora',
      charCount: 'caracteres',
    },
  };

  const t = texts[language];

  const handleSave = () => {
    if (text.trim()) {
      onChange(text.trim());
    }
    onNext();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6"
      >
        <Heart className="w-8 h-8 text-primary" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-heading font-bold text-center mb-2"
      >
        {t.title}
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-xl font-heading font-semibold text-center mb-2"
      >
        {t.question}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-muted-foreground text-center mb-8 max-w-sm"
      >
        {t.subtitle}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-sm"
      >
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 200))}
          placeholder={t.placeholder}
          className="min-h-[140px] text-base resize-none rounded-xl border-2 border-border focus:border-primary"
          maxLength={200}
        />
        <p className="text-xs text-muted-foreground text-right mt-1">
          {text.length}/200 {t.charCount}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-sm mt-8 space-y-3"
      >
        <Button
          size="lg"
          onClick={handleSave}
          className="w-full py-6 text-lg font-semibold"
        >
          {text.trim() ? t.save : t.skip}
        </Button>
        {text.trim() && (
          <button
            onClick={onNext}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            {t.skip}
          </button>
        )}
      </motion.div>
    </div>
  );
};
