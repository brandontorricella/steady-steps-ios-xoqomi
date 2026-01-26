import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { Language } from '@/lib/i18n';

interface LanguageScreenProps {
  onNext: () => void;
}

export const LanguageScreen = ({ onNext }: LanguageScreenProps) => {
  const { setLanguage } = useLanguage();

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    onNext();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-heading font-bold mb-2 text-center"
      >
        Choose Your Language
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-lg text-muted-foreground text-center mb-12"
      >
        Elige Tu Idioma
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm space-y-4"
      >
        <button
          onClick={() => handleSelect('en')}
          className="w-full p-6 rounded-2xl border-2 border-border bg-card hover:border-primary transition-all flex items-center gap-4"
        >
          <span className="text-3xl">🇺🇸</span>
          <span className="text-xl font-semibold">English</span>
        </button>

        <button
          onClick={() => handleSelect('es')}
          className="w-full p-6 rounded-2xl border-2 border-border bg-card hover:border-primary transition-all flex items-center gap-4"
        >
          <span className="text-3xl">🇲🇽</span>
          <span className="text-xl font-semibold">Español</span>
        </button>
      </motion.div>
    </div>
  );
};
