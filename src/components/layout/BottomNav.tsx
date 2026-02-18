import { Home, Dumbbell, Clock, Trophy, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

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
  const sessions = useAppStore((s) => s.sessions);

  // Hide nav during active workout session
  if (location.pathname.startsWith('/session')) return null;

  // Check if a session was completed today
  const today = format(new Date(), 'yyyy-MM-dd');
  const hasSessionToday = sessions.some((s) => s.date === today);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-primary/10 bg-card/80 backdrop-blur-xl safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {tabs.map(({ path, label, icon: Icon }) => {
          const isActive =
            path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(path);

          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              aria-label={label}
              className={cn(
                'relative flex flex-col items-center justify-center touch-target rounded-xl px-3 py-1.5 transition-all active:scale-95',
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
              {/* Active tab top glow */}
              {isActive && (
                <motion.div
                  layoutId="nav-glow"
                  className="absolute -top-[1px] left-3 right-3 h-[2px] rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.6)]"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <div className="relative z-10">
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                {/* Badge dot for History tab when session completed today */}
                {path === '/history' && hasSessionToday && !isActive && (
                  <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
              <span className="relative z-10 mt-0.5 text-[11px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
