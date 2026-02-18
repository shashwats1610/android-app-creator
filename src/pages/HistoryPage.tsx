import { useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar, Dumbbell, TrendingUp, Trophy, ChevronDown, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { WorkoutSession, MuscleGroup } from '@/types/workout';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

// Group sessions by week
function groupByWeek(sessions: WorkoutSession[]) {
  const weeks: { label: string; start: Date; end: Date; sessions: WorkoutSession[] }[] = [];
  const weekMap = new Map<string, WorkoutSession[]>();

  for (const s of sessions) {
    const d = parseISO(s.date);
    const ws = startOfWeek(d, { weekStartsOn: 1 });
    const key = format(ws, 'yyyy-MM-dd');
    if (!weekMap.has(key)) weekMap.set(key, []);
    weekMap.get(key)!.push(s);
  }

  for (const [key, sess] of weekMap) {
    const ws = parseISO(key);
    const we = endOfWeek(ws, { weekStartsOn: 1 });
    weeks.push({
      label: `${format(ws, 'MMM d')} — ${format(we, 'MMM d')}`,
      start: ws,
      end: we,
      sessions: sess,
    });
  }

  return weeks.sort((a, b) => b.start.getTime() - a.start.getTime());
}

// Calculate volume by muscle group for a set of sessions
function volumeByMuscle(sessions: WorkoutSession[], workoutPlan: any): Record<string, number> {
  const result: Record<string, number> = {};
  for (const session of sessions) {
    const day = workoutPlan.days.find((d: any) => d.id === session.dayId);
    if (!day) continue;
    for (const loggedEx of session.exercises) {
      const exercise = day.exercises.find((e: any) => e.id === loggedEx.exerciseId);
      if (!exercise) continue;
      const exVolume = loggedEx.sets.reduce((sum: number, s: any) => sum + s.weight * s.reps, 0);
      for (const mg of exercise.muscleGroups) {
        result[mg] = (result[mg] || 0) + exVolume;
      }
    }
  }
  return result;
}

function formatDuration(startTime: string, endTime?: string) {
  if (!endTime) return '--';
  const elapsed = Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000);
  const mins = Math.floor(elapsed / 60);
  return `${mins}m`;
}

export default function HistoryPage() {
  const { sessions, workoutPlan } = useAppStore();
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);

  const weeks = groupByWeek(sessions);

  return (
    <>
      <motion.div className="flex flex-col gap-4 p-4 pt-6" variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
          <h1 className="font-display text-2xl font-bold">History</h1>
          <p className="text-sm text-muted-foreground">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} logged
          </p>
        </motion.div>

        {sessions.length === 0 && (
          <motion.div variants={item} className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No sessions yet.</p>
            <p className="text-xs text-muted-foreground">Complete a workout to see your history here.</p>
          </motion.div>
        )}

        {weeks.map((week) => {
          const weekVolume = week.sessions.reduce((sum, s) => sum + s.totalVolume, 0);
          const weekSets = week.sessions.reduce((sum, s) => sum + s.totalSets, 0);
          const weekPRs = week.sessions.reduce((sum, s) => sum + s.prsHit, 0);
          const muscleVol = volumeByMuscle(week.sessions, workoutPlan);

          return (
            <motion.div key={week.label} variants={item}>
              <Collapsible defaultOpen={weeks.indexOf(week) === 0}>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-left">
                  <div>
                    <p className="text-xs font-semibold">{week.label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {week.sessions.length} sessions · {(weekVolume / 1000).toFixed(1)}k vol · {weekSets} sets
                      {weekPRs > 0 && ` · ${weekPRs} PR${weekPRs > 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 flex flex-col gap-2">
                  {/* Weekly muscle volume breakdown */}
                  {Object.keys(muscleVol).length > 0 && (
                    <div className="flex flex-wrap gap-1 px-1">
                      {Object.entries(muscleVol)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 8)
                        .map(([mg, vol]) => (
                          <span key={mg} className="rounded bg-accent px-1.5 py-0.5 text-[9px] text-accent-foreground">
                            {mg.replace('_', ' ')} {(vol / 1000).toFixed(1)}k
                          </span>
                        ))}
                    </div>
                  )}

                  {week.sessions.map((session) => (
                    <Card
                      key={session.id}
                      className="cursor-pointer transition-colors hover:bg-accent/30"
                      onClick={() => setSelectedSession(session)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-sm font-bold text-primary">
                              {session.dayNumber}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{session.dayName}</p>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                <span>{format(parseISO(session.date), 'EEE, MMM d')}</span>
                                <span>·</span>
                                <span>{session.totalSets} sets</span>
                                <span>·</span>
                                <span>{(session.totalVolume / 1000).toFixed(1)}k</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {session.prsHit > 0 && (
                              <Badge variant="secondary" className="text-[10px]">
                                <Trophy className="mr-0.5 h-3 w-3 text-neon-amber" />
                                {session.prsHit}
                              </Badge>
                            )}
                            <span className="text-[10px] text-muted-foreground">
                              {formatDuration(session.startTime, session.endTime)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Session Detail Sheet */}
      <Sheet open={!!selectedSession} onOpenChange={(open) => { if (!open) setSelectedSession(null); }}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
          {selectedSession && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedSession.dayName}</SheetTitle>
                <SheetDescription>
                  {format(parseISO(selectedSession.date), 'EEEE, MMMM d, yyyy')} · {formatDuration(selectedSession.startTime, selectedSession.endTime)}
                </SheetDescription>
              </SheetHeader>

              {/* Summary stats */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-muted p-2 text-center">
                  <span className="font-display text-lg font-bold">{selectedSession.totalSets}</span>
                  <p className="text-[10px] text-muted-foreground">Sets</p>
                </div>
                <div className="rounded-lg bg-muted p-2 text-center">
                  <span className="font-display text-lg font-bold">{(selectedSession.totalVolume / 1000).toFixed(1)}k</span>
                  <p className="text-[10px] text-muted-foreground">Volume</p>
                </div>
                <div className="rounded-lg bg-muted p-2 text-center">
                  <span className="font-display text-lg font-bold">{selectedSession.prsHit}</span>
                  <p className="text-[10px] text-muted-foreground">PRs</p>
                </div>
              </div>

              {/* Exercises detail */}
              <div className="mt-4 flex flex-col gap-3">
                {selectedSession.exercises.map((ex) => (
                  <div key={ex.exerciseId} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{ex.exerciseName}</span>
                      {ex.personalRecord && <Trophy className="h-3.5 w-3.5 text-neon-amber" />}
                    </div>
                    {ex.sets.length > 0 ? (
                      <div className="mt-2">
                        <div className="grid grid-cols-4 gap-1 text-[10px] font-medium text-muted-foreground mb-1">
                          <span>Set</span><span>Weight</span><span>Reps</span><span>RPE</span>
                        </div>
                        {ex.sets.map((s) => (
                          <div key={s.setNumber} className="grid grid-cols-4 gap-1 text-xs py-0.5">
                            <span>{s.setNumber}</span>
                            <span>{s.weight}kg</span>
                            <span>{s.reps}</span>
                            <span>{s.rpe}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-[10px] text-muted-foreground italic">Skipped</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
