import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ChevronRight, Plus, Trash2, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { WorkoutDay, MuscleGroup } from '@/types/workout';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export default function EditPlanPage() {
  const navigate = useNavigate();
  const { workoutPlan, addWorkoutDay, removeWorkoutDay, updateWorkoutDay, reorderWorkoutDays } = useAppStore();

  const handleAddDay = () => {
    const newDay: WorkoutDay = {
      id: `day_${Date.now()}`,
      dayNumber: workoutPlan.days.length + 1,
      name: `New Day ${workoutPlan.days.length + 1}`,
      focusMuscles: [],
      exercises: [],
    };
    addWorkoutDay(newDay);
  };

  const handleMoveDay = (idx: number, dir: -1 | 1) => {
    const ids = workoutPlan.days.map((d) => d.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= ids.length) return;
    [ids[idx], ids[swapIdx]] = [ids[swapIdx], ids[idx]];
    reorderWorkoutDays(ids);
  };

  return (
    <motion.div className="flex flex-col gap-4 p-4 pt-6" variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="touch-target flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold">Edit Workout Plan</h1>
          <p className="text-xs text-muted-foreground">{workoutPlan.days.length} days</p>
        </div>
      </motion.div>

      {workoutPlan.days.map((day, idx) => (
        <motion.div key={day.id} variants={item}>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => handleMoveDay(idx, -1)}
                    disabled={idx === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-20 text-xs"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => handleMoveDay(idx, 1)}
                    disabled={idx === workoutPlan.days.length - 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-20 text-xs"
                  >
                    ▼
                  </button>
                </div>
                <div
                  className="flex flex-1 cursor-pointer items-center gap-3"
                  onClick={() => navigate(`/workout/edit/day/${day.id}`)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-sm font-bold text-primary">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{day.name}</p>
                    <p className="text-[10px] text-muted-foreground">{day.exercises.length} exercises</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${day.name}"?`)) removeWorkoutDay(day.id);
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
        <Button variant="outline" className="w-full touch-target" onClick={handleAddDay}>
          <Plus className="mr-2 h-4 w-4" /> Add Day
        </Button>
      </motion.div>
    </motion.div>
  );
}
