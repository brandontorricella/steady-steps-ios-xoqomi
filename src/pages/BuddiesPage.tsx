import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Send, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/useLanguage';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Buddy {
  id: string;
  name: string;
  streak: number;
  checkedInToday: boolean;
}

export const BuddiesPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [buddies] = useState<Buddy[]>([]); // Would come from database
  const [showInvite, setShowInvite] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [selectedBuddy, setSelectedBuddy] = useState<Buddy | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');

  const encouragementOptions = t('buddies.encouragementOptions') as unknown as string[];

  const handleSendInvite = () => {
    if (!inviteEmail) return;
    toast.success('Invite sent!');
    setInviteEmail('');
    setShowInvite(false);
  };

  const handleSendEncouragement = (message: string) => {
    toast.success('Encouragement sent!');
    setShowEncouragement(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-8 pb-4 bg-card border-b border-border">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span>{t('common.back')}</span>
        </button>
        <h1 className="text-3xl font-heading font-bold">{t('buddies.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('buddies.subtitle')}</p>
      </header>

      <main className="px-6 py-6">
        {buddies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center mb-6">
              <Users className="w-12 h-12 text-accent-foreground" />
            </div>
            <p className="text-muted-foreground text-center mb-6">{t('buddies.empty')}</p>
            <Button onClick={() => setShowInvite(true)}>
              {t('buddies.inviteFriend')}
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {buddies.map((buddy, index) => (
              <motion.div
                key={buddy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl border-2 border-border bg-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${buddy.checkedInToday ? 'bg-success' : 'bg-muted'}`} />
                    <div>
                      <p className="font-medium">{buddy.name}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Flame className="w-4 h-4 text-primary" />
                        <span>{buddy.streak} {t('dashboard.days')}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedBuddy(buddy);
                      setShowEncouragement(true);
                    }}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    {t('buddies.sendEncouragement')}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Fixed Invite Button */}
      {buddies.length > 0 && (
        <div className="fixed bottom-24 left-0 right-0 px-6">
          <Button className="w-full" onClick={() => setShowInvite(true)}>
            {t('buddies.inviteFriend')}
          </Button>
        </div>
      )}

      {/* Invite Modal */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('buddies.inviteFriend')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="friend@email.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <Button className="w-full" onClick={handleSendInvite} disabled={!inviteEmail}>
              Send Invite
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Encouragement Modal */}
      <Dialog open={showEncouragement} onOpenChange={setShowEncouragement}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('buddies.sendEncouragement')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {Array.isArray(encouragementOptions) && encouragementOptions.map((message, index) => (
              <button
                key={index}
                onClick={() => handleSendEncouragement(message)}
                className="w-full p-3 rounded-xl border border-border bg-card hover:border-primary/50 text-left transition-colors"
              >
                {message}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  );
};
