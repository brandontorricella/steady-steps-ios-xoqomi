import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, BookOpen, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';

interface MicroLesson {
  id: string;
  title: string;
  content: string;
  duration: string;
  icon: string;
}

const lessons = {
  en: [
    {
      id: 'habit-loop',
      title: 'The Habit Loop',
      content: 'Every habit has 3 parts: Cue (trigger), Routine (behavior), and Reward (benefit). By understanding this loop, you can build new habits by attaching them to existing cues. For example, "After I brush my teeth (cue), I will do 5 stretches (routine), then feel energized (reward)."',
      duration: '45 sec',
      icon: '🔄',
    },
    {
      id: 'tiny-habits',
      title: 'Why Tiny Habits Work',
      content: 'Small habits succeed because they feel effortless. A 5-minute walk is easier to commit to than an hour at the gym. Once the tiny habit becomes automatic, you can gradually increase it. Start laughably small—your brain will thank you.',
      duration: '40 sec',
      icon: '🌱',
    },
    {
      id: 'streak-science',
      title: 'The Science of Streaks',
      content: 'Streaks work because of "loss aversion"—we dislike losing something we have built. Each day you check in, you invest in your streak. This makes you more likely to continue. But remember: one missed day does not erase your progress!',
      duration: '50 sec',
      icon: '🔥',
    },
    {
      id: 'hydration',
      title: 'Water and Energy',
      content: 'Even mild dehydration (1-2%) can decrease energy and focus. Before reaching for caffeine or snacks, try drinking a glass of water. Many people mistake thirst for hunger. Keep water visible as a reminder.',
      duration: '35 sec',
      icon: '💧',
    },
    {
      id: 'movement-mood',
      title: 'Movement and Mood',
      content: 'Just 10 minutes of walking can boost your mood for up to 2 hours. Movement releases endorphins and reduces cortisol (stress hormone). You do not need intense exercise—gentle movement counts!',
      duration: '40 sec',
      icon: '🚶‍♀️',
    },
    {
      id: 'progress-not-perfection',
      title: 'Progress Over Perfection',
      content: 'Perfectionism is the enemy of progress. Missing one day does not make you a failure—it makes you human. What matters is getting back on track. One imperfect day in a month of good days is still an amazing month!',
      duration: '45 sec',
      icon: '⭐',
    },
  ],
  es: [
    {
      id: 'habit-loop',
      title: 'El Ciclo del Hábito',
      content: 'Cada hábito tiene 3 partes: Señal (disparador), Rutina (comportamiento), y Recompensa (beneficio). Al entender este ciclo, puedes crear nuevos hábitos conectándolos a señales existentes. Por ejemplo, "Después de lavarme los dientes (señal), haré 5 estiramientos (rutina), y me sentiré energizada (recompensa)."',
      duration: '45 seg',
      icon: '🔄',
    },
    {
      id: 'tiny-habits',
      title: 'Por Qué Funcionan los Mini Hábitos',
      content: 'Los hábitos pequeños funcionan porque se sienten sin esfuerzo. Una caminata de 5 minutos es más fácil de comprometer que una hora en el gimnasio. Una vez que el mini hábito se vuelve automático, puedes aumentarlo gradualmente. Empieza ridículamente pequeño—tu cerebro te lo agradecerá.',
      duration: '40 seg',
      icon: '🌱',
    },
    {
      id: 'streak-science',
      title: 'La Ciencia de las Rachas',
      content: 'Las rachas funcionan por la "aversión a la pérdida"—no nos gusta perder algo que hemos construido. Cada día que te registras, inviertes en tu racha. Esto te hace más propensa a continuar. Pero recuerda: ¡un día perdido no borra tu progreso!',
      duration: '50 seg',
      icon: '🔥',
    },
    {
      id: 'hydration',
      title: 'Agua y Energía',
      content: 'Incluso una deshidratación leve (1-2%) puede disminuir la energía y el enfoque. Antes de buscar cafeína o snacks, prueba beber un vaso de agua. Muchas personas confunden la sed con el hambre. Mantén el agua visible como recordatorio.',
      duration: '35 seg',
      icon: '💧',
    },
    {
      id: 'movement-mood',
      title: 'Movimiento y Ánimo',
      content: 'Solo 10 minutos de caminata pueden mejorar tu ánimo hasta por 2 horas. El movimiento libera endorfinas y reduce el cortisol (hormona del estrés). No necesitas ejercicio intenso—¡el movimiento suave cuenta!',
      duration: '40 seg',
      icon: '🚶‍♀️',
    },
    {
      id: 'progress-not-perfection',
      title: 'Progreso Sobre Perfección',
      content: 'El perfeccionismo es enemigo del progreso. Perder un día no te hace una fracasada—te hace humana. Lo que importa es volver al camino. ¡Un día imperfecto en un mes de buenos días sigue siendo un mes increíble!',
      duration: '45 seg',
      icon: '⭐',
    },
  ],
};

interface MicroLessonsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MicroLessons = ({ isOpen, onClose }: MicroLessonsProps) => {
  const { language } = useLanguage();
  const [selectedLesson, setSelectedLesson] = useState<MicroLesson | null>(null);
  const lessonList = lessons[language];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-heading font-bold">
                {language === 'en' ? 'Learn Why It Works' : 'Aprende Por Qué Funciona'}
              </h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto px-6 py-4">
            <AnimatePresence mode="wait">
              {!selectedLesson ? (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  <p className="text-sm text-muted-foreground mb-4">
                    {language === 'en' 
                      ? 'Quick reads to understand the science behind your habits.'
                      : 'Lecturas rápidas para entender la ciencia detrás de tus hábitos.'}
                  </p>
                  {lessonList.map((lesson, index) => (
                    <motion.button
                      key={lesson.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedLesson(lesson)}
                      className="w-full p-4 rounded-xl bg-card border border-border flex items-center gap-4 hover:border-primary/50 transition-colors text-left"
                    >
                      <span className="text-2xl">{lesson.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium">{lesson.title}</p>
                        <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </motion.button>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="text-sm text-primary flex items-center gap-1"
                  >
                    ← {language === 'en' ? 'Back to lessons' : 'Volver a lecciones'}
                  </button>

                  <div className="text-center py-4">
                    <span className="text-5xl">{selectedLesson.icon}</span>
                  </div>

                  <h3 className="text-xl font-heading font-bold text-center">
                    {selectedLesson.title}
                  </h3>

                  <div className="p-6 rounded-2xl bg-card border border-border">
                    <div className="flex items-center gap-2 mb-4 text-primary">
                      <Lightbulb className="w-4 h-4" />
                      <span className="text-xs font-medium">{selectedLesson.duration}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {selectedLesson.content}
                    </p>
                  </div>

                  <Button onClick={() => setSelectedLesson(null)} className="w-full">
                    {language === 'en' ? 'Got It!' : '¡Entendido!'}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Mini card for dashboard
export const MicroLessonCard = ({ onOpen }: { onOpen: () => void }) => {
  const { language } = useLanguage();
  const lessonList = lessons[language];
  const randomLesson = lessonList[Math.floor(Math.random() * lessonList.length)];

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onOpen}
      className="w-full p-4 rounded-2xl border-2 border-border bg-card text-left hover:border-primary/50 transition-colors"
    >
      <div className="flex items-center gap-3 mb-2">
        <BookOpen className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium text-primary">
          {language === 'en' ? 'Quick Learn' : 'Aprende Rápido'}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{randomLesson.icon}</span>
        <div>
          <p className="font-medium text-sm">{randomLesson.title}</p>
          <p className="text-xs text-muted-foreground">{randomLesson.duration}</p>
        </div>
      </div>
    </motion.button>
  );
};
