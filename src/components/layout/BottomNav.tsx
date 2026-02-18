import { Home, Dumbbell, Clock, Trophy, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const tabs = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/workout', label: 'Workout', icon: Dumbbell },
  { path: '/history', label: 'History', icon: Clock },
  { path: '/records', label: 'Records', icon: Trophy },
  { path: '/settings', label: 'Settings', icon: Settings },
] as const;

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide nav during active workout session
  if (location.pathname.startsWith('/session')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1">
        {tabs.map(({ path, label, icon: Icon }) => {
          const isActive =
            path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(path);

          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                'relative flex flex-col items-center justify-center touch-target rounded-xl px-3 py-1.5 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon className="relative z-10 h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="relative z-10 mt-0.5 text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
