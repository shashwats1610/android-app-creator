import { useAppStore } from '@/stores/useAppStore';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Droplets, Dumbbell, Plus, TrendingUp, Utensils, Scale, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const navigate = useNavigate();
  const { settings, workoutPlan, inProgressSession, dailyHydration, sessions, streak } = useAppStore();

  const today = format(new Date(), 'yyyy-MM-dd');
  const dayOfWeek = new Date().getDay(); // 0=Sun
  const currentDay = workoutPlan.days[settings.currentDayIndex];
  const hydration = dailyHydration[today];
  const hydrationTotal = hydration?.total ?? 0;
  const hydrationPct = Math.min(100, (hydrationTotal / settings.hydrationGoal) * 100);

  const addHydration = useAppStore((s) => s.addHydrationEntry);

  const quickAddWater = (ml: number) => {
    addHydration(today, {
      id: `h_${Date.now()}`,
      amount: ml,
      timestamp: new Date().toISOString(),
    });
  };

  const recentSessions = sessions.slice(0, 3);
  const totalVolThisWeek = sessions
    .filter((s) => {
      const d = new Date(s.date);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      return d >= weekAgo;
    })
    .reduce((sum, s) => sum + s.totalVolume, 0);

  return (
    <motion.div
      className="flex flex-col gap-4 p-4 pt-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{format(new Date(), 'EEEE, MMM d')}</p>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Hyper<span className="text-primary">trophy</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
              🔥 {streak} day streak
            </span>
          )}
        </div>
      </motion.div>

      {/* In-progress recovery */}
      {inProgressSession && (
        <motion.div variants={item}>
          <Card className="border-warning/40 bg-warning/5">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-semibold text-warning">Session in progress</p>
                <p className="text-xs text-muted-foreground">{inProgressSession.session.dayName}</p>
              </div>
              <Button size="sm" onClick={() => navigate('/session')} className="bg-warning text-warning-foreground hover:bg-warning/90">
                Resume
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Today's Workout */}
      <motion.div variants={item}>
        <Card className="overflow-hidden card-glow">
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-primary/15 via-transparent to-transparent p-5">
              <div className="mb-1 flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-primary">Day {currentDay.dayNumber}</span>
              </div>
              <h2 className="font-display text-lg font-bold">{currentDay.name}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {currentDay.exercises.length} exercises · {currentDay.focusMuscles.slice(0, 3).join(', ')}
              </p>
              <Button
                className="mt-4 w-full touch-target text-base font-semibold"
                size="lg"
                onClick={() => navigate('/workout')}
              >
                Start Workout
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats Row */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="flex flex-col items-center p-3 text-center">
            <span className="text-lg font-bold font-display">{sessions.length}</span>
            <span className="text-[10px] text-muted-foreground">Sessions</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-3 text-center">
            <span className="text-lg font-bold font-display">{(totalVolThisWeek / 1000).toFixed(1)}k</span>
            <span className="text-[10px] text-muted-foreground">Volume (wk)</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-3 text-center">
            <span className="text-lg font-bold font-display">{Object.values(useAppStore.getState().personalRecords).length}</span>
            <span className="text-[10px] text-muted-foreground">PRs</span>
          </CardContent>
        </Card>
      </motion.div>

      {/* Hydration Widget */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-neon-blue" />
                <span className="text-sm font-semibold">Hydration</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {hydrationTotal}ml / {settings.hydrationGoal}ml
              </span>
            </div>
            <Progress value={hydrationPct} className="mb-3 h-2" />
            <div className="flex gap-2">
              {[250, 500, 750].map((ml) => (
                <Button
                  key={ml}
                  variant="outline"
                  size="sm"
                  className="flex-1 touch-target text-xs"
                  onClick={() => quickAddWater(ml)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  {ml}ml
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sunday Measurement Reminder */}
      {dayOfWeek === 0 && (
        <motion.div variants={item}>
          <Card className="border-neon-purple/30 bg-neon-purple/5">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Scale className="h-5 w-5 text-neon-purple" />
                <div>
                  <p className="text-sm font-semibold">Measurement Day</p>
                  <p className="text-xs text-muted-foreground">Log your weekly body stats</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => navigate('/records')}>
                Log <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Nav Cards */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        <Card
          className="cursor-pointer transition-colors hover:bg-accent/50"
          onClick={() => navigate('/records')}
        >
          <CardContent className="flex flex-col items-center gap-2 p-4">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">Stats & PRs</span>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer transition-colors hover:bg-accent/50"
          onClick={() => navigate('/nutrition')}
        >
          <CardContent className="flex flex-col items-center gap-2 p-4">
            <Utensils className="h-6 w-6 text-neon-amber" />
            <span className="text-sm font-medium">Nutrition</span>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
