import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Sun, Moon } from 'lucide-react';

interface NotificationScreenProps {
  morningTime: string;
  eveningTime: string;
  middayEnabled: boolean;
  onMorningChange: (value: string) => void;
  onEveningChange: (value: string) => void;
  onMiddayToggle: (value: boolean) => void;
  onNext: () => void;
}

export const NotificationScreen = ({
  morningTime,
  eveningTime,
  middayEnabled,
  onMorningChange,
  onEveningChange,
  onMiddayToggle,
  onNext,
}: NotificationScreenProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-heading font-bold mb-2 text-center"
      >
        When should we check in with you?
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-muted-foreground text-center max-w-sm mt-2"
      >
        A quick reminder helps build the habit. You can change this anytime.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md mt-8 space-y-4"
      >
        {/* Morning reminder */}
        <div className="p-4 rounded-xl border-2 border-border bg-card">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full gradient-coral flex items-center justify-center">
              <Sun className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <Label className="font-medium">Morning reminder</Label>
              <p className="text-sm text-muted-foreground">Start your day with motivation</p>
            </div>
            <input
              type="time"
              value={morningTime}
              onChange={(e) => onMorningChange(e.target.value)}
              className="bg-secondary px-3 py-2 rounded-lg text-sm font-medium"
            />
          </div>
        </div>

        {/* Evening check-in */}
        <div className="p-4 rounded-xl border-2 border-border bg-card">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <Moon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <Label className="font-medium">Evening check-in</Label>
              <p className="text-sm text-muted-foreground">Log your daily progress</p>
            </div>
            <input
              type="time"
              value={eveningTime}
              onChange={(e) => onEveningChange(e.target.value)}
              className="bg-secondary px-3 py-2 rounded-lg text-sm font-medium"
            />
          </div>
        </div>

        {/* Midday nudge */}
        <div className="p-4 rounded-xl border-2 border-border bg-card">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <Bell className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <Label className="font-medium">Midday nutrition nudge</Label>
              <p className="text-sm text-muted-foreground">Quick lunchtime reminder</p>
            </div>
            <Switch
              checked={middayEnabled}
              onCheckedChange={onMiddayToggle}
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12"
      >
        <Button size="lg" onClick={onNext} className="px-12 py-6 text-lg font-semibold">
          Continue
        </Button>
      </motion.div>
    </div>
  );
};
