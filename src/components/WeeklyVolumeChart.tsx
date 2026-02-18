import { useMemo } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

const MUSCLE_LABELS: Record<string, string> = {
  quads: 'Quads', hamstrings: 'Hams', glutes: 'Glutes', calves: 'Calves',
  chest: 'Chest', front_delts: 'Front Delts', side_delts: 'Side Delts', rear_delts: 'Rear Delts',
  lats: 'Lats', upper_back: 'Upper Back', traps: 'Traps', lower_back: 'Lower Back',
  biceps: 'Biceps', triceps: 'Triceps', forearms: 'Forearms',
  abs: 'Abs', obliques: 'Obliques',
};

export default function WeeklyVolumeChart() {
  const { sessions, workoutPlan } = useAppStore();

  const muscleData = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const weekSessions = sessions.filter(s => new Date(s.date) >= weekAgo);

    const setsByMuscle: Record<string, number> = {};

    for (const session of weekSessions) {
      const day = workoutPlan.days.find(d => d.id === session.dayId);
      if (!day) continue;
      for (const loggedEx of session.exercises) {
        const exercise = day.exercises.find(e => e.id === loggedEx.exerciseId);
        if (!exercise) continue;
        const completedSets = loggedEx.sets.length;
        for (const mg of exercise.muscleGroups) {
          setsByMuscle[mg] = (setsByMuscle[mg] || 0) + completedSets;
        }
      }
    }

    return Object.entries(setsByMuscle)
      .map(([muscle, sets]) => ({ muscle, sets, label: MUSCLE_LABELS[muscle] || muscle }))
      .sort((a, b) => b.sets - a.sets);
  }, [sessions, workoutPlan]);

  if (muscleData.length === 0) return null;

  const maxSets = Math.max(...muscleData.map(d => d.sets), 20);

  return (
    <Card className="card-elevated">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Weekly Sets by Muscle</span>
        </div>
        <div className="space-y-1.5">
          {muscleData.slice(0, 10).map(({ muscle, sets, label }) => {
            const pct = (sets / maxSets) * 100;
            const color =
              sets < 10
                ? 'bg-neon-amber'
                : sets <= 20
                ? 'bg-green-500'
                : 'bg-destructive';
            return (
              <div key={muscle} className="flex items-center gap-2">
                <span className="w-20 shrink-0 text-[11px] text-muted-foreground truncate">
                  {label}
                </span>
                <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-[11px] font-semibold">{sets}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-neon-amber" /> &lt;10
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500" /> 10-20 ✓
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-destructive" /> &gt;20
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
