import { useAppStore } from '@/stores/useAppStore';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Droplets, Dumbbell, Plus, TrendingUp, Utensils, Scale, ChevronRight, Moon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';
import WeeklyVolumeChart from '@/components/WeeklyVolumeChart';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function VolumeSparkline({ sessions }: { sessions: { date: string; totalVolume: number }[] }) {
  const data = useMemo(() => {
    const now = new Date();
    const days: { day: string; vol: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = format(d, 'yyyy-MM-dd');
      const vol = sessions
        .filter((s) => s.date === dateStr)
        .reduce((sum, s) => sum + s.totalVolume, 0);
      days.push({ day: format(d, 'EEE'), vol });
    }
    return days;
  }, [sessions]);

  const hasData = data.some((d) => d.vol > 0);
  if (!hasData) return null;

  return (
    <ResponsiveContainer width="100%" height={32}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="vol"
          stroke="hsl(var(--primary))"
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { settings, workoutPlan, inProgressSession, dailyHydration, sessions, streak } = useAppStore();

  const today = format(new Date(), 'yyyy-MM-dd');
  const dayOfWeek = new Date().getDay();
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

  const totalVolThisWeek = sessions
    .filter((s) => {
      const d = new Date(s.date);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      return d >= weekAgo;
    })
    .reduce((sum, s) => sum + s.totalVolume, 0);

  // Days since last workout
  const lastSession = sessions[0];
  const daysSinceLast = lastSession
    ? Math.floor((Date.now() - new Date(lastSession.date).getTime()) / 86400000)
    : null;

  // Consecutive training days (for rest day awareness)
  const consecutiveTrainingDays = useMemo(() => {
    let count = 0;
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = format(new Date(now.getTime() - i * 86400000), 'yyyy-MM-dd');
      if (sessions.some(s => s.date === d)) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }, [sessions]);

  // Deload suggestion (every ~16 sessions)
  const shouldSuggestDeload = sessions.length > 0 && sessions.length % 16 < 4 && sessions.length >= 16;

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
          <p className="text-sm text-muted-foreground">{getGreeting()} · {format(new Date(), 'EEEE, MMM d')}</p>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Hyper<span className="text-primary">trophy</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <motion.span
              className="animate-flame-pulse rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary"
            >
              🔥 {streak} day streak
            </motion.span>
          )}
        </div>
      </motion.div>

      {/* Last workout reminder */}
      {daysSinceLast !== null && daysSinceLast > 2 && (
        <motion.div variants={item}>
          <div className="rounded-lg bg-muted/60 px-3 py-2 text-center">
            <p className="text-xs text-muted-foreground">
              Last workout was <span className="font-semibold text-foreground">{daysSinceLast} days ago</span> — time to train! 💪
            </p>
          </div>
        </motion.div>
      )}

      {/* Rest Day Awareness */}
      {consecutiveTrainingDays >= 3 && (
        <motion.div variants={item}>
          <Card className="border-neon-blue/30 bg-neon-blue/5">
            <CardContent className="flex items-center gap-3 p-4">
              <Moon className="h-5 w-5 text-neon-blue shrink-0" />
              <div>
                <p className="text-sm font-semibold">Recovery day?</p>
                <p className="text-xs text-muted-foreground">
                  You've trained {consecutiveTrainingDays} days in a row — consider a rest day for optimal recovery 🧘
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Deload Suggestion */}
      {shouldSuggestDeload && (
        <motion.div variants={item}>
          <Card className="border-neon-purple/30 bg-neon-purple/5">
            <CardContent className="flex items-center gap-3 p-4">
              <TrendingUp className="h-5 w-5 text-neon-purple shrink-0" />
              <div>
                <p className="text-sm font-semibold">Deload week?</p>
                <p className="text-xs text-muted-foreground">
                  You've logged {sessions.length} sessions — consider reducing intensity by 40% this week for recovery
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

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
      <motion.div variants={item} whileTap={{ scale: 0.98 }}>
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
                className="mt-4 w-full touch-target text-base font-semibold active:scale-[0.98] transition-transform"
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
        <Card className="card-elevated">
          <CardContent className="flex flex-col items-center p-3 text-center">
            <span className="text-lg font-bold font-display">{sessions.length}</span>
            <span className="text-[11px] text-muted-foreground">Sessions</span>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="flex flex-col items-center p-3 text-center">
            <span className="text-lg font-bold font-display">{(totalVolThisWeek / 1000).toFixed(1)}k</span>
            <span className="text-[11px] text-muted-foreground">Volume (wk)</span>
            <VolumeSparkline sessions={sessions} />
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="flex flex-col items-center p-3 text-center">
            <span className="text-lg font-bold font-display">{Object.values(useAppStore.getState().personalRecords).length}</span>
            <span className="text-[11px] text-muted-foreground">PRs</span>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Volume Chart */}
      <motion.div variants={item}>
        <WeeklyVolumeChart />
      </motion.div>

      {/* Hydration Widget */}
      <motion.div variants={item}>
        <Card className="card-elevated">
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
            <Progress value={hydrationPct} className="mb-3 h-2" aria-label="Hydration progress" role="progressbar" aria-valuenow={hydrationPct} />
            <div className="flex gap-2">
              {[250, 500, 750].map((ml) => (
                <Button
                  key={ml}
                  variant="outline"
                  size="sm"
                  className="flex-1 touch-target text-xs active:scale-95 transition-transform"
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
          className="cursor-pointer card-elevated transition-all hover:bg-accent/50 active:scale-[0.97]"
          onClick={() => navigate('/records')}
        >
          <CardContent className="flex flex-col items-center gap-2 p-4">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">Stats & PRs</span>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer card-elevated transition-all hover:bg-accent/50 active:scale-[0.97]"
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
