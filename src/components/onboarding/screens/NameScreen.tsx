import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/useLanguage';

interface NameScreenProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}

export const NameScreen = ({ value, onChange, onNext }: NameScreenProps) => {
  const { t } = useLanguage();
  const canContinue = value.trim().length >= 2;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-heading font-bold mb-4 text-center"
      >
        {t('name.title')}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-sm mt-8"
      >
        <Input
          type="text"
          placeholder={t('name.placeholder')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-center text-xl h-14 border-2 focus:border-primary"
          autoFocus
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-12"
      >
        <Button 
          size="lg" 
          onClick={onNext} 
          disabled={!canContinue}
          className="px-12 py-6 text-lg font-semibold"
        >
          {t('common.continue')}
        </Button>
      </motion.div>
    </div>
  );
};
