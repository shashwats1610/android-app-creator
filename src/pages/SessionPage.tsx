import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger,
} from '@/components/ui/sheet';
import {
  ChevronLeft, ChevronRight, Check, Timer, Info, Droplets, Plus, Minus, SkipForward, X, Trophy,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import type { LoggedSet, WorkoutSession, InProgressSession } from '@/types/workout';

// ========== REST TIMER COMPONENT ==========
function RestTimer({
  seconds,
  onDone,
  onSkip,
}: {
  seconds: number;
  onDone: () => void;
  onSkip: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);
  const [adjustedTotal, setAdjustedTotal] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
    setAdjustedTotal(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onDone();
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onDone]);

  const adjust = (delta: number) => {
    setRemaining((r) => Math.max(0, r + delta));
    setAdjustedTotal((t) => Math.max(1, t + delta));
  };

  const pct = adjustedTotal > 0 ? ((adjustedTotal - remaining) / adjustedTotal) * 100 : 100;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm"
    >
      <Timer className="mb-4 h-8 w-8 text-primary" />
      <p className="mb-2 text-sm font-medium text-muted-foreground">Rest Timer</p>
      <p className="font-display text-6xl font-bold tabular-nums">
        {mins}:{secs.toString().padStart(2, '0')}
      </p>
      <Progress value={pct} className="mt-6 h-2 w-48" />
      <div className="mt-6 flex items-center gap-3">
        <Button variant="outline" size="sm" className="touch-target" onClick={() => adjust(-15)}>
          <Minus className="mr-1 h-3 w-3" />15s
        </Button>
        <Button variant="outline" size="sm" className="touch-target" onClick={() => adjust(15)}>
          <Plus className="mr-1 h-3 w-3" />15s
        </Button>
      </div>
      <Button variant="ghost" className="mt-4 touch-target" onClick={onSkip}>
        <SkipForward className="mr-1 h-4 w-4" /> Skip
      </Button>
    </motion.div>
  );
}

// ========== RPE SELECTOR ==========
function RPESelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[6, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((rpe) => (
        <button
          key={rpe}
          onClick={() => onChange(rpe)}
          className={`rounded-md px-2 py-1 text-[10px] font-semibold transition-colors ${
            value === rpe
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          {rpe}
        </button>
      ))}
    </div>
  );
}

// ========== SESSION TIMER ==========
function SessionTimer({ startTime }: { startTime: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startTime).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [startTime]);

  const hrs = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;
  const isLong = elapsed > 90 * 60;

  return (
    <span className={`font-mono text-xs tabular-nums ${isLong ? 'text-destructive' : 'text-muted-foreground'}`}>
      {hrs > 0 && `${hrs}:`}{mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
      {isLong && ' ⚠️'}
    </span>
  );
}

// ========== MAIN SESSION PAGE ==========
export default function SessionPage() {
  const navigate = useNavigate();
  const {
    inProgressSession,
    updateInProgressSession,
    completeSession,
    clearInProgressSession,
    workoutPlan,
    settings,
    addHydrationEntry,
    updatePersonalRecord,
    personalRecords,
    advanceDay,
  } = useAppStore();

  const [showRest, setShowRest] = useState(false);
  const [restSeconds, setRestSeconds] = useState(90);
  const [showPR, setShowPR] = useState<string | null>(null);
  const [currentWeight, setCurrentWeight] = useState('');
  const [currentReps, setCurrentReps] = useState('');
  const [currentRPE, setCurrentRPE] = useState(8);

  // Redirect if no session
  if (!inProgressSession) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-muted-foreground">No active session</p>
        <Button onClick={() => navigate('/workout')}>Go to Workouts</Button>
      </div>
    );
  }

  const { session, currentExerciseIndex } = inProgressSession;
  const day = workoutPlan.days.find((d) => d.id === session.dayId);
  if (!day) return null;

  const exercise = day.exercises[currentExerciseIndex];
  const loggedExercise = session.exercises[currentExerciseIndex];
  const completedSets = loggedExercise?.sets?.length ?? 0;
  const totalSets = exercise.sets;
  const allSetsComplete = completedSets >= totalSets;
  const overallProgress = session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const overallTotal = day.exercises.reduce((sum, ex) => sum + ex.sets, 0);

  // Check if we should show hydration reminder (every 3-4 sets)
  const showHydrationReminder = overallProgress > 0 && overallProgress % 4 === 0;

  const handleLogSet = () => {
    const weight = parseFloat(currentWeight) || 0;
    const reps = parseInt(currentReps) || 0;
    if (reps === 0) return;

    const newSet: LoggedSet = {
      setNumber: completedSets + 1,
      weight,
      reps,
      rpe: currentRPE,
      completed: true,
      timestamp: new Date().toISOString(),
    };

    const updatedExercises = [...session.exercises];
    updatedExercises[currentExerciseIndex] = {
      ...loggedExercise,
      sets: [...loggedExercise.sets, newSet],
    };

    // Check PR
    const volume = weight * reps;
    const pr = personalRecords[exercise.id];
    let isPR = false;
    if (weight > 0) {
      if (!pr || weight > pr.bestWeight || volume > pr.bestVolume) {
        isPR = true;
        const today = new Date().toISOString().split('T')[0];
        updatePersonalRecord(exercise.id, {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          bestWeight: Math.max(weight, pr?.bestWeight ?? 0),
          bestWeightDate: weight > (pr?.bestWeight ?? 0) ? today : pr?.bestWeightDate ?? today,
          bestReps: Math.max(reps, pr?.bestReps ?? 0),
          bestRepsDate: reps > (pr?.bestReps ?? 0) ? today : pr?.bestRepsDate ?? today,
          bestVolume: Math.max(volume, pr?.bestVolume ?? 0),
          bestVolumeDate: volume > (pr?.bestVolume ?? 0) ? today : pr?.bestVolumeDate ?? today,
          history: [...(pr?.history ?? []), { date: today, weight, reps, rpe: currentRPE }],
        });
        updatedExercises[currentExerciseIndex].personalRecord = true;
        setShowPR(exercise.name);
        setTimeout(() => setShowPR(null), 2500);
      }
    }

    const totalVolume = updatedExercises.reduce(
      (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
      0
    );
    const totalSetsLogged = updatedExercises.reduce((sum, ex) => sum + ex.sets.length, 0);

    const updatedSession: WorkoutSession = {
      ...session,
      exercises: updatedExercises,
      totalVolume,
      totalSets: totalSetsLogged,
      prsHit: updatedExercises.filter((e) => e.personalRecord).length,
    };

    const updatedInProgress: InProgressSession = {
      ...inProgressSession,
      session: updatedSession,
    };

    updateInProgressSession(updatedInProgress);

    // Reset inputs
    setCurrentReps('');
    // Keep weight for next set convenience

    // Start rest timer if not last set
    if (completedSets + 1 < totalSets) {
      const overrideRest = settings.restTimerOverrides[exercise.id];
      setRestSeconds(overrideRest ?? exercise.restSeconds);
      setShowRest(true);
    }
  };

  const goToExercise = (idx: number) => {
    if (idx < 0 || idx >= day.exercises.length) return;
    updateInProgressSession({
      ...inProgressSession,
      currentExerciseIndex: idx,
    });
    setCurrentWeight('');
    setCurrentReps('');
    setCurrentRPE(8);
  };

  const handleFinishSession = () => {
    const finalSession: WorkoutSession = {
      ...session,
      endTime: new Date().toISOString(),
      completed: true,
    };
    completeSession(finalSession);
    advanceDay();
    navigate('/session/complete', { state: { session: finalSession } });
  };

  const handleAbandon = () => {
    if (confirm('Abandon this session? Your logged sets will be lost.')) {
      clearInProgressSession();
      navigate('/workout');
    }
  };

  return (
    <>
      <div className="flex min-h-screen flex-col bg-background">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-lg px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={handleAbandon} className="touch-target">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
              <div>
                <p className="text-sm font-semibold">{session.dayName}</p>
                <SessionTimer startTime={session.startTime} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {overallProgress}/{overallTotal} sets
              </span>
              <Progress value={(overallProgress / overallTotal) * 100} className="h-1.5 w-16" />
            </div>
          </div>
        </div>

        {/* Exercise Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto px-4 py-2 scrollbar-hide">
          {day.exercises.map((ex, idx) => {
            const logged = session.exercises[idx]?.sets?.length ?? 0;
            const total = ex.sets;
            const done = logged >= total;
            const active = idx === currentExerciseIndex;
            return (
              <button
                key={ex.id}
                onClick={() => goToExercise(idx)}
                className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-medium transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : done
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {idx + 1}{done && ' ✓'}
              </button>
            );
          })}
        </div>

        {/* Exercise Card */}
        <div className="flex-1 px-4 pb-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15 }}
            >
              <Card className="mt-2">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-display text-lg font-bold">{exercise.name}</h2>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {exercise.muscleGroups.map((mg) => (
                          <span key={mg} className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-accent-foreground">
                            {mg.replace('_', ' ')}
                          </span>
                        ))}
                        {exercise.type !== 'bilateral' && (
                          <Badge variant="outline" className="text-[10px]">{exercise.type}</Badge>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {exercise.sets} sets × {exercise.type === 'timed'
                          ? `${exercise.repRangeMin}-${exercise.repRangeMax}s`
                          : `${exercise.repRangeMin}-${exercise.repRangeMax} reps`}
                        {' · '}Rest {exercise.restSeconds}s
                      </p>
                    </div>
                    <Sheet>
                      <SheetTrigger asChild>
                        <button className="touch-target text-muted-foreground hover:text-foreground">
                          <Info className="h-5 w-5" />
                        </button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="rounded-t-2xl">
                        <SheetHeader>
                          <SheetTitle>{exercise.name}</SheetTitle>
                          <SheetDescription>Form Cue</SheetDescription>
                        </SheetHeader>
                        <p className="mt-4 text-sm leading-relaxed">{exercise.formCue}</p>
                      </SheetContent>
                    </Sheet>
                  </div>

                  {/* Sets progress */}
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Sets:</span>
                    {Array.from({ length: totalSets }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-2.5 w-2.5 rounded-full ${
                          i < completedSets ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {completedSets}/{totalSets}
                    </span>
                  </div>

                  {/* Logged sets table */}
                  {completedSets > 0 && (
                    <div className="mt-3 rounded-lg bg-muted/50 p-2">
                      <div className="grid grid-cols-4 gap-1 text-[10px] font-medium text-muted-foreground mb-1">
                        <span>Set</span><span>Weight</span><span>Reps</span><span>RPE</span>
                      </div>
                      {loggedExercise.sets.map((s) => (
                        <div key={s.setNumber} className="grid grid-cols-4 gap-1 text-xs py-0.5">
                          <span>{s.setNumber}</span>
                          <span>{s.weight}kg</span>
                          <span>{s.reps}</span>
                          <span>{s.rpe}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Log Set Form */}
              {!allSetsComplete && (
                <Card className="mt-3">
                  <CardContent className="p-4">
                    <p className="mb-3 text-xs font-semibold text-muted-foreground">
                      Set {completedSets + 1} of {totalSets}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground">Weight (kg)</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={currentWeight}
                          onChange={(e) => setCurrentWeight(e.target.value)}
                          className="mt-1 touch-target text-lg font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground">
                          {exercise.type === 'timed' ? 'Seconds' : 'Reps'}
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={currentReps}
                          onChange={(e) => setCurrentReps(e.target.value)}
                          className="mt-1 touch-target text-lg font-bold"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="text-[10px] font-medium text-muted-foreground">RPE</label>
                      <div className="mt-1">
                        <RPESelector value={currentRPE} onChange={setCurrentRPE} />
                      </div>
                    </div>
                    <Button
                      className="mt-4 w-full touch-target text-base font-semibold"
                      size="lg"
                      onClick={handleLogSet}
                    >
                      <Check className="mr-2 h-5 w-5" />
                      Log Set {completedSets + 1}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* All sets done for this exercise */}
              {allSetsComplete && (
                <Card className="mt-3 border-primary/30 bg-primary/5">
                  <CardContent className="flex items-center justify-center gap-2 p-4">
                    <Check className="h-5 w-5 text-primary" />
                    <span className="text-sm font-semibold text-primary">All sets complete!</span>
                  </CardContent>
                </Card>
              )}

              {/* Hydration Reminder */}
              {showHydrationReminder && (
                <Card className="mt-3 border-neon-blue/30 bg-neon-blue/5">
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-neon-blue" />
                      <span className="text-xs font-medium">Stay hydrated!</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        const today = format(new Date(), 'yyyy-MM-dd');
                        addHydrationEntry(today, {
                          id: `h_${Date.now()}`,
                          amount: 250,
                          timestamp: new Date().toISOString(),
                        });
                      }}
                    >
                      <Plus className="mr-1 h-3 w-3" /> 250ml
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-lg safe-bottom">
          <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              className="touch-target"
              disabled={currentExerciseIndex === 0}
              onClick={() => goToExercise(currentExerciseIndex - 1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Prev
            </Button>

            {currentExerciseIndex === day.exercises.length - 1 && allSetsComplete ? (
              <Button
                className="touch-target text-base font-semibold px-6"
                size="lg"
                onClick={handleFinishSession}
              >
                <Trophy className="mr-2 h-5 w-5" /> Finish
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="touch-target"
                disabled={currentExerciseIndex === day.exercises.length - 1}
                onClick={() => goToExercise(currentExerciseIndex + 1)}
              >
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Rest Timer Overlay */}
      <AnimatePresence>
        {showRest && (
          <RestTimer
            seconds={restSeconds}
            onDone={() => setShowRest(false)}
            onSkip={() => setShowRest(false)}
          />
        )}
      </AnimatePresence>

      {/* PR Celebration */}
      <AnimatePresence>
        {showPR && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Trophy className="h-16 w-16 text-neon-amber" />
            </motion.div>
            <h2 className="mt-4 font-display text-2xl font-bold text-primary">New PR!</h2>
            <p className="mt-1 text-sm text-muted-foreground">{showPR}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
