import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface NotBehindModeContextType {
  isActive: boolean;
  checkAndActivate: () => Promise<void>;
}

const NotBehindModeContext = createContext<NotBehindModeContextType>({
  isActive: false,
  checkAndActivate: async () => {},
});

export const NotBehindModeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);

  const checkAndActivate = async () => {
    if (!user) return;

    // Get last 7 days of check-ins
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
        .select('not_behind_mode_active, current_streak')
        .eq('id', user.id)
        .single(),
    ]);

    if (!checkins || !profile) return;

    const checkinsCount = checkins.filter(c => c.checkin_completed).length;
    const avgStress = checkins
      .filter(c => c.stress_level)
      .map(c => c.stress_level as number);
    const avgStressValue = avgStress.length 
      ? avgStress.reduce((a, b) => a + b, 0) / avgStress.length 
      : 0;

    // Activation conditions:
    // 1. Less than 3 check-ins in the last 7 days
    // 2. Average stress > 3.5 over the last 3+ entries
    // 3. Streak broken (current_streak === 0)
    const shouldActivate = 
      checkinsCount < 3 || 
      (avgStress.length >= 3 && avgStressValue > 3.5) ||
      (profile.current_streak === 0 && checkinsCount < 2);

    // Deactivation conditions:
    // 1. 4+ check-ins in last 7 days
    // 2. Stress trending down
    const shouldDeactivate = checkinsCount >= 4 && avgStressValue < 3;

    const newState = shouldActivate && !shouldDeactivate;

    if (newState !== isActive) {
      setIsActive(newState);
      
      // Update database
      await supabase
        .from('profiles')
        .update({ 
          not_behind_mode_active: newState,
          not_behind_mode_activated_at: newState ? new Date().toISOString() : null,
        })
        .eq('id', user.id);
    }
  };

  useEffect(() => {
    if (user) {
      // Check on mount and when user changes
      const loadInitialState = async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('not_behind_mode_active')
          .eq('id', user.id)
          .single();
        
        if (profile?.not_behind_mode_active) {
          setIsActive(true);
        }
        
        // Then run the check
        checkAndActivate();
      };
      
      loadInitialState();
    }
  }, [user]);

  return (
    <NotBehindModeContext.Provider value={{ isActive, checkAndActivate }}>
      {children}
    </NotBehindModeContext.Provider>
  );
};

export const useNotBehindMode = () => useContext(NotBehindModeContext);
