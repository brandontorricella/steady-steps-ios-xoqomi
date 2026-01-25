import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getUserProfile, saveUserProfile, clearAllData } from '@/lib/storage';
import { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Trash2, AlertTriangle, CreditCard, LogOut } from 'lucide-react';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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
  const [profile, setProfile] = useState<UserProfile | null>(null);

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

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (error) {
      toast.error('Unable to open subscription management');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 bg-card border-b border-border">
        <h1 className="text-3xl font-heading font-bold">Settings</h1>
      </header>

      <main className="px-6 space-y-6">
        {/* Profile */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl border-2 border-border bg-card"
        >
          <h2 className="font-heading font-semibold mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <p className="font-medium">{profile.firstName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Current Activity Goal</Label>
              <p className="font-medium">{profile.currentActivityGoalMinutes} minutes daily</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Stage</Label>
              <p className="font-medium capitalize">{profile.currentStage}</p>
            </div>
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
            Reminders
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Morning reminder</Label>
                <p className="text-sm text-muted-foreground">Daily motivation</p>
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
                <Label>Evening check-in</Label>
                <p className="text-sm text-muted-foreground">Log your day</p>
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
                <Label>Midday nutrition nudge</Label>
                <p className="text-sm text-muted-foreground">Quick lunchtime reminder</p>
              </div>
              <Switch
                checked={profile.middayNudgeEnabled}
                onCheckedChange={(checked) => updateProfile({ middayNudgeEnabled: checked })}
              />
            </div>
          </div>
        </motion.section>

        {/* Data */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl border-2 border-destructive/30 bg-card"
        >
          <h2 className="font-heading font-semibold mb-4 flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h2>
          
          <p className="text-sm text-muted-foreground mb-4">
            Reset all your progress and start fresh. This action cannot be undone.
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Reset All Progress
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your progress, badges, and settings. 
                  You will need to complete onboarding again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Yes, reset everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.section>
      </main>
    </div>
  );
};
