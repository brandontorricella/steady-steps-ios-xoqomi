import { ArrowLeft, FileText, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';

export const LegalPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-8 pb-4 bg-card border-b border-border">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span>{t('common.back')}</span>
        </button>
        <h1 className="text-3xl font-heading font-bold">{t('legal.title')}</h1>
      </header>

      <main className="px-6 py-6 space-y-4">
        <button className="w-full p-4 rounded-xl border-2 border-border bg-card flex items-center gap-4 hover:border-primary/50 transition-colors">
          <FileText className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium">{t('legal.terms')}</span>
        </button>
        <button className="w-full p-4 rounded-xl border-2 border-border bg-card flex items-center gap-4 hover:border-primary/50 transition-colors">
          <Shield className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium">{t('legal.privacy')}</span>
        </button>
      </main>
      <BottomNavigation />
    </div>
  );
};
