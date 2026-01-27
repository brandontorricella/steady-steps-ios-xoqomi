import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, saveUserProfile, clearAllData } from '@/lib/storage';
import { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Bell, Trash2, AlertTriangle, Download, Shield, CreditCard, XCircle } from 'lucide-react';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showDeleteFlow, setShowDeleteFlow] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    setProfile(getUserProfile());
  }, []);

  if (!profile) return null;

  const updateProfile = (updates: Partial<UserProfile>) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    saveUserProfile(updated);
  };

  const handleReset = () => {
    clearAllData();
    window.location.reload();
  };

  const confirmWord = language === 'es' ? 'ELIMINAR' : 'DELETE';
  const isConfirmValid = deleteConfirmText.toUpperCase() === confirmWord;

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      } else if (data?.supportEmail) {
        toast.info(language === 'en' 
          ? `Please contact support at ${data.supportEmail} to manage your subscription.`
          : `Por favor contacta a soporte en ${data.supportEmail} para gestionar tu suscripción.`
        );
      } else {
        toast.error(language === 'en' ? 'Unable to open subscription portal' : 'No se pudo abrir el portal de suscripción');
      }
    } catch (error) {
      toast.error(language === 'en' 
        ? 'Please contact support@steadystepsapp.com to cancel your subscription'
        : 'Por favor contacta a support@steadystepsapp.com para cancelar tu suscripción'
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!isConfirmValid) return;
    
    setIsDeleting(true);
    try {
      // Call the delete-account edge function to wipe all data
      const { data, error } = await supabase.functions.invoke('delete-account');
      
      if (error) {
        console.error('Delete account error:', error);
        throw error;
      }
      
      // Clear local data
      clearAllData();
      
      setDeleteStep(4);
    } catch (error) {
      console.error('Delete account failed:', error);
      toast.error(t('common.error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteComplete = () => {
    window.location.href = '/';
  };

  const texts = {
    en: {
      subscription: 'Subscription',
      manageSubscription: 'Manage Subscription',
      manageSubscriptionDesc: 'Update payment method or change plan',
      cancelSubscription: 'Cancel Subscription',
      cancelSubscriptionDesc: 'Cancel your SteadySteps subscription',
      privacy: 'Privacy',
      downloadData: 'Download My Data',
      downloadDataDesc: 'Get a copy of your SteadySteps data',
      deleteAccountDesc: 'Permanently delete your account and all data',
      dangerZone: 'Danger Zone',
      resetDesc: 'Reset all your progress and start fresh. This action cannot be undone.',
      resetButton: 'Reset All Progress',
      resetConfirmTitle: 'Are you absolutely sure?',
      resetConfirmDesc: 'This will permanently delete all your progress, badges, and settings. You will need to complete onboarding again.',
      resetConfirmButton: 'Yes, reset everything',
    },
    es: {
      subscription: 'Suscripción',
      manageSubscription: 'Gestionar Suscripción',
      manageSubscriptionDesc: 'Actualizar método de pago o cambiar plan',
      cancelSubscription: 'Cancelar Suscripción',
      cancelSubscriptionDesc: 'Cancela tu suscripción de SteadySteps',
      privacy: 'Privacidad',
      downloadData: 'Descargar Mis Datos',
      downloadDataDesc: 'Obtén una copia de tus datos de SteadySteps',
      deleteAccountDesc: 'Eliminar permanentemente tu cuenta y todos tus datos',
      dangerZone: 'Zona de Peligro',
      resetDesc: 'Reinicia todo tu progreso y comienza de nuevo. Esta acción no se puede deshacer.',
      resetButton: 'Reiniciar Todo el Progreso',
      resetConfirmTitle: '¿Estás completamente segura?',
      resetConfirmDesc: 'Esto eliminará permanentemente todo tu progreso, insignias y configuración. Tendrás que completar el onboarding de nuevo.',
      resetConfirmButton: 'Sí, reiniciar todo',
    },
  };

  const localT = texts[language];

  // Delete Account Flow
  if (showDeleteFlow) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="px-6 pt-8 pb-4 bg-card border-b border-border">
          <button 
            onClick={() => { setShowDeleteFlow(false); setDeleteStep(1); setDeleteConfirmText(''); }}
            className="flex items-center gap-2 text-muted-foreground mb-4 min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('common.back')}</span>
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          {deleteStep === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-sm text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-heading font-bold mb-4">{t('deleteAccount.title')}</h1>
              <p className="text-muted-foreground mb-6">{t('deleteAccount.warning')}</p>
              <ul className="text-left space-y-2 mb-8">
                {[
                  t('deleteAccount.consequence1'),
                  t('deleteAccount.consequence2'),
                  t('deleteAccount.consequence3'),
                  t('deleteAccount.consequence4'),
                ].map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-destructive">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={() => setShowDeleteFlow(false)} className="w-full mb-3">
                {t('deleteAccount.keepAccount')}
              </Button>
              <button 
                onClick={() => setDeleteStep(2)} 
                className="text-destructive text-sm hover:underline"
              >
                {t('deleteAccount.continueDelete')}
              </button>
            </motion.div>
          )}

          {deleteStep === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-sm text-center">
              <h1 className="text-2xl font-heading font-bold mb-4">{t('deleteAccount.confirmTitle')}</h1>
              <p className="text-muted-foreground mb-6">{t('deleteAccount.confirmDesc')}</p>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={t('deleteAccount.typePlaceholder')}
                className="mb-6 text-center"
              />
              <div className="space-y-3">
                <Button onClick={() => setShowDeleteFlow(false)} className="w-full">
                  {t('common.cancel')}
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  disabled={!isConfirmValid || isDeleting}
                  className="w-full"
                >
                  {isDeleting ? t('common.loading') : t('deleteAccount.deleteButton')}
                </Button>
              </div>
            </motion.div>
          )}

          {deleteStep === 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-sm text-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-success" />
              </div>
              <h1 className="text-2xl font-heading font-bold mb-4">{t('deleteAccount.complete')}</h1>
              <p className="text-muted-foreground mb-8">{t('deleteAccount.completeDesc')}</p>
              <Button onClick={handleDeleteComplete} className="w-full">
                {t('common.done')}
              </Button>
            </motion.div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with Back Button */}
      <header className="px-6 pt-8 pb-4 bg-card border-b border-border">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground mb-4 min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('common.back')}</span>
        </button>
        <h1 className="text-3xl font-heading font-bold">{t('settings.settingsMenu')}</h1>
      </header>

      <main className="px-6 py-6 space-y-6">
        {/* Profile */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl border-2 border-border bg-card"
        >
          <h2 className="font-heading font-semibold mb-4">{t('settings.editProfile')}</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">{language === 'en' ? 'Name' : 'Nombre'}</Label>
              <p className="font-medium">{profile.firstName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{language === 'en' ? 'Current Activity Goal' : 'Meta de Actividad Actual'}</Label>
              <p className="font-medium">{profile.currentActivityGoalMinutes} {language === 'en' ? 'minutes daily' : 'minutos diarios'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('dashboard.stage')}</Label>
              <p className="font-medium capitalize">{profile.currentStage}</p>
            </div>
          </div>
        </motion.section>

        {/* Subscription */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-6 rounded-2xl border-2 border-border bg-card"
        >
          <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {localT.subscription}
          </h2>
          
          <div className="space-y-2">
            <button 
              onClick={() => navigate('/subscription')}
              className="w-full p-4 rounded-xl border border-border bg-background flex items-center gap-4 hover:border-primary/50 transition-colors"
            >
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <div className="text-left flex-1">
                <p className="font-medium">{localT.manageSubscription}</p>
                <p className="text-sm text-muted-foreground">{localT.manageSubscriptionDesc}</p>
              </div>
            </button>
            
            <button 
              onClick={handleCancelSubscription}
              disabled={isCancelling}
              className="w-full p-4 rounded-xl border border-destructive/30 bg-background flex items-center gap-4 hover:border-destructive/50 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-5 h-5 text-destructive" />
              <div className="text-left flex-1">
                <p className="font-medium text-destructive">{localT.cancelSubscription}</p>
                <p className="text-sm text-muted-foreground">{localT.cancelSubscriptionDesc}</p>
              </div>
            </button>
          </div>
        </motion.section>

        {/* Notifications */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl border-2 border-border bg-card"
        >
          <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {t('settings.notifications')}
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{t('notifications.morning')}</Label>
                <p className="text-sm text-muted-foreground">{t('notifications.morningDesc')}</p>
              </div>
              <input
                type="time"
                value={profile.morningReminderTime}
                onChange={(e) => updateProfile({ morningReminderTime: e.target.value })}
                className="bg-secondary px-3 py-2 rounded-lg text-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>{t('notifications.evening')}</Label>
                <p className="text-sm text-muted-foreground">{t('notifications.eveningDesc')}</p>
              </div>
              <input
                type="time"
                value={profile.eveningReminderTime}
                onChange={(e) => updateProfile({ eveningReminderTime: e.target.value })}
                className="bg-secondary px-3 py-2 rounded-lg text-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>{t('notifications.midday')}</Label>
                <p className="text-sm text-muted-foreground">{t('notifications.middayDesc')}</p>
              </div>
              <Switch
                checked={profile.middayNudgeEnabled}
                onCheckedChange={(checked) => updateProfile({ middayNudgeEnabled: checked })}
              />
            </div>
          </div>
        </motion.section>

        {/* Privacy */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-6 rounded-2xl border-2 border-border bg-card"
        >
          <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {localT.privacy}
          </h2>
          
          <div className="space-y-2">
            <button className="w-full p-4 rounded-xl border border-border bg-background flex items-center gap-4 hover:border-primary/50 transition-colors">
              <Download className="w-5 h-5 text-muted-foreground" />
              <div className="text-left flex-1">
                <p className="font-medium">{localT.downloadData}</p>
                <p className="text-sm text-muted-foreground">{localT.downloadDataDesc}</p>
              </div>
            </button>
            
            <button 
              onClick={() => setShowDeleteFlow(true)}
              className="w-full p-4 rounded-xl border border-destructive/30 bg-background flex items-center gap-4 hover:border-destructive/50 transition-colors"
            >
              <Trash2 className="w-5 h-5 text-destructive" />
              <div className="text-left flex-1">
                <p className="font-medium text-destructive">{t('deleteAccount.title').replace('?', '')}</p>
                <p className="text-sm text-muted-foreground">{localT.deleteAccountDesc}</p>
              </div>
            </button>
          </div>
        </motion.section>

        {/* Danger Zone (Reset) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl border-2 border-destructive/30 bg-card"
        >
          <h2 className="font-heading font-semibold mb-4 flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            {localT.dangerZone}
          </h2>
          
          <p className="text-sm text-muted-foreground mb-4">
            {localT.resetDesc}
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                {localT.resetButton}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{localT.resetConfirmTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                  {localT.resetConfirmDesc}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {localT.resetConfirmButton}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.section>
      </main>

      <BottomNavigation />
    </div>
  );
};
