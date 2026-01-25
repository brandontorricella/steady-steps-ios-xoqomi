import { motion } from 'framer-motion';
import { getBadges } from '@/lib/storage';
import { Badge } from '@/lib/types';
import { Lock } from 'lucide-react';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';

export const BadgesPage = () => {
  const badges = getBadges();

  const categories = [
    { id: 'streak', name: 'Streaks', description: 'Show up every day' },
    { id: 'activity', name: 'Activity', description: 'Keep moving forward' },
    { id: 'nutrition', name: 'Nutrition', description: 'Build healthy habits' },
    { id: 'perfect_day', name: 'Perfect Days', description: 'Achieve perfection' },
    { id: 'stage_level', name: 'Stages & Levels', description: 'Climb higher' },
    { id: 'comeback', name: 'Comebacks', description: 'Never give up' },
    { id: 'special', name: 'Special', description: 'Unique achievements' },
    { id: 'mood', name: 'Mood', description: 'Emotional awareness' },
  ];

  const earnedCount = badges.filter(b => b.earned).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 bg-dusty-rose border-b border-border">
        <h1 className="text-3xl font-heading font-bold">Badges</h1>
        <p className="text-muted-foreground mt-1">
          {earnedCount} of {badges.length} earned
        </p>
      </header>

      <main className="px-6 space-y-8">
        {categories.map((category) => {
          const categoryBadges = badges.filter(b => b.category === category.id);
          
          return (
            <motion.section
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="font-heading font-semibold text-lg mb-1">{category.name}</h2>
              <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
              
              <div className="grid grid-cols-3 gap-3">
                {categoryBadges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    whileHover={{ scale: 1.05 }}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-3 text-center transition-all ${
                      badge.earned
                        ? 'bg-card border-2 border-primary/30 shadow-soft'
                        : 'bg-secondary/50 opacity-60'
                    }`}
                  >
                    <div className={`text-3xl mb-2 ${badge.earned ? '' : 'grayscale'}`}>
                      {badge.earned ? badge.icon : <Lock className="w-6 h-6 text-muted-foreground" />}
                    </div>
                    <p className={`text-xs font-medium leading-tight ${badge.earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {badge.name}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          );
        })}
      </main>

      <BottomNavigation />
    </div>
  );
};
