import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { getExerciseRecommendation, getRecommendationLabel } from '@/lib/progressiveOverload';
import type { WorkoutSession, LoggedExercise, InProgressSession } from '@/types/workout';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export default function WorkoutDayPage() {
  const { dayId } = useParams<{ dayId: string }>();
  const navigate = useNavigate();
  const { workoutPlan, startSession, settings } = useAppStore();
  const sessions = useAppStore((s) => s.sessions);

  const day = workoutPlan.days.find((d) => d.id === dayId);
  if (!day) return <div className="p-4">Day not found</div>;

  const handleStartSession = () => {
    const session: WorkoutSession = {
      id: `session_${Date.now()}`,
      dayId: day.id,
      dayName: day.name,
      dayNumber: day.dayNumber,
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toISOString(),
      exercises: day.exercises.map((ex): LoggedExercise => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets: [],
        personalRecord: false,
      })),
      totalVolume: 0,
      totalSets: 0,
      prsHit: 0,
      completed: false,
    };

    const inProgress: InProgressSession = {
      session,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
    };

    startSession(inProgress);
    navigate('/session');
  };

  return (
    <motion.div className="flex flex-col gap-4 p-4 pt-6" variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="flex items-center gap-3">
        <button onClick={() => navigate('/workout')} className="touch-target flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold">Day {day.dayNumber}</h1>
          <p className="text-sm text-muted-foreground">{day.name}</p>
        </div>
      </motion.div>

      {day.exercises.map((exercise, idx) => {
        const rec = getExerciseRecommendation(exercise, sessions);
        const recLabel = rec ? getRecommendationLabel(rec.recommendation) : null;

        return (
          <motion.div key={exercise.id} variants={item}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{idx + 1}</span>
                      <h3 className="text-sm font-semibold">{exercise.name}</h3>
                      {exercise.supersetPairId && (
                        <Badge variant="secondary" className="text-[10px]">SS</Badge>
                      )}
                      {exercise.type === 'unilateral' && (
                        <Badge variant="outline" className="text-[10px]">Per side</Badge>
                      )}
                      {exercise.type === 'timed' && (
                        <Badge variant="outline" className="text-[10px]">Timed</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {exercise.sets} sets × {exercise.type === 'timed'
                        ? `${exercise.repRangeMin}-${exercise.repRangeMax}s`
                        : `${exercise.repRangeMin}-${exercise.repRangeMax} reps`}
                      {' · '}Rest {exercise.restSeconds}s
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {exercise.muscleGroups.map((mg) => (
                        <span key={mg} className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-accent-foreground">
                          {mg.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                    {/* Progressive Overload Badge */}
                    {recLabel && rec && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`text-[11px] font-semibold ${recLabel.color}`}>
                          {recLabel.icon} {recLabel.label}
                        </span>
                        {rec.recommendation === 'add_weight' && (
                          <span className="text-[10px] text-muted-foreground">
                            → {rec.suggestedWeight}kg
                          </span>
                        )}
                        {rec.recommendation === 'stall' && (
                          <span className="text-[10px] text-muted-foreground">
                            Try variation or deload
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <Sheet>
                    <SheetTrigger asChild>
                      <button className="touch-target flex items-center justify-center text-muted-foreground hover:text-foreground">
                        <Info className="h-4 w-4" />
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
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      <motion.div variants={item} className="sticky bottom-20 pt-2">
        <Button className="w-full touch-target text-base font-semibold" size="lg" onClick={handleStartSession}>
          <Play className="mr-2 h-5 w-5" /> Start Session
        </Button>
      </motion.div>
    </motion.div>
  );
}
