import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { AnimatePresence, motion } from 'framer-motion';

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-lg pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}
