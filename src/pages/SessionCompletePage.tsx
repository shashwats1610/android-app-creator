import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, Dumbbell, TrendingUp, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { WorkoutSession } from '@/types/workout';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

// Confetti on mount
function ConfettiBurst() {
  const colors = ['hsl(var(--primary))', 'hsl(var(--neon-amber))', 'hsl(var(--neon-blue))', 'hsl(var(--neon-purple))'];
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="animate-confetti absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            backgroundColor: colors[i % colors.length],
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: `${Math.random() * 0.8}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function SessionCompletePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = (location.state as { session?: WorkoutSession })?.session;

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  const elapsed = session.endTime
    ? Math.floor((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000)
    : 0;
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  const handleShare = async () => {
    const text = `💪 Just completed ${session.dayName}!\n🏋️ ${session.totalSets} sets · ${(session.totalVolume / 1000).toFixed(1)}k volume\n🏆 ${session.prsHit} PRs hit\n⏱ ${mins}:${secs.toString().padStart(2, '0')} duration`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <>
      <ConfettiBurst />
      <motion.div
        className="flex min-h-screen flex-col items-center justify-center gap-6 p-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item} className="flex flex-col items-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <Trophy className="h-16 w-16 text-primary" />
          </motion.div>
          <h1 className="mt-4 font-display text-2xl font-bold neon-glow">Workout Complete!</h1>
          <p className="mt-1 text-sm text-muted-foreground">{session.dayName}</p>
        </motion.div>

        <motion.div variants={item} className="grid w-full max-w-sm grid-cols-2 gap-3">
          <Card className="card-elevated">
            <CardContent className="flex flex-col items-center p-4">
              <Clock className="mb-1 h-5 w-5 text-muted-foreground" />
              <span className="font-display text-xl font-bold">{mins}:{secs.toString().padStart(2, '0')}</span>
              <span className="text-[11px] text-muted-foreground">Duration</span>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="flex flex-col items-center p-4">
              <Dumbbell className="mb-1 h-5 w-5 text-muted-foreground" />
              <span className="font-display text-xl font-bold">{session.totalSets}</span>
              <span className="text-[11px] text-muted-foreground">Sets</span>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="flex flex-col items-center p-4">
              <TrendingUp className="mb-1 h-5 w-5 text-muted-foreground" />
              <span className="font-display text-xl font-bold">{(session.totalVolume / 1000).toFixed(1)}k</span>
              <span className="text-[11px] text-muted-foreground">Volume (kg)</span>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="flex flex-col items-center p-4">
              <Trophy className="mb-1 h-5 w-5 text-neon-amber" />
              <span className="font-display text-xl font-bold">{session.prsHit}</span>
              <span className="text-[11px] text-muted-foreground">PRs Hit</span>
            </CardContent>
          </Card>
        </motion.div>

        {/* Exercises summary */}
        <motion.div variants={item} className="w-full max-w-sm">
          <Card className="card-elevated">
            <CardContent className="p-4">
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Exercises</p>
              {session.exercises.map((ex) => (
                <div key={ex.exerciseId} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{ex.exerciseName}</span>
                    {ex.personalRecord && <Trophy className="h-3 w-3 text-neon-amber" />}
                  </div>
                  <span className="text-xs text-muted-foreground">{ex.sets.length} sets</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="flex gap-3">
          <Button variant="outline" className="touch-target" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
          <Button size="lg" className="touch-target px-8 text-base font-semibold active:scale-[0.98] transition-transform" onClick={() => navigate('/')}>
            Done
          </Button>
        </motion.div>
      </motion.div>
    </>
  );
}
