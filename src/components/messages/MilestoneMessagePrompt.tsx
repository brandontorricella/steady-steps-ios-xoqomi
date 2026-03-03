import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ComposeMessageModal } from './ComposeMessageModal';
import { MessageDeliveryModal } from './MessageDeliveryModal';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { getUserProfile } from '@/lib/storage';

const MILESTONE_DAYS = [7, 14, 30, 60, 90];

interface FutureMessage {
  id: string;
  content: string;
  currentDayWhenCreated: number;
  deliveryDay: number;
  createdAt: string;
}

export const MilestoneMessagePrompt = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [deliveredMessage, setDeliveredMessage] = useState<FutureMessage | null>(null);

  const profile = getUserProfile();
  const currentDay = profile?.totalCheckins || 0;

  useEffect(() => {
    if (!user || !currentDay) return;

    const checkMessages = async () => {
      // Check for messages to deliver
      const { data: toDeliver } = await supabase
        .from('future_messages')
        .select('*')
        .eq('user_id', user.id)
        .eq('delivered', false)
        .lte('delivery_day', currentDay)
        .order('delivery_day', { ascending: true })
        .limit(1);

      if (toDeliver && toDeliver.length > 0) {
        const msg = toDeliver[0];
        // Mark as delivered
        await supabase
          .from('future_messages')
          .update({ delivered: true, delivered_at: new Date().toISOString() })
          .eq('id', msg.id);

        setDeliveredMessage({
          id: msg.id,
          content: msg.content,
          currentDayWhenCreated: msg.current_day_when_created,
          deliveryDay: msg.delivery_day,
          createdAt: msg.created_at,
        });
        return;
      }

      // Check if we're at a milestone and should prompt writing
      if (MILESTONE_DAYS.includes(currentDay)) {
        const dismissKey = `steadysteps_milestone_prompt_${currentDay}`;
        if (!localStorage.getItem(dismissKey)) {
          setShowPrompt(true);
        }
      }
    };

    checkMessages();
  }, [user, currentDay]);

  const dismissPrompt = () => {
    const dismissKey = `steadysteps_milestone_prompt_${currentDay}`;
    localStorage.setItem(dismissKey, 'true');
    setShowPrompt(false);
  };

  const handleSend = async (content: string, deliveryDay: number) => {
    if (!user) return;
    await supabase
      .from('future_messages')
      .insert({
        user_id: user.id,
        content,
        delivery_day: deliveryDay,
        current_day_when_created: currentDay,
      });
  };

  const texts = {
    en: {
      milestoneTitle: `Day ${currentDay} — Nice milestone! 🎉`,
      milestoneBody: 'Want to send a message to Future You?',
      writeMessage: 'Write a Message',
      notNow: 'Not now',
    },
    es: {
      milestoneTitle: `Día ${currentDay} — ¡Buen hito! 🎉`,
      milestoneBody: '¿Quieres enviar un mensaje a tu Yo del Futuro?',
      writeMessage: 'Escribir un Mensaje',
      notNow: 'Ahora no',
    },
  };

  const t = texts[language];

  return (
    <>
      {/* Milestone Prompt Banner */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-primary/5 border border-primary/20"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{t.milestoneTitle}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.milestoneBody}</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => { dismissPrompt(); setShowCompose(true); }}>
                    {t.writeMessage}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={dismissPrompt}>
                    {t.notNow}
                  </Button>
                </div>
              </div>
              <button onClick={dismissPrompt} className="p-1 rounded-full hover:bg-secondary">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compose Modal */}
      <ComposeMessageModal
        isOpen={showCompose}
        onClose={() => setShowCompose(false)}
        onSend={handleSend}
        currentDay={currentDay}
      />

      {/* Delivery Modal */}
      <MessageDeliveryModal
        isOpen={!!deliveredMessage}
        message={deliveredMessage}
        onClose={() => setDeliveredMessage(null)}
        onWriteBack={() => {
          setDeliveredMessage(null);
          setShowCompose(true);
        }}
      />
    </>
  );
};
