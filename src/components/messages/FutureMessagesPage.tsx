import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Plus, Clock, CheckCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { ComposeMessageModal } from './ComposeMessageModal';
import { MessageDeliveryModal } from './MessageDeliveryModal';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { getUserProfile } from '@/lib/storage';
import { toast } from 'sonner';

interface FutureMessage {
  id: string;
  content: string;
  currentDayWhenCreated: number;
  deliveryDay: number;
  delivered: boolean;
  deliveredAt: string | null;
  createdAt: string;
}

export const FutureMessagesPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState<FutureMessage[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<FutureMessage | null>(null);
  const [loading, setLoading] = useState(true);

  const profile = getUserProfile();
  const currentDay = profile?.totalCheckins || 0;

  useEffect(() => {
    if (user) fetchMessages();
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('future_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('delivery_day', { ascending: true });

    if (!error && data) {
      setMessages(data.map(m => ({
        id: m.id,
        content: m.content,
        currentDayWhenCreated: m.current_day_when_created,
        deliveryDay: m.delivery_day,
        delivered: m.delivered,
        deliveredAt: m.delivered_at,
        createdAt: m.created_at,
      })));
    }
    setLoading(false);
  };

  const handleSend = async (content: string, deliveryDay: number) => {
    if (!user) return;
    const { error } = await supabase
      .from('future_messages')
      .insert({
        user_id: user.id,
        content,
        delivery_day: deliveryDay,
        current_day_when_created: currentDay,
      });

    if (!error) {
      toast.success(language === 'en' ? 'Message sent to Future You! 💌' : '¡Mensaje enviado a Tu Yo del Futuro! 💌');
      fetchMessages();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('future_messages').delete().eq('id', id);
    if (!error) {
      setMessages(prev => prev.filter(m => m.id !== id));
      toast.success(language === 'en' ? 'Message deleted' : 'Mensaje eliminado');
    }
  };

  const scheduledMessages = messages.filter(m => !m.delivered);
  const deliveredMessages = messages.filter(m => m.delivered);

  const texts = {
    en: {
      title: 'My Messages',
      scheduled: 'Scheduled',
      delivered: 'Delivered',
      empty: 'No messages yet. Write one to your future self!',
      compose: 'Write to Future Me',
      deliverOn: 'Delivers on Day',
      writtenOnDay: 'Written on Day',
    },
    es: {
      title: 'Mis Mensajes',
      scheduled: 'Programados',
      delivered: 'Entregados',
      empty: 'No hay mensajes aún. ¡Escríbele a tu yo del futuro!',
      compose: 'Escribir a Mi Yo del Futuro',
      deliverOn: 'Se entrega el Día',
      writtenOnDay: 'Escrito el Día',
    },
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-8 pb-4 bg-card border-b border-border">
        <button onClick={() => navigate('/settings')} className="flex items-center gap-2 text-muted-foreground mb-4 min-h-[44px]">
          <ArrowLeft className="w-5 h-5" />
          <span>{language === 'en' ? 'Back' : 'Volver'}</span>
        </button>
        <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
          <Mail className="w-6 h-6 text-primary" />
          {t.title}
        </h1>
      </header>

      <main className="px-6 py-6 space-y-6">
        <Button onClick={() => setShowCompose(true)} className="w-full" size="lg">
          <Plus className="w-5 h-5 mr-2" />
          {t.compose}
        </Button>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">...</div>
        ) : messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground">{t.empty}</p>
          </motion.div>
        ) : (
          <>
            {/* Scheduled */}
            {scheduledMessages.length > 0 && (
              <div>
                <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {t.scheduled}
                </h3>
                <div className="space-y-3">
                  {scheduledMessages.map((msg, i) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-2xl border border-border bg-card"
                    >
                      <p className="text-sm line-clamp-2">{msg.content}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground">
                          {t.deliverOn} {msg.deliveryDay}
                        </span>
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivered */}
            {deliveredMessages.length > 0 && (
              <div>
                <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  {t.delivered}
                </h3>
                <div className="space-y-3">
                  {deliveredMessages.map((msg, i) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedMessage(msg)}
                      className="p-4 rounded-2xl border border-success/20 bg-success/5 cursor-pointer hover:border-success/40 transition-colors"
                    >
                      <p className="text-sm line-clamp-2">{msg.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {t.writtenOnDay} {msg.currentDayWhenCreated}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <BottomNavigation />

      <ComposeMessageModal
        isOpen={showCompose}
        onClose={() => setShowCompose(false)}
        onSend={handleSend}
        currentDay={currentDay}
      />

      <MessageDeliveryModal
        isOpen={!!selectedMessage}
        message={selectedMessage}
        onClose={() => setSelectedMessage(null)}
        onWriteBack={() => {
          setSelectedMessage(null);
          setShowCompose(true);
        }}
      />
    </div>
  );
};
