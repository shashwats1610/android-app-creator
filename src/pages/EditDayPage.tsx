import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Trash2, Pencil, X, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Exercise, ExerciseType, MuscleGroup } from '@/types/workout';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

const allMuscleGroups: MuscleGroup[] = [
  'quads', 'hamstrings', 'glutes', 'calves',
  'chest', 'front_delts', 'side_delts', 'rear_delts',
  'lats', 'upper_back', 'traps', 'lower_back',
  'biceps', 'triceps', 'forearms', 'abs', 'obliques',
];

const exerciseTypes: { value: ExerciseType; label: string }[] = [
  { value: 'bilateral', label: 'Bilateral' },
  { value: 'unilateral', label: 'Unilateral (per side)' },
  { value: 'timed', label: 'Timed' },
  { value: 'bodyweight', label: 'Bodyweight' },
];

export default function EditDayPage() {
  const { dayId } = useParams<{ dayId: string }>();
  const navigate = useNavigate();
  const { workoutPlan, updateWorkoutDay, updateExercise, addExercise, removeExercise, reorderExercises } = useAppStore();

  const day = workoutPlan.days.find((d) => d.id === dayId);
  const [editingDayName, setEditingDayName] = useState(false);
  const [dayName, setDayName] = useState(day?.name ?? '');
  const [editExercise, setEditExercise] = useState<Exercise | null>(null);

  if (!day) return <div className="p-4">Day not found</div>;

  const handleSaveDayName = () => {
    updateWorkoutDay(day.id, { name: dayName });
    setEditingDayName(false);
  };

  const handleMoveExercise = (idx: number, dir: -1 | 1) => {
    const ids = day.exercises.map((ex) => ex.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= ids.length) return;
    [ids[idx], ids[swapIdx]] = [ids[swapIdx], ids[idx]];
    reorderExercises(day.id, ids);
  };

  const handleAddExercise = () => {
    const newEx: Exercise = {
      id: `ex_custom_${Date.now()}`,
      name: 'New Exercise',
      muscleGroups: [],
      type: 'bilateral',
      sets: 3,
      repRangeMin: 8,
      repRangeMax: 12,
      restSeconds: 90,
      formCue: '',
    };
    addExercise(day.id, newEx);
    setEditExercise(newEx);
  };

  const handleSaveExercise = (ex: Exercise) => {
    updateExercise(day.id, ex.id, ex);
    setEditExercise(null);
  };

  return (
    <>
      <motion.div className="flex flex-col gap-4 p-4 pt-6" variants={container} initial="hidden" animate="show">
        <motion.div variants={item} className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="touch-target flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            {editingDayName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={dayName}
                  onChange={(e) => setDayName(e.target.value)}
                  className="h-8 text-sm font-bold"
                  autoFocus
                />
                <button onClick={handleSaveDayName} className="text-primary"><Check className="h-4 w-4" /></button>
                <button onClick={() => setEditingDayName(false)} className="text-muted-foreground"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-bold">{day.name}</h1>
                <button onClick={() => { setDayName(day.name); setEditingDayName(true); }} className="text-muted-foreground hover:text-foreground">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">{day.exercises.length} exercises · Tap to edit</p>
          </div>
        </motion.div>

        {day.exercises.map((exercise, idx) => (
          <motion.div key={exercise.id} variants={item}>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleMoveExercise(idx, -1)}
                      disabled={idx === 0}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-20 text-xs"
                    >▲</button>
                    <button
                      onClick={() => handleMoveExercise(idx, 1)}
                      disabled={idx === day.exercises.length - 1}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-20 text-xs"
                    >▼</button>
                  </div>
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setEditExercise({ ...exercise })}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{idx + 1}</span>
                      <h3 className="text-sm font-semibold">{exercise.name}</h3>
                      {exercise.type !== 'bilateral' && (
                        <Badge variant="outline" className="text-[10px]">{exercise.type}</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {exercise.sets}×{exercise.repRangeMin}-{exercise.repRangeMax} · Rest {exercise.restSeconds}s
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Remove "${exercise.name}"?`)) removeExercise(day.id, exercise.id);
                    }}
                    className="touch-target flex items-center justify-center text-destructive/60 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        <motion.div variants={item}>
          <Button variant="outline" className="w-full touch-target" onClick={handleAddExercise}>
            <Plus className="mr-2 h-4 w-4" /> Add Exercise
          </Button>
        </motion.div>
      </motion.div>

      {/* Exercise Edit Sheet */}
      <ExerciseEditSheet
        exercise={editExercise}
        onSave={handleSaveExercise}
        onClose={() => setEditExercise(null)}
      />
    </>
  );
}

function ExerciseEditSheet({
  exercise,
  onSave,
  onClose,
}: {
  exercise: Exercise | null;
  onSave: (ex: Exercise) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Exercise | null>(null);

  // Sync form when exercise changes
  if (exercise && (!form || form.id !== exercise.id)) {
    // We use a timeout to avoid setState during render
    setTimeout(() => setForm({ ...exercise }), 0);
  }

  if (!exercise || !form) return null;

  const update = <K extends keyof Exercise>(key: K, value: Exercise[K]) => {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  };

  const toggleMuscle = (mg: MuscleGroup) => {
    setForm((f) => {
      if (!f) return f;
      const has = f.muscleGroups.includes(mg);
      return {
        ...f,
        muscleGroups: has ? f.muscleGroups.filter((m) => m !== mg) : [...f.muscleGroups, mg],
      };
    });
  };

  return (
    <Sheet open={!!exercise} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Edit Exercise</SheetTitle>
          <SheetDescription>Modify exercise parameters</SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Name</label>
            <Input value={form.name} onChange={(e) => update('name', e.target.value)} className="mt-1 touch-target" />
          </div>

          {/* Type */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Type</label>
            <Select value={form.type} onValueChange={(v) => update('type', v as ExerciseType)}>
              <SelectTrigger className="mt-1 touch-target">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {exerciseTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sets / Reps / Rest */}
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="text-[10px] font-medium text-muted-foreground">Sets</label>
              <Input type="number" value={form.sets} onChange={(e) => update('sets', Number(e.target.value))} className="mt-1 h-9 text-sm" />
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground">Min Reps</label>
              <Input type="number" value={form.repRangeMin} onChange={(e) => update('repRangeMin', Number(e.target.value))} className="mt-1 h-9 text-sm" />
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground">Max Reps</label>
              <Input type="number" value={form.repRangeMax} onChange={(e) => update('repRangeMax', Number(e.target.value))} className="mt-1 h-9 text-sm" />
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground">Rest (s)</label>
              <Input type="number" value={form.restSeconds} onChange={(e) => update('restSeconds', Number(e.target.value))} className="mt-1 h-9 text-sm" />
            </div>
          </div>

          {/* Muscle Groups */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Muscle Groups</label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {allMuscleGroups.map((mg) => (
                <button
                  key={mg}
                  onClick={() => toggleMuscle(mg)}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                    form.muscleGroups.includes(mg)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {mg.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Form Cue */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Form Cue</label>
            <Textarea
              value={form.formCue}
              onChange={(e) => update('formCue', e.target.value)}
              className="mt-1"
              rows={3}
              placeholder="Describe proper form..."
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
            <Input value={form.notes ?? ''} onChange={(e) => update('notes', e.target.value)} className="mt-1 touch-target" placeholder="e.g. superset partner, tempo..." />
          </div>

          {/* Save */}
          <Button className="touch-target text-base font-semibold" size="lg" onClick={() => onSave(form)}>
            Save Exercise
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
