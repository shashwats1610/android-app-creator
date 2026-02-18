import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger,
} from '@/components/ui/sheet';
import {
  ChevronLeft, ChevronRight, Check, Timer, Info, Droplets, Plus, Minus,
  SkipForward, X, Trophy, AlertCircle, MessageSquare, Calculator,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { CircularProgress } from '@/components/CircularProgress';
import { getExerciseRecommendation, getRecommendationLabel } from '@/lib/progressiveOverload';
import { PlateCalculator } from '@/components/PlateCalculator';
import type { LoggedSet, WorkoutSession, InProgressSession } from '@/types/workout';

// ========== REST TIMER ==========
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
    if (remaining <= 0) return;
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  useEffect(() => {
    if (remaining <= 0) {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      onDone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

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
      <p className="mb-6 text-sm font-medium text-muted-foreground">Rest Timer</p>
      <CircularProgress value={pct} size={180} strokeWidth={6}>
        <p className="font-display text-5xl font-bold tabular-nums">
          {mins}:{secs.toString().padStart(2, '0')}
        </p>
      </CircularProgress>
      <div className="mt-8 flex items-center gap-3">
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
    <div className="flex flex-wrap gap-1">
      {[6, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((rpe) => (
        <button
          key={rpe}
          type="button"
          onClick={() => onChange(rpe)}
          className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors active:scale-95 ${
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

// ========== CONFETTI ==========
function ConfettiParticles() {
  const colors = ['hsl(var(--primary))', 'hsl(var(--neon-amber))', 'hsl(var(--neon-blue))', 'hsl(var(--neon-purple))'];
  return (
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          className="animate-confetti absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            width: `${6 + Math.random() * 6}px`,
            height: `${6 + Math.random() * 6}px`,
            backgroundColor: colors[i % colors.length],
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${1.5 + Math.random() * 1.5}s`,
          }}
        />
      ))}
    </div>
  );
}

// ========== MAIN SESSION PAGE ==========
export default function SessionPage() {
  const navigate = useNavigate();

  const inProgressSession = useAppStore((s) => s.inProgressSession);
  const workoutPlan = useAppStore((s) => s.workoutPlan);
  const settings = useAppStore((s) => s.settings);
  const personalRecords = useAppStore((s) => s.personalRecords);

  const updateInProgressSession = useAppStore((s) => s.updateInProgressSession);
  const completeSession = useAppStore((s) => s.completeSession);
  const clearInProgressSession = useAppStore((s) => s.clearInProgressSession);
  const addHydrationEntry = useAppStore((s) => s.addHydrationEntry);
  const updatePersonalRecord = useAppStore((s) => s.updatePersonalRecord);
  const advanceDay = useAppStore((s) => s.advanceDay);

  const [showRest, setShowRest] = useState(false);
  const [restSeconds, setRestSeconds] = useState(90);
  const [showPR, setShowPR] = useState<string | null>(null);
  const [currentWeight, setCurrentWeight] = useState(() => {
    const state = useAppStore.getState();
    if (!state.inProgressSession) return '';
    const { session } = state.inProgressSession;
    const dayData = state.workoutPlan.days.find(d => d.id === session.dayId);
    const ex = dayData?.exercises[state.inProgressSession.currentExerciseIndex];
    if (!ex || ex.type === 'bodyweight') return '';
    const lastSess = state.sessions.find(s => s.dayId === session.dayId);
    const lastEx = lastSess?.exercises.find(e => e.exerciseId === ex.id);
    return lastEx?.sets?.[0]?.weight ? String(lastEx.sets[0].weight) : '';
  });
  const [currentReps, setCurrentReps] = useState('');
  const [currentRPE, setCurrentRPE] = useState<number>(8);
  const [validationError, setValidationError] = useState('');
  const [justLoggedSet, setJustLoggedSet] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [showPlateCalc, setShowPlateCalc] = useState(false);

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
  if (!day) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-muted-foreground">Workout day not found</p>
        <Button onClick={() => { clearInProgressSession(); navigate('/workout'); }}>Go to Workouts</Button>
      </div>
    );
  }

  const exercise = day.exercises[currentExerciseIndex];
  const loggedExercise = session.exercises[currentExerciseIndex];
  const completedSets = loggedExercise?.sets?.length ?? 0;
  const totalSets = exercise.sets;
  const allSetsComplete = completedSets >= totalSets;
  const overallProgress = session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const overallTotal = day.exercises.reduce((sum, ex) => sum + ex.sets, 0);

  const isBodyweight = exercise.type === 'bodyweight';
  const isTimed = exercise.type === 'timed';
  const isUnilateral = exercise.type === 'unilateral';

  const showHydrationReminder = overallProgress > 0 && overallProgress % 4 === 0 && !allSetsComplete;

  // Progressive overload recommendation
  const recommendation = getExerciseRecommendation(exercise, useAppStore.getState().sessions);
  const recLabel = recommendation ? getRecommendationLabel(recommendation.recommendation) : null;

  // Last session data (per-set matching)
  const lastSessionForDay = useAppStore.getState().sessions.find((s) => s.dayId === session.dayId);
  const lastLoggedExercise = lastSessionForDay?.exercises.find((e) => e.exerciseId === exercise.id);
  const lastSetForCurrentSet = lastLoggedExercise?.sets?.[completedSets] ?? lastLoggedExercise?.sets?.[lastLoggedExercise.sets.length - 1];
  const lastSetWeight = lastSetForCurrentSet?.weight;
  const lastSetReps = lastSetForCurrentSet?.reps;

  const handleLogSet = () => {
    setValidationError('');

    const weight = parseFloat(currentWeight) || 0;
    const reps = parseInt(currentReps) || 0;

    if (!isTimed && !isBodyweight && weight <= 0) {
      setValidationError('Enter weight (kg)');
      return;
    }
    if (isTimed && reps <= 0) {
      setValidationError('Enter duration (seconds)');
      return;
    }
    if (!isTimed && reps <= 0) {
      setValidationError('Enter reps');
      return;
    }
    if (!isTimed && reps > 100) {
      setValidationError('Reps seem too high — double check');
      return;
    }
    if (!isBodyweight && !isTimed && weight > 500) {
      setValidationError('Weight seems too high — double check');
      return;
    }

    const latest = useAppStore.getState().inProgressSession;
    if (!latest) return;

    const latestLoggedExercise = latest.session.exercises[currentExerciseIndex];
    const latestCompletedSets = latestLoggedExercise?.sets?.length ?? 0;

    const newSet: LoggedSet = {
      setNumber: latestCompletedSets + 1,
      weight: isBodyweight ? 0 : weight,
      reps,
      rpe: currentRPE,
      completed: true,
      timestamp: new Date().toISOString(),
    };

    const updatedExercises = [...latest.session.exercises];
    updatedExercises[currentExerciseIndex] = {
      ...latestLoggedExercise,
      sets: [...latestLoggedExercise.sets, newSet],
    };

    // Check PR
    const volume = newSet.weight * newSet.reps;
    if (newSet.weight > 0) {
      const pr = useAppStore.getState().personalRecords[exercise.id];
      if (!pr || newSet.weight > pr.bestWeight || volume > pr.bestVolume || newSet.reps > pr.bestReps) {
        const today = new Date().toISOString().split('T')[0];
        updatePersonalRecord(exercise.id, {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          bestWeight: Math.max(newSet.weight, pr?.bestWeight ?? 0),
          bestWeightDate: newSet.weight > (pr?.bestWeight ?? 0) ? today : pr?.bestWeightDate ?? today,
          bestReps: Math.max(newSet.reps, pr?.bestReps ?? 0),
          bestRepsDate: newSet.reps > (pr?.bestReps ?? 0) ? today : pr?.bestRepsDate ?? today,
          bestVolume: Math.max(volume, pr?.bestVolume ?? 0),
          bestVolumeDate: volume > (pr?.bestVolume ?? 0) ? today : pr?.bestVolumeDate ?? today,
          history: [...(pr?.history ?? []), { date: today, weight: newSet.weight, reps: newSet.reps, rpe: currentRPE }],
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
      ...latest.session,
      exercises: updatedExercises,
      totalVolume,
      totalSets: totalSetsLogged,
      prsHit: updatedExercises.filter((e) => e.personalRecord).length,
    };

    updateInProgressSession({
      ...latest,
      session: updatedSession,
    });

    setCurrentReps('');
    setValidationError('');

    // Auto-fill weight for next set from last session
    const nextSetIdx = latestCompletedSets + 1;
    const nextLastSet = lastLoggedExercise?.sets?.[nextSetIdx] ?? lastLoggedExercise?.sets?.[lastLoggedExercise.sets.length - 1];
    if (nextLastSet && !isBodyweight) {
      setCurrentWeight(String(nextLastSet.weight));
    }

    setJustLoggedSet(true);
    setTimeout(() => setJustLoggedSet(false), 400);

    if (navigator.vibrate) navigator.vibrate(50);

    if (latestCompletedSets + 1 < totalSets) {
      const overrideRest = settings.restTimerOverrides[exercise.id];
      setRestSeconds(overrideRest ?? exercise.restSeconds);
      setShowRest(true);
    }
  };

  const goToExercise = (idx: number) => {
    if (idx < 0 || idx >= day.exercises.length) return;
    const latest = useAppStore.getState().inProgressSession;
    if (!latest) return;
    updateInProgressSession({
      ...latest,
      currentExerciseIndex: idx,
    });
    // Auto-fill weight from last session
    const nextExercise = day.exercises[idx];
    const lastSess = useAppStore.getState().sessions.find(s => s.dayId === session.dayId);
    const lastEx = lastSess?.exercises.find(e => e.exerciseId === nextExercise.id);
    const lastW = lastEx?.sets?.[0]?.weight;
    setCurrentWeight(nextExercise.type !== 'bodyweight' && lastW ? String(lastW) : '');
    setCurrentReps('');
    setCurrentRPE(8);
    setValidationError('');
  };

  const handleFinishSession = () => {
    const latest = useAppStore.getState().inProgressSession;
    if (!latest) return;
    const finalSession: WorkoutSession = {
      ...latest.session,
      endTime: new Date().toISOString(),
      completed: true,
      notes: sessionNotes || undefined,
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
              <button type="button" onClick={handleAbandon} className="touch-target" aria-label="Abandon session">
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
              <Progress
                value={overallTotal > 0 ? (overallProgress / overallTotal) * 100 : 0}
                className="h-1.5 w-16"
                role="progressbar"
                aria-valuenow={overallProgress}
                aria-valuemax={overallTotal}
                aria-label="Session progress"
              />
            </div>
          </div>
        </div>

        {/* Exercise Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto px-4 py-2 scrollbar-hide">
          {day.exercises.map((ex, idx) => {
            const logged = session.exercises[idx]?.sets?.length ?? 0;
            const total = ex.sets;
            const done = logged >= total;
            const active = idx === currentExerciseIndex;
            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => goToExercise(idx)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all active:scale-95 ${
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
              key={`${exercise.id}-${currentExerciseIndex}`}
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
                          <span key={mg} className="rounded bg-accent px-1.5 py-0.5 text-[11px] text-accent-foreground">
                            {mg.replace('_', ' ')}
                          </span>
                        ))}
                        {isUnilateral && <Badge variant="outline" className="text-[11px]">Per side</Badge>}
                        {isTimed && <Badge variant="outline" className="text-[11px]">Timed</Badge>}
                        {isBodyweight && <Badge variant="outline" className="text-[11px]">Bodyweight</Badge>}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {exercise.sets} sets × {isTimed
                          ? `${exercise.repRangeMin}-${exercise.repRangeMax}s`
                          : `${exercise.repRangeMin}-${exercise.repRangeMax} reps`}
                        {' · '}Rest {exercise.restSeconds}s
                      </p>
                      {lastSetWeight !== undefined && (
                        <p className="mt-1 text-[11px] text-primary/70">
                          Last session: {lastSetWeight}kg × {lastSetReps} reps
                        </p>
                      )}
                      {/* Progressive Overload Recommendation */}
                      {recLabel && recommendation && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`text-xs font-semibold ${recLabel.color}`}>
                            {recLabel.icon} {recLabel.label}
                          </span>
                          {recommendation.recommendation === 'add_weight' && (
                            <span className="text-[11px] text-muted-foreground">
                              Suggested: {recommendation.suggestedWeight}kg
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <Sheet>
                      <SheetTrigger asChild>
                        <button type="button" className="touch-target text-muted-foreground hover:text-foreground" aria-label="Exercise info">
                          <Info className="h-5 w-5" />
                        </button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="rounded-t-2xl">
                        <SheetHeader>
                          <SheetTitle>{exercise.name}</SheetTitle>
                          <SheetDescription>Form Cue</SheetDescription>
                        </SheetHeader>
                        <p className="mt-4 text-sm leading-relaxed">{exercise.formCue}</p>
                        {exercise.notes && (
                          <p className="mt-2 text-xs text-muted-foreground italic">{exercise.notes}</p>
                        )}
                      </SheetContent>
                    </Sheet>
                  </div>

                  {/* Sets progress dots */}
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Sets:</span>
                    {Array.from({ length: totalSets }).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={
                          justLoggedSet && i === completedSets - 1
                            ? { scale: [1, 1.5, 1] }
                            : {}
                        }
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        className={`h-2.5 w-2.5 rounded-full transition-colors ${
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
                      <div className={`grid gap-1 text-[11px] font-medium text-muted-foreground mb-1 ${isBodyweight ? 'grid-cols-3' : 'grid-cols-4'}`}>
                        <span>Set</span>
                        {!isBodyweight && <span>Weight</span>}
                        <span>{isTimed ? 'Secs' : 'Reps'}</span>
                        <span>RPE</span>
                      </div>
                      {loggedExercise.sets.map((s, i) => {
                        const lastSet = lastLoggedExercise?.sets?.[i];
                        const beat = lastSet && (s.weight > lastSet.weight || (s.weight === lastSet.weight && s.reps > lastSet.reps));
                        return (
                          <div key={s.setNumber} className={`grid gap-1 text-xs py-0.5 ${isBodyweight ? 'grid-cols-3' : 'grid-cols-4'} ${beat ? 'text-primary font-semibold' : ''}`}>
                            <span>{s.setNumber} {beat && '🟢'}</span>
                            {!isBodyweight && <span>{s.weight}kg</span>}
                            <span>{s.reps}</span>
                            <span>{s.rpe}</span>
                          </div>
                        );
                      })}
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
                      {isUnilateral && ' (each side)'}
                    </p>

                    <div className={`grid gap-3 ${isBodyweight ? 'grid-cols-1' : 'grid-cols-2'}`}>
                      {!isBodyweight && (
                        <div>
                          <label className="text-[11px] font-medium text-muted-foreground">Weight (kg)</label>
                          <div className="mt-1 flex gap-1">
                            <Input
                              type="number"
                              inputMode="decimal"
                              placeholder={lastSetWeight ? `Last: ${lastSetWeight}` : '0'}
                              value={currentWeight}
                              onChange={(e) => { setCurrentWeight(e.target.value); setValidationError(''); }}
                              className="touch-target text-lg font-bold flex-1"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="touch-target shrink-0"
                              type="button"
                              onClick={() => setShowPlateCalc(true)}
                              aria-label="Plate calculator"
                            >
                              <Calculator className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="text-[11px] font-medium text-muted-foreground">
                          {isTimed ? 'Duration (seconds)' : 'Reps'}
                        </label>
                        <Input
                          type="number"
                          inputMode="numeric"
                          placeholder={
                            isTimed
                              ? `${exercise.repRangeMin}-${exercise.repRangeMax}s`
                              : lastSetReps
                              ? `Last: ${lastSetReps}`
                              : `${exercise.repRangeMin}-${exercise.repRangeMax}`
                          }
                          value={currentReps}
                          onChange={(e) => { setCurrentReps(e.target.value); setValidationError(''); }}
                          className="mt-1 touch-target text-lg font-bold"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="text-[11px] font-medium text-muted-foreground">RPE (Rate of Perceived Exertion)</label>
                      <div className="mt-1.5">
                        <RPESelector value={currentRPE} onChange={setCurrentRPE} />
                      </div>
                    </div>

                    {validationError && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2">
                        <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                        <span className="text-xs text-destructive font-medium">{validationError}</span>
                      </div>
                    )}

                    {!isTimed && (
                      <p className="mt-2 text-[11px] text-muted-foreground text-center">
                        Target: {exercise.repRangeMin}–{exercise.repRangeMax} reps
                        {isUnilateral && ' per side'}
                      </p>
                    )}

                    <Button
                      className="mt-4 w-full touch-target text-base font-semibold active:scale-[0.98] transition-transform"
                      size="lg"
                      type="button"
                      onClick={handleLogSet}
                    >
                      <Check className="mr-2 h-5 w-5" />
                      Log Set {completedSets + 1}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* All sets done */}
              {allSetsComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Card className="mt-3 border-primary/30 bg-primary/5">
                    <CardContent className="flex items-center justify-center gap-2 p-4">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-sm font-semibold text-primary">All sets complete!</span>
                    </CardContent>
                  </Card>
                </motion.div>
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
                      type="button"
                      onClick={() => {
                        addHydrationEntry(format(new Date(), 'yyyy-MM-dd'), {
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

              {/* Session Notes */}
              <Collapsible className="mt-3">
                <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-left text-xs font-medium text-muted-foreground hover:bg-muted/70 transition-colors">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Session Notes
                  {sessionNotes && <span className="ml-auto text-[10px] text-primary">●</span>}
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <Textarea
                    placeholder="How's the session going? Any notes for next time..."
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    className="min-h-[60px] text-xs"
                  />
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-lg safe-bottom">
          <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              className="touch-target active:scale-95 transition-transform"
              type="button"
              disabled={currentExerciseIndex === 0}
              onClick={() => goToExercise(currentExerciseIndex - 1)}
              aria-label="Previous exercise"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Prev
            </Button>

            {currentExerciseIndex === day.exercises.length - 1 && allSetsComplete ? (
              <Button
                className="touch-target text-base font-semibold px-6 active:scale-[0.98] transition-transform"
                size="lg"
                type="button"
                onClick={handleFinishSession}
              >
                <Trophy className="mr-2 h-5 w-5" /> Finish
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="touch-target active:scale-95 transition-transform"
                type="button"
                disabled={currentExerciseIndex === day.exercises.length - 1}
                onClick={() => goToExercise(currentExerciseIndex + 1)}
                aria-label="Next exercise"
              >
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Plate Calculator */}
      <PlateCalculator
        weight={parseFloat(currentWeight) || 0}
        open={showPlateCalc}
        onOpenChange={setShowPlateCalc}
      />

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

      {/* PR Celebration with Confetti */}
      <AnimatePresence>
        {showPR && (
          <>
            <ConfettiParticles />
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm"
              onClick={() => setShowPR(null)}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6 }}
              >
                <Trophy className="h-16 w-16 text-neon-amber" />
              </motion.div>
              <h2 className="mt-4 font-display text-2xl font-bold text-primary neon-glow">New PR! 🎉</h2>
              <p className="mt-1 text-sm text-muted-foreground">{showPR}</p>
              <p className="mt-4 text-xs text-muted-foreground">Tap to dismiss</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
