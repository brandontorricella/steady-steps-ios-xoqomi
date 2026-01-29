import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Utensils, Leaf, Wheat, Globe } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export type DietPreference = 'no_preference' | 'vegetarian' | 'low_carb' | 'traditional';

interface DietPreferenceScreenProps {
  value: DietPreference;
  onChange: (value: DietPreference) => void;
  onNext: () => void;
}

export const DietPreferenceScreen = ({ value, onChange, onNext }: DietPreferenceScreenProps) => {
  const { language } = useLanguage();

  const texts = {
    en: {
      title: "Any diet preferences?",
      subtitle: "We'll tailor nutrition tips to your eating style",
      noPreference: "No specific preference",
      vegetarian: "Vegetarian / Plant-based",
      lowCarb: "Low carb",
      traditional: "Culturally traditional foods",
    },
    es: {
      title: "¿Tienes preferencias alimentarias?",
      subtitle: "Adaptaremos los consejos de nutrición a tu estilo",
      noPreference: "Sin preferencia específica",
      vegetarian: "Vegetariana / Basada en plantas",
      lowCarb: "Baja en carbohidratos",
      traditional: "Comidas culturalmente tradicionales",
    },
  };

  const t = texts[language];

  const options: { id: DietPreference; label: string; icon: typeof Utensils }[] = [
    { id: 'no_preference', label: t.noPreference, icon: Utensils },
    { id: 'vegetarian', label: t.vegetarian, icon: Leaf },
    { id: 'low_carb', label: t.lowCarb, icon: Wheat },
    { id: 'traditional', label: t.traditional, icon: Globe },
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
        transition={{ delay: 0.4 }}
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
