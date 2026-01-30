import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, Loader2, Heart, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BuddyConnection {
  id: string;
  buddy_id: string;
  status: string;
  buddy_profile?: {
    first_name: string | null;
    current_streak: number | null;
  };
}

export const AccountabilityMatching = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [isOptedIn, setIsOptedIn] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [buddyConnection, setBuddyConnection] = useState<BuddyConnection | null>(null);
  const [loading, setLoading] = useState(true);

  const texts = {
    en: {
      title: 'Accountability Partner',
      description: 'Get matched with another user for low-pressure encouragement. Completely anonymous and private.',
      optIn: 'Match me with a partner',
      optedIn: 'Looking for a match...',
      findPartner: 'Find My Partner',
      matching: 'Matching...',
      matched: "You're matched!",
      matchedDesc: 'Your partner is on their wellness journey too. Send encouragement!',
      partnerStreak: 'Partner streak',
      days: 'days',
      sendEncouragement: 'Send Encouragement',
      encouragementSent: 'Encouragement sent!',
      noMatchYet: 'No match yet. We\'ll find someone soon!',
      privacyNote: '1-to-1 anonymous pairing. Your identity stays private.',
    },
    es: {
      title: 'Compañera de Responsabilidad',
      description: 'Conéctate con otra usuaria para apoyo mutuo sin presión. Completamente anónimo y privado.',
      optIn: 'Conéctame con una compañera',
      optedIn: 'Buscando una conexión...',
      findPartner: 'Encontrar Mi Compañera',
      matching: 'Conectando...',
      matched: '¡Tienes una compañera!',
      matchedDesc: 'Tu compañera también está en su camino de bienestar. ¡Envíale ánimos!',
      partnerStreak: 'Racha de compañera',
      days: 'días',
      sendEncouragement: 'Enviar Ánimo',
      encouragementSent: '¡Ánimo enviado!',
      noMatchYet: 'Aún no hay conexión. ¡Encontraremos a alguien pronto!',
      privacyNote: 'Emparejamiento anónimo 1 a 1. Tu identidad permanece privada.',
    },
  };

  const t = texts[language];

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Check if opted in
        const { data: profile } = await supabase
          .from('profiles')
          .select('buddy_match_opt_in')
          .eq('id', user.id)
          .single();

        if (profile) {
          setIsOptedIn(profile.buddy_match_opt_in || false);
        }

        // Check for existing buddy connection
        const { data: connections } = await supabase
          .from('buddy_connections')
          .select('*')
          .or(`user_id.eq.${user.id},buddy_id.eq.${user.id}`)
          .eq('status', 'active');

        if (connections && connections.length > 0) {
          const connection = connections[0];
          const buddyId = connection.user_id === user.id ? connection.buddy_id : connection.user_id;
          
          // Get buddy profile
          const { data: buddyProfile } = await supabase
            .from('profiles')
            .select('first_name, current_streak')
            .eq('id', buddyId)
            .single();

          setBuddyConnection({
            ...connection,
            buddy_profile: buddyProfile || undefined,
          });
        }
      } catch (error) {
        console.error('Error fetching buddy status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [user]);

  const handleOptInChange = async (checked: boolean) => {
    if (!user) return;

    setIsOptedIn(checked);
    
    await supabase
      .from('profiles')
      .update({ buddy_match_opt_in: checked })
      .eq('id', user.id);

    if (!checked) {
      // Remove any existing connections
      await supabase
        .from('buddy_connections')
        .delete()
        .or(`user_id.eq.${user.id},buddy_id.eq.${user.id}`);
      setBuddyConnection(null);
    }
  };

  const handleFindPartner = async () => {
    if (!user || !isOptedIn) return;

    setIsMatching(true);

    try {
      // Find another user who is opted in and not already matched
      const { data: potentialBuddies } = await supabase
        .from('profiles')
        .select('id')
        .eq('buddy_match_opt_in', true)
        .neq('id', user.id)
        .limit(10);

      if (!potentialBuddies || potentialBuddies.length === 0) {
        toast.info(t.noMatchYet);
        setIsMatching(false);
        return;
      }

      // Filter out users who already have a buddy
      const { data: existingConnections } = await supabase
        .from('buddy_connections')
        .select('user_id, buddy_id')
        .eq('status', 'active');

      const connectedUserIds = new Set<string>();
      existingConnections?.forEach(c => {
        connectedUserIds.add(c.user_id);
        connectedUserIds.add(c.buddy_id);
      });

      const availableBuddies = potentialBuddies.filter(b => !connectedUserIds.has(b.id));

      if (availableBuddies.length === 0) {
        toast.info(t.noMatchYet);
        setIsMatching(false);
        return;
      }

      // Pick a random available buddy
      const randomBuddy = availableBuddies[Math.floor(Math.random() * availableBuddies.length)];

      // Create the connection
      const { data: newConnection, error } = await supabase
        .from('buddy_connections')
        .insert({
          user_id: user.id,
          buddy_id: randomBuddy.id,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      // Get buddy profile
      const { data: buddyProfile } = await supabase
        .from('profiles')
        .select('first_name, current_streak')
        .eq('id', randomBuddy.id)
        .single();

      setBuddyConnection({
        ...newConnection,
        buddy_profile: buddyProfile || undefined,
      });

      toast.success(t.matched);
    } catch (error) {
      console.error('Error finding partner:', error);
      toast.error(language === 'en' ? 'Failed to find a partner. Try again.' : 'No se pudo encontrar una compañera. Intenta de nuevo.');
    } finally {
      setIsMatching(false);
    }
  };

  const handleSendEncouragement = () => {
    toast.success(t.encouragementSent);
  };

  if (loading) {
    return (
      <div className="p-6 rounded-2xl border-2 border-border bg-card animate-pulse">
        <div className="h-6 bg-secondary rounded w-1/2 mb-4" />
        <div className="h-16 bg-secondary rounded" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl border-2 border-border bg-card"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-heading font-semibold">{t.title}</h3>
      </div>

      {!buddyConnection ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">{t.description}</p>
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 mb-4">
            <span className="text-sm font-medium">{t.optIn}</span>
            <Switch
              checked={isOptedIn}
              onCheckedChange={handleOptInChange}
            />
          </div>

          {isOptedIn && (
            <Button
              onClick={handleFindPartner}
              disabled={isMatching}
              className="w-full"
            >
              {isMatching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.matching}
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t.findPartner}
                </>
              )}
            </Button>
          )}

          <p className="text-xs text-muted-foreground text-center mt-4">{t.privacyNote}</p>
        </>
      ) : (
        <>
          <div className="p-4 rounded-xl bg-success/10 border border-success/30 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="font-semibold text-success">{t.matched}</span>
            </div>
            <p className="text-sm text-muted-foreground">{t.matchedDesc}</p>
          </div>

          <div className="p-3 rounded-xl bg-secondary mb-4">
            <p className="text-sm">
              <span className="text-muted-foreground">{t.partnerStreak}:</span>{' '}
              <span className="font-semibold">{buddyConnection.buddy_profile?.current_streak || 0} {t.days}</span>
            </p>
          </div>

          <Button onClick={handleSendEncouragement} variant="outline" className="w-full">
            <Heart className="w-4 h-4 mr-2" />
            {t.sendEncouragement}
          </Button>
        </>
      )}
    </motion.div>
  );
};
