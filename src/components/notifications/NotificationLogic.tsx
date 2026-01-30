import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';

interface NotificationMessage {
  id: string;
  type: 'missed_days' | 'high_stress' | 'consistency' | 'low_sleep' | 'encouragement';
  message: string;
  tone: 'gentle' | 'supportive' | 'celebratory';
}

const notificationMessages = {
  en: {
    missed_days: [
      "It's okay. Today counts.",
      "Every day is a fresh start. Welcome back.",
      "Life happens. Let's focus on today.",
      "No pressure. Just one small step today.",
    ],
    high_stress: [
      "Take it easy today. Small steps are enough.",
      "Be extra gentle with yourself today.",
      "High stress? Rest counts as progress too.",
      "You don't have to be perfect. Just present.",
    ],
    consistency: [
      "You've been showing up. That's what matters.",
      "Your consistency is building real habits.",
      "Small steps, steady progress. You're doing it.",
      "Every check-in is a win. Keep going.",
    ],
    low_sleep: [
      "Rest is part of the journey.",
      "Tired? Listen to your body today.",
      "Energy low? That's okay. Do what you can.",
    ],
    encouragement: [
      "You're not behind. You're exactly where you need to be.",
      "Progress isn't always visible. Trust the process.",
      "Every small step counts. You're doing great.",
    ],
  },
  es: {
    missed_days: [
      "Está bien. Hoy cuenta.",
      "Cada día es un nuevo comienzo. Bienvenida de vuelta.",
      "La vida pasa. Enfoquémonos en hoy.",
      "Sin presión. Solo un pequeño paso hoy.",
    ],
    high_stress: [
      "Tómatelo con calma hoy. Pequeños pasos son suficientes.",
      "Sé extra gentil contigo hoy.",
      "¿Mucho estrés? El descanso también cuenta como progreso.",
      "No tienes que ser perfecta. Solo estar presente.",
    ],
    consistency: [
      "Has estado presente. Eso es lo que importa.",
      "Tu consistencia está construyendo hábitos reales.",
      "Pequeños pasos, progreso constante. Lo estás logrando.",
      "Cada registro es una victoria. Sigue adelante.",
    ],
    low_sleep: [
      "El descanso es parte del viaje.",
      "¿Cansada? Escucha a tu cuerpo hoy.",
      "¿Energía baja? Está bien. Haz lo que puedas.",
    ],
    encouragement: [
      "No estás atrasada. Estás exactamente donde necesitas estar.",
      "El progreso no siempre es visible. Confía en el proceso.",
      "Cada pequeño paso cuenta. Lo estás haciendo genial.",
    ],
  },
};

export const useNotificationLogic = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [notification, setNotification] = useState<NotificationMessage | null>(null);

  useEffect(() => {
    const determineNotification = async () => {
      if (!user) return;

      // Get recent check-ins and profile data
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [{ data: checkins }, { data: profile }] = await Promise.all([
        supabase
          .from('daily_checkins')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', sevenDaysAgo.toISOString().split('T')[0])
          .order('date', { ascending: false }),
        supabase
          .from('profiles')
          .select('last_checkin_date, current_streak')
          .eq('id', user.id)
          .single(),
      ]);

      const messages = notificationMessages[language];

      // Check for missed days (no check-in yesterday or today)
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const recentDates = checkins?.map(c => c.date) || [];
      
      if (!recentDates.includes(today) && !recentDates.includes(yesterday)) {
        const randomMsg = messages.missed_days[Math.floor(Math.random() * messages.missed_days.length)];
        setNotification({
          id: 'missed_days',
          type: 'missed_days',
          message: randomMsg,
          tone: 'gentle',
        });
        return;
      }

      // Check for high stress (avg stress > 3 in last 3 days)
      const recentStress = checkins
        ?.slice(0, 3)
        .filter(c => c.stress_level)
        .map(c => c.stress_level as number);
      
      if (recentStress && recentStress.length >= 2) {
        const avgStress = recentStress.reduce((a, b) => a + b, 0) / recentStress.length;
        if (avgStress > 3.5) {
          const randomMsg = messages.high_stress[Math.floor(Math.random() * messages.high_stress.length)];
          setNotification({
            id: 'high_stress',
            type: 'high_stress',
            message: randomMsg,
            tone: 'supportive',
          });
          return;
        }
      }

      // Check for low sleep (avg sleep < 2.5 in last 3 days)
      const recentSleep = checkins
        ?.slice(0, 3)
        .filter(c => c.sleep_quality)
        .map(c => c.sleep_quality as number);
      
      if (recentSleep && recentSleep.length >= 2) {
        const avgSleep = recentSleep.reduce((a, b) => a + b, 0) / recentSleep.length;
        if (avgSleep < 2.5) {
          const randomMsg = messages.low_sleep[Math.floor(Math.random() * messages.low_sleep.length)];
          setNotification({
            id: 'low_sleep',
            type: 'low_sleep',
            message: randomMsg,
            tone: 'supportive',
          });
          return;
        }
      }

      // Check for consistency (5+ check-ins in last 7 days)
      if (checkins && checkins.length >= 5) {
        const randomMsg = messages.consistency[Math.floor(Math.random() * messages.consistency.length)];
        setNotification({
          id: 'consistency',
          type: 'consistency',
          message: randomMsg,
          tone: 'celebratory',
        });
        return;
      }

      // Default encouraging message
      const randomMsg = messages.encouragement[Math.floor(Math.random() * messages.encouragement.length)];
      setNotification({
        id: 'encouragement',
        type: 'encouragement',
        message: randomMsg,
        tone: 'gentle',
      });
    };

    determineNotification();
  }, [user, language]);

  return { notification };
};

export type { NotificationMessage };
