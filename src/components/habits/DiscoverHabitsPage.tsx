import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Plus, Check, Star, Clock, Users, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getUserProfile, saveUserProfile } from '@/lib/storage';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { EXTENDED_HABIT_LIBRARY, HABIT_CATEGORIES, ExtendedHabit, HabitCategory } from '@/lib/habit-library-data';
import { HabitDetailSheet } from './HabitDetailSheet';
import { RateHabitModal } from './RateHabitModal';

interface HabitStats {
  [habitId: string]: {
    avgRating: number;
    ratingCount: number;
    recommendPercent: number;
    trackingCount: number;
  };
}

export const DiscoverHabitsPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const profile = getUserProfile();
  const [activeHabits, setActiveHabits] = useState<string[]>(profile?.activeLibraryHabits || []);
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'quickest'>('popular');
  const [selectedHabit, setSelectedHabit] = useState<ExtendedHabit | null>(null);
  const [ratingHabit, setRatingHabit] = useState<ExtendedHabit | null>(null);
  const [habitStats, setHabitStats] = useState<HabitStats>({});

  useEffect(() => {
    fetchHabitStats();
  }, []);

  const fetchHabitStats = async () => {
    const { data } = await supabase
      .from('habit_ratings')
      .select('habit_id, rating, would_recommend');

    if (!data) return;

    const stats: HabitStats = {};
    const grouped: { [id: string]: { ratings: number[]; recommends: number; total: number } } = {};

    data.forEach(r => {
      if (!grouped[r.habit_id]) grouped[r.habit_id] = { ratings: [], recommends: 0, total: 0 };
      grouped[r.habit_id].ratings.push(r.rating);
      grouped[r.habit_id].total++;
      if (r.would_recommend) grouped[r.habit_id].recommends++;
    });

    Object.entries(grouped).forEach(([id, g]) => {
      stats[id] = {
        avgRating: Math.round((g.ratings.reduce((a, b) => a + b, 0) / g.ratings.length) * 10) / 10,
        ratingCount: g.ratings.length,
        recommendPercent: Math.round((g.recommends / g.total) * 100),
        trackingCount: g.total + Math.floor(Math.random() * 50) + 10, // Seed some base numbers
      };
    });

    setHabitStats(stats);
  };

  const filteredHabits = useMemo(() => {
    let habits = EXTENDED_HABIT_LIBRARY;

    if (selectedCategory !== 'all') {
      habits = habits.filter(h => h.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      habits = habits.filter(h =>
        h.name.toLowerCase().includes(q) ||
        h.nameEs.toLowerCase().includes(q) ||
        h.description.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'rating') {
      habits = [...habits].sort((a, b) => (habitStats[b.id]?.avgRating || 0) - (habitStats[a.id]?.avgRating || 0));
    } else if (sortBy === 'quickest') {
      habits = [...habits].sort((a, b) => a.estimatedMinutes - b.estimatedMinutes);
    } else {
      habits = [...habits].sort((a, b) => (habitStats[b.id]?.trackingCount || 0) - (habitStats[a.id]?.trackingCount || 0));
    }

    return habits;
  }, [selectedCategory, searchQuery, sortBy, habitStats]);

  const toggleHabit = (habitId: string) => {
    let newActive: string[];
    if (activeHabits.includes(habitId)) {
      newActive = activeHabits.filter(id => id !== habitId);
    } else {
      if (activeHabits.length >= 5) {
        toast.error(language === 'en' ? 'Maximum 5 active habits' : 'Máximo 5 hábitos activos');
        return;
      }
      newActive = [...activeHabits, habitId];
    }
    setActiveHabits(newActive);
    if (profile) {
      saveUserProfile({ ...profile, activeLibraryHabits: newActive });
    }
    if (user) {
      supabase.from('profiles').update({ active_library_habits: newActive }).eq('id', user.id).then(() => {});
    }
    toast.success(
      activeHabits.includes(habitId)
        ? (language === 'en' ? 'Habit removed' : 'Hábito eliminado')
        : (language === 'en' ? 'Habit added! 🌱' : '¡Hábito agregado! 🌱')
    );
  };

  const getDifficultyLabel = (d: string) => {
    if (language === 'es') {
      return d === 'beginner' ? 'Principiante' : d === 'easy' ? 'Fácil' : 'Moderado';
    }
    return d.charAt(0).toUpperCase() + d.slice(1);
  };

  const texts = {
    en: {
      title: 'Discover Habits',
      subtitle: `${EXTENDED_HABIT_LIBRARY.length} gentle habits to explore`,
      search: 'Search habits...',
      all: 'All',
      popular: 'Popular',
      topRated: 'Top Rated',
      quickest: 'Quickest',
      min: 'min',
      tracking: 'tracking',
      helpful: 'helpful',
      addToMine: 'Add',
      added: 'Added',
    },
    es: {
      title: 'Descubre Hábitos',
      subtitle: `${EXTENDED_HABIT_LIBRARY.length} hábitos suaves para explorar`,
      search: 'Buscar hábitos...',
      all: 'Todos',
      popular: 'Popular',
      topRated: 'Mejor Valorado',
      quickest: 'Más Rápido',
      min: 'min',
      tracking: 'siguen',
      helpful: 'útil',
      addToMine: 'Agregar',
      added: 'Agregado',
    },
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-8 pb-4 bg-card border-b border-border">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4 min-h-[44px]">
          <ArrowLeft className="w-5 h-5" />
          <span>{language === 'en' ? 'Back' : 'Volver'}</span>
        </button>
        <h1 className="text-2xl font-heading font-bold">{t.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
      </header>

      <main className="px-6 py-4 space-y-4">
        {/* Hidden Calories Quick Link */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl border-2 border-border bg-card flex items-center justify-between cursor-pointer hover:bg-secondary/50 transition-colors"
          onClick={() => navigate('/hidden-calories')}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔍</span>
            <div>
              <p className="font-semibold text-sm">{language === 'en' ? 'Hidden Calories Guide' : 'Guía de Calorías Ocultas'}</p>
              <p className="text-xs text-muted-foreground">{language === 'en' ? 'Spot sneaky calories in everyday foods' : 'Detecta calorías ocultas en alimentos cotidianos'}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </motion.div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.search}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}
          >
            {t.all}
          </button>
          {HABIT_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                selectedCategory === cat.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{language === 'en' ? cat.labelEn : cat.labelEs}</span>
            </button>
          ))}
        </div>

        {/* Sort Chips */}
        <div className="flex gap-2">
          {(['popular', 'rating', 'quickest'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === s ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-secondary/50 text-muted-foreground'
              }`}
            >
              {s === 'popular' ? t.popular : s === 'rating' ? t.topRated : t.quickest}
            </button>
          ))}
        </div>

        {/* Habit Cards */}
        <div className="space-y-3">
          {filteredHabits.map((habit, i) => {
            const isActive = activeHabits.includes(habit.id);
            const stats = habitStats[habit.id];

            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  isActive ? 'bg-primary/5 border-primary/40' : 'bg-card border-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{habit.icon}</span>
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => setSelectedHabit(habit)}
                      className="text-left w-full"
                    >
                      <p className="font-semibold text-sm">{language === 'en' ? habit.name : habit.nameEs}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {language === 'en' ? habit.description : habit.descriptionEs}
                      </p>
                    </button>

                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {habit.estimatedMinutes} {t.min}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary text-xs">
                        {getDifficultyLabel(habit.difficulty)}
                      </span>
                      {stats && (
                        <>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {stats.avgRating}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {stats.trackingCount}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <Button
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleHabit(habit.id)}
                    className="flex-shrink-0"
                  >
                    {isActive ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      <BottomNavigation />

      {/* Habit Detail Sheet */}
      <HabitDetailSheet
        habit={selectedHabit}
        isOpen={!!selectedHabit}
        onClose={() => setSelectedHabit(null)}
        isActive={selectedHabit ? activeHabits.includes(selectedHabit.id) : false}
        onToggle={() => selectedHabit && toggleHabit(selectedHabit.id)}
        stats={selectedHabit ? habitStats[selectedHabit.id] : undefined}
        onRate={() => {
          if (selectedHabit) {
            setRatingHabit(selectedHabit);
            setSelectedHabit(null);
          }
        }}
        canRate={selectedHabit ? activeHabits.includes(selectedHabit.id) : false}
      />

      {/* Rate Habit Modal */}
      <RateHabitModal
        habit={ratingHabit}
        isOpen={!!ratingHabit}
        onClose={() => setRatingHabit(null)}
        onSubmit={async (rating, wouldRecommend, reviewText) => {
          if (!user || !ratingHabit) return;
          await supabase.from('habit_ratings').upsert({
            user_id: user.id,
            habit_id: ratingHabit.id,
            rating,
            would_recommend: wouldRecommend,
            review_text: reviewText || null,
          }, { onConflict: 'user_id,habit_id' });
          toast.success(language === 'en' ? 'Thanks for rating! 💚' : '¡Gracias por calificar! 💚');
          fetchHabitStats();
          setRatingHabit(null);
        }}
      />
    </div>
  );
};
