import { Home, TrendingUp, MessageCircleHeart, Users, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const tabs = [
  { id: 'home', icon: Home, label: 'Home', path: '/' },
  { id: 'progress', icon: TrendingUp, label: 'Progress', path: '/progress' },
  { id: 'coach', icon: MessageCircleHeart, label: 'Coach', path: '/coach' },
  { id: 'community', icon: Users, label: 'Community', path: '/community' },
  { id: 'profile', icon: User, label: 'Profile', path: '/settings' },
];

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          const isCoach = tab.id === 'coach';
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${
                active 
                  ? 'text-primary' 
                  : isCoach 
                    ? 'text-accent-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className={`relative ${isCoach ? 'p-2 rounded-full bg-accent' : ''}`}>
                <Icon className={`w-5 h-5 ${active ? 'scale-110' : ''} transition-transform`} />
                {isCoach && !active && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"
                  />
                )}
              </div>
              <span className={`text-xs font-medium ${active ? 'font-semibold' : ''}`}>
                {tab.label}
              </span>
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 w-8 h-1 bg-primary rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
