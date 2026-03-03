import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Heart, Check, ArrowLeft } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { saveDailyCheckin, saveUserProfile } from '@/lib/storage';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface BadDayFlowProps {
  profile: UserProfile;
  onComplete: () => void;
  onCancel: () => void;
}

export const BadDayFlow = ({ profile, onComplete, onCancel }: BadDayFlowProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [step, setStep] = useState<'support' | 'mini-checkin' | 'done'>('support');
  const [didSomething, setDidSomething] = useState<boolean | null>(null);

  const texts = {
    en: {
      title: "You're doing enough 💚",
      body1: "Some days are just hard. That's okay. That's human.",
      body2: "Today, you don't need to:",
      noNeed: ["Hit your goals", "Be productive", "Do anything 'right'"],
      body3: "Today, all you need to do is:",
      justDo: ["Take one breath at a time", "Be gentle with yourself", "Know that tomorrow is a new day"],
      body4: "You're still on your journey. This doesn't erase your progress.",
      tinyCheckin: 'I can do a tiny check-in',
      justSupport: 'I just need support',
      cancel: 'Back',
      miniQuestion: 'Did you do even one small thing for yourself today?',
      miniExamples: 'Drank water, took 3 deep breaths, said one kind thing to yourself',
      yes: 'Yes',
      no: 'No',
      yesResponse: "That's enough. You're doing enough. 💚",
      noResponse: "That's okay too. You survived today. That counts.",
      done: 'Done for Today',
    },
    es: {
      title: 'Estás haciendo suficiente 💚',
      body1: 'Algunos días son simplemente difíciles. Está bien. Eso es ser humano.',
      body2: 'Hoy, no necesitas:',
      noNeed: ['Cumplir tus metas', 'Ser productiva', "Hacer nada 'bien'"],
      body3: 'Hoy, todo lo que necesitas es:',
      justDo: ['Respirar un momento a la vez', 'Ser gentil contigo misma', 'Saber que mañana es un nuevo día'],
      body4: 'Sigues en tu camino. Esto no borra tu progreso.',
      tinyCheckin: 'Puedo hacer un mini registro',
      justSupport: 'Solo necesito apoyo',
      cancel: 'Volver',
      miniQuestion: '¿Hiciste aunque sea una cosita por ti hoy?',
      miniExamples: 'Tomaste agua, respiraste profundo 3 veces, te dijiste algo amable',
      yes: 'Sí',
      no: 'No',
      yesResponse: 'Eso es suficiente. Estás haciendo suficiente. 💚',
      noResponse: 'Eso también está bien. Sobreviviste hoy. Eso cuenta.',
      done: 'Listo por Hoy',
    },
  };

  const t = texts[language];

  const handleJustSupport = async () => {
    await logBadDay(false);
    setDidSomething(false);
    setStep('done');
  };

  const handleMiniResponse = async (response: boolean) => {
    setDidSomething(response);
    await logBadDay(true);
    setStep('done');
  };

  const logBadDay = async (checkinCompleted: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate streak continuation
    let newStreak = profile.currentStreak;
    if (profile.lastCheckinDate) {
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      const yesterday = new Date(todayDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastCheckin = new Date(profile.lastCheckinDate + 'T00:00:00');
      
      if (lastCheckin.getTime() === yesterday.getTime()) {
        newStreak = profile.currentStreak + 1;
      } else if (lastCheckin.getTime() < yesterday.getTime()) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    // Save check-in (bad day counts as check-in, protects streak)
    saveDailyCheckin({
      date: today,
      checkinCompleted: true,
      activityCompleted: false,
      nutritionResponses: [],
      pointsEarned: 5, // Small points for showing up
    });

    const updatedProfile: UserProfile = {
      ...profile,
      totalPoints: profile.totalPoints + 5,
      currentStreak: newStreak,
      longestStreak: Math.max(profile.longestStreak, newStreak),
      totalCheckins: profile.totalCheckins + 1,
      lastCheckinDate: today,
      badDaysCount: profile.badDaysCount + 1,
    };
    saveUserProfile(updatedProfile);

    if (user) {
      await supabase.from('profiles').update({
        total_points: updatedProfile.totalPoints,
        current_streak: updatedProfile.currentStreak,
        longest_streak: updatedProfile.longestStreak,
        total_checkins: updatedProfile.totalCheckins,
        last_checkin_date: today,
        bad_days_count: updatedProfile.badDaysCount,
      }).eq('id', user.id);

      await supabase.from('daily_checkins').upsert({
        user_id: user.id,
        date: today,
        checkin_completed: true,
        activity_completed: false,
        nutrition_responses: [],
        points_earned: 5,
        is_bad_day: true,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col">
      <AnimatePresence mode="wait">
        {step === 'support' && (
          <motion.div
            key="support"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col px-6 py-12"
          >
            <button
              onClick={onCancel}
              className="flex items-center gap-2 text-muted-foreground mb-8 min-h-[44px] min-w-[44px]"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t.cancel}</span>
            </button>

            <div className="flex-1 flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.6 }}
                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8"
              >
                <Heart className="w-10 h-10 text-primary" />
              </motion.div>

              <h1 className="text-2xl font-heading font-bold text-center mb-6">{t.title}</h1>
              <p className="text-muted-foreground text-center mb-6">{t.body1}</p>

              <div className="w-full max-w-sm mb-6">
                <p className="text-sm font-medium mb-2">{t.body2}</p>
                <ul className="space-y-1 mb-4">
                  {t.noNeed.map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="text-muted-foreground/50">✕</span> {item}
                    </li>
                  ))}
                </ul>

                <p className="text-sm font-medium mb-2">{t.body3}</p>
                <ul className="space-y-1 mb-4">
                  {t.justDo.map((item, i) => (
                    <li key={i} className="text-sm text-foreground flex items-center gap-2">
                      <span className="text-primary">✓</span> {item}
                    </li>
                  ))}
                </ul>

                <p className="text-sm text-muted-foreground italic text-center">{t.body4}</p>
              </div>

              <div className="w-full max-w-sm space-y-3 mt-4">
                <Button
                  size="lg"
                  onClick={() => setStep('mini-checkin')}
                  className="w-full py-6 text-base font-semibold"
                >
                  {t.tinyCheckin}
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleJustSupport}
                  className="w-full py-6 text-base font-semibold"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  {t.justSupport}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'mini-checkin' && (
          <motion.div
            key="mini"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col items-center justify-center px-6 py-12"
          >
            <h1 className="text-2xl font-heading font-bold text-center mb-4">{t.miniQuestion}</h1>
            <p className="text-sm text-muted-foreground text-center mb-8 max-w-sm">{t.miniExamples}</p>
            
            <div className="flex gap-4 w-full max-w-sm">
              <Button
                size="lg"
                onClick={() => handleMiniResponse(true)}
                className="flex-1 py-8 text-lg font-semibold rounded-xl bg-success hover:bg-success/90"
              >
                <Check className="w-6 h-6 mr-2" />
                {t.yes}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => handleMiniResponse(false)}
                className="flex-1 py-8 text-lg font-semibold rounded-xl"
              >
                {t.no}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8"
            >
              <Heart className="w-10 h-10 text-primary" />
            </motion.div>

            <h1 className="text-2xl font-heading font-bold mb-4">
              {didSomething ? t.yesResponse : t.noResponse}
            </h1>

            <Button
              size="lg"
              onClick={onComplete}
              className="px-12 py-6 text-lg font-semibold mt-8"
            >
              {t.done}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
