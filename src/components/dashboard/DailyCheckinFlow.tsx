import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { UserProfile, getNutritionQuestion, SECONDARY_NUTRITION_QUESTIONS, Mood } from '@/lib/types';
import { saveDailyCheckin, saveUserProfile, calculatePoints, earnBadge } from '@/lib/storage';
import { Check, X, Sparkles, PartyPopper } from 'lucide-react';
import { Confetti } from '@/components/ui/confetti';
import { MicroFeedback, InlineFeedback } from '@/components/feedback/MicroFeedback';
import { CommunityNudge } from '@/components/feedback/CommunityNudge';
import { MoodCheckIn } from './MoodCheckIn';
import { useLanguage } from '@/hooks/useLanguage';

interface DailyCheckinFlowProps {
  profile: UserProfile;
  onComplete: () => void;
}

export const DailyCheckinFlow = ({ profile, onComplete }: DailyCheckinFlowProps) => {
  const [step, setStep] = useState<'activity' | 'nutrition' | 'mood' | 'summary'>('activity');
  const [activityCompleted, setActivityCompleted] = useState<boolean | null>(null);
  const [nutritionResponses, setNutritionResponses] = useState<(boolean | null)[]>(
    Array(profile.nutritionQuestionsCount).fill(null)
  );
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [showActivityFeedback, setShowActivityFeedback] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { language } = useLanguage();

  const nutritionQuestions = [
    getNutritionQuestion(profile.primaryNutritionChallenge),
    ...SECONDARY_NUTRITION_QUESTIONS.slice(0, profile.nutritionQuestionsCount - 1)
  ];

  const handleActivityResponse = (completed: boolean) => {
    setActivityCompleted(completed);
    if (completed) {
      setShowActivityFeedback(true);
      setTimeout(() => setShowActivityFeedback(false), 2000);
    }
    setStep('nutrition');
  };

  const handleNutritionResponse = (index: number, response: boolean) => {
    const newResponses = [...nutritionResponses];
    newResponses[index] = response;
    setNutritionResponses(newResponses);
  };

  const handleMoodSelected = (mood: Mood) => {
    setSelectedMood(mood);
    handleSubmit(mood);
  };

  const handleSkipMood = () => {
    handleSubmit(null);
  };

  const handleSubmit = (mood: Mood | null) => {
    const today = new Date().toISOString().split('T')[0];
    const newStreak = profile.currentStreak + 1;
    const points = calculatePoints(activityCompleted || false, nutritionResponses, newStreak);
    
    // Check for perfect day
    const allNutritionYes = nutritionResponses.every(r => r === true);
    const isPerfectDay = activityCompleted && allNutritionYes;
    
    // Save check-in
    saveDailyCheckin({
      date: today,
      checkinCompleted: true,
      activityCompleted: activityCompleted || false,
      nutritionResponses,
      mood: mood as any,
      pointsEarned: points,
    });

    // Update profile
    const updatedProfile: UserProfile = {
      ...profile,
      totalPoints: profile.totalPoints + points,
      currentStreak: newStreak,
      longestStreak: Math.max(profile.longestStreak, newStreak),
      totalCheckins: profile.totalCheckins + 1,
      totalActivityCompletions: profile.totalActivityCompletions + (activityCompleted ? 1 : 0),
      totalNutritionHabitsCompleted: profile.totalNutritionHabitsCompleted + nutritionResponses.filter(r => r === true).length,
      totalPerfectDays: profile.totalPerfectDays + (isPerfectDay ? 1 : 0),
      lastCheckinDate: today,
    };
    saveUserProfile(updatedProfile);

    // Check for badges
    const badges: string[] = [];
    if (profile.totalCheckins === 0) {
      earnBadge('first_checkin');
      badges.push(language === 'en' ? 'First Check-In' : 'Primer Registro');
    }
    if (activityCompleted && profile.totalActivityCompletions === 0) {
      earnBadge('first_activity');
      badges.push(language === 'en' ? 'First Steps' : 'Primeros Pasos');
    }
    if (nutritionResponses.some(r => r === true) && profile.totalNutritionHabitsCompleted === 0) {
      earnBadge('mindful_start');
      badges.push(language === 'en' ? 'Mindful Start' : 'Inicio Consciente');
    }
    if (newStreak === 7) {
      earnBadge('one_week');
      badges.push(language === 'en' ? 'One Week Wonder' : 'Maravilla de Una Semana');
    }
    if (isPerfectDay && profile.totalPerfectDays === 0) {
      earnBadge('perfect_start');
      badges.push(language === 'en' ? 'Perfect Start' : 'Comienzo Perfecto');
    }
    if (mood) {
      earnBadge('mood_starter');
    }

    setEarnedPoints(points);
    setNewBadges(badges);
    
    // Show confetti for milestones
    if (badges.length > 0 || isPerfectDay || newStreak % 7 === 0) {
      setShowConfetti(true);
    }
    
    setStep('summary');
  };

  const allNutritionAnswered = nutritionResponses.every(r => r !== null);

  const texts = {
    en: {
      activityTitle: 'Did you complete your movement goal today?',
      activityGoal: 'minutes of walking, stretching, or gentle movement',
      yesDidIt: 'Yes, I Did It!',
      skippedToday: 'I Skipped Today',
      nutritionTitle: 'Quick nutrition check',
      nutritionSubtitle: 'Just answer honestly. No judgment here.',
      noGuilt: 'No guilt. Tomorrow is a fresh start.',
      greatJob: 'Great job completing your activity!',
      submit: 'Submit My Day',
      celebration: 'Great job checking in',
      activity: 'Activity',
      completed: 'Completed',
      skipped: 'Skipped',
      nutritionHabits: 'Nutrition habits',
      of: 'of',
      pointsEarned: 'Points earned',
      newBadges: 'New badge earned!',
      perfectDay: 'Perfect day!',
      done: 'Done for Today',
      yes: 'Yes',
      no: 'No',
    },
    es: {
      activityTitle: '¿Completaste tu meta de movimiento hoy?',
      activityGoal: 'minutos de caminata, estiramiento o movimiento suave',
      yesDidIt: '¡Sí, Lo Hice!',
      skippedToday: 'Lo Salté Hoy',
      nutritionTitle: 'Revisión rápida de nutrición',
      nutritionSubtitle: 'Solo responde honestamente. Sin juicios aquí.',
      noGuilt: 'Sin culpa. Mañana es un nuevo comienzo.',
      greatJob: '¡Excelente trabajo completando tu actividad!',
      submit: 'Enviar Mi Día',
      celebration: 'Excelente trabajo al registrarte',
      activity: 'Actividad',
      completed: 'Completada',
      skipped: 'Saltada',
      nutritionHabits: 'Hábitos de nutrición',
      of: 'de',
      pointsEarned: 'Puntos ganados',
      newBadges: '¡Nueva insignia ganada!',
      perfectDay: '¡Día perfecto!',
      done: 'Listo por Hoy',
      yes: 'Sí',
      no: 'No',
    },
  };

  const t = texts[language];

  return (
    <div className="min-h-screen gradient-soft flex flex-col">
      <Confetti isActive={showConfetti} />
      <MicroFeedback type="activity" isVisible={showActivityFeedback} />
      
      <AnimatePresence mode="wait">
        {step === 'activity' && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col items-center justify-center px-6 py-12"
          >
            <h1 className="text-3xl font-heading font-bold mb-4 text-center">
              {t.activityTitle}
            </h1>
            <p className="text-muted-foreground text-center max-w-sm mb-8">
              {language === 'en' ? 'Your goal was' : 'Tu meta fue'} <span className="font-semibold text-foreground">{profile.currentActivityGoalMinutes} {language === 'en' ? 'minutes' : 'minutos'}</span> {t.activityGoal}
            </p>

            {/* Community nudge */}
            <div className="w-full max-w-sm mb-8">
              <CommunityNudge habitType="activity" isVisible={true} />
            </div>

            <div className="flex gap-4 w-full max-w-sm">
              <Button
                size="lg"
                onClick={() => handleActivityResponse(true)}
                className="flex-1 py-8 text-lg font-semibold rounded-xl bg-success hover:bg-success/90"
              >
                <Check className="w-6 h-6 mr-2" />
                {t.yesDidIt}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => handleActivityResponse(false)}
                className="flex-1 py-8 text-lg font-semibold rounded-xl"
              >
                <X className="w-6 h-6 mr-2" />
                {t.skippedToday}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'nutrition' && (
          <motion.div
            key="nutrition"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col px-6 py-12"
          >
            <InlineFeedback 
              message={activityCompleted ? `🎉 ${t.greatJob}` : t.noGuilt} 
              isVisible={true} 
            />

            <h1 className="text-2xl font-heading font-bold mb-2">{t.nutritionTitle}</h1>
            <p className="text-muted-foreground mb-6">{t.nutritionSubtitle}</p>

            {/* Community nudge for nutrition */}
            <div className="mb-6">
              <CommunityNudge habitType="nutrition" isVisible={true} />
            </div>

            <div className="space-y-4 flex-1">
              {nutritionQuestions.map((question, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl border-2 border-border bg-card"
                >
                  <p className="font-medium mb-4">{question}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleNutritionResponse(index, true)}
                      className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                        nutritionResponses[index] === true
                          ? 'bg-success text-success-foreground'
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      {t.yes}
                    </button>
                    <button
                      onClick={() => handleNutritionResponse(index, false)}
                      className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                        nutritionResponses[index] === false
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      {t.no}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button
              size="lg"
              onClick={() => setStep('mood')}
              disabled={!allNutritionAnswered}
              className="w-full py-6 text-lg font-semibold mt-8"
            >
              {language === 'en' ? 'Continue' : 'Continuar'}
            </Button>
          </motion.div>
        )}

        {step === 'mood' && (
          <motion.div
            key="mood"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1"
          >
            <MoodCheckIn 
              selectedMood={selectedMood}
              onMoodSelect={handleMoodSelected} 
              onSkip={handleSkipMood}
            />
          </motion.div>
        )}

        {step === 'summary' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center shadow-glow mb-8"
            >
              <PartyPopper className="w-12 h-12 text-primary-foreground" />
            </motion.div>

            <h1 className="text-3xl font-heading font-bold mb-4">
              {t.celebration}, {profile.firstName}!
            </h1>

            <div className="w-full max-w-sm space-y-4 mt-6">
              <div className="p-4 rounded-xl bg-secondary flex items-center justify-between">
                <span>{t.activity}</span>
                <span className={activityCompleted ? 'text-success font-semibold' : 'text-muted-foreground'}>
                  {activityCompleted ? `✓ ${t.completed}` : t.skipped}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-secondary flex items-center justify-between">
                <span>{t.nutritionHabits}</span>
                <span className="font-semibold">
                  {nutritionResponses.filter(r => r === true).length} {t.of} {nutritionResponses.length}
                </span>
              </div>

              <div className="p-4 rounded-xl gradient-primary text-primary-foreground flex items-center justify-between">
                <span>{t.pointsEarned}</span>
                <span className="text-2xl font-bold">+{earnedPoints}</span>
              </div>

              {newBadges.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 rounded-xl gradient-coral text-accent-foreground"
                >
                  <div className="flex items-center gap-2 justify-center">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-semibold">{newBadges.length > 1 ? (language === 'en' ? 'New badges earned!' : '¡Nuevas insignias ganadas!') : t.newBadges}</span>
                  </div>
                  <p className="mt-1 text-sm">{newBadges.join(', ')}</p>
                </motion.div>
              )}

              {/* Perfect day celebration */}
              {activityCompleted && nutritionResponses.every(r => r === true) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-4 rounded-xl gradient-gold text-gold-foreground"
                >
                  <div className="flex items-center gap-2 justify-center">
                    <span className="text-xl">⭐</span>
                    <span className="font-semibold">{t.perfectDay}</span>
                    <span className="text-xl">⭐</span>
                  </div>
                </motion.div>
              )}
            </div>

            <Button
              size="lg"
              onClick={onComplete}
              className="px-12 py-6 text-lg font-semibold mt-12"
            >
              {t.done}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
