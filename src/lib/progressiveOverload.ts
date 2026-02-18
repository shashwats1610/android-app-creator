import type { WorkoutSession, Exercise, ExerciseRecommendation, OverloadRecommendation } from '@/types/workout';

const LOWER_MUSCLES = ['quads', 'hamstrings', 'glutes', 'calves'];

export function getExerciseRecommendation(
  exercise: Exercise,
  sessions: WorkoutSession[],
): ExerciseRecommendation | null {
  const relevantSessions = sessions
    .filter(s => s.exercises.some(e => e.exerciseId === exercise.id))
    .slice(0, 3);

  if (relevantSessions.length === 0) return null;

  const lastSession = relevantSessions[0];
  const lastExercise = lastSession.exercises.find(e => e.exerciseId === exercise.id);
  if (!lastExercise || lastExercise.sets.length === 0) return null;

  const lastSets = lastExercise.sets.filter(s => s.completed);
  if (lastSets.length === 0) return null;

  const avgWeight = lastSets.reduce((s, set) => s + set.weight, 0) / lastSets.length;
  const avgReps = lastSets.reduce((s, set) => s + set.reps, 0) / lastSets.length;
  const avgRpe = lastSets.reduce((s, set) => s + set.rpe, 0) / lastSets.length;

  const isLower = exercise.muscleGroups.some(mg => LOWER_MUSCLES.includes(mg));
  const increment = isLower ? 5 : 2.5;

  const hitTopOfRange = avgReps >= exercise.repRangeMax;
  const hitRange = avgReps >= exercise.repRangeMin;

  let recommendation: OverloadRecommendation;
  let suggestedWeight = avgWeight;

  if (hitTopOfRange && avgRpe < 9) {
    recommendation = 'add_weight';
    suggestedWeight = avgWeight + increment;
  } else if (hitRange && avgRpe >= 9) {
    recommendation = 'maintain';
  } else if (!hitRange) {
    recommendation = 'consolidate';
  } else {
    recommendation = 'maintain';
  }

  // Check for stall across 3+ sessions at same weight
  if (relevantSessions.length >= 3) {
    const weights = relevantSessions.map(s => {
      const ex = s.exercises.find(e => e.exerciseId === exercise.id);
      return ex?.sets[0]?.weight ?? 0;
    });
    if (weights.every(w => w === weights[0]) && recommendation !== 'add_weight') {
      recommendation = 'stall';
    }
  }

  return {
    exerciseId: exercise.id,
    recommendation,
    suggestedWeight: Math.round(suggestedWeight * 4) / 4,
    suggestedReps: Math.round(avgReps),
    lastSessionWeight: avgWeight,
    lastSessionReps: Math.round(avgReps),
    lastSessionRpe: Math.round(avgRpe * 10) / 10,
  };
}

export function getRecommendationLabel(rec: OverloadRecommendation): {
  label: string;
  color: string;
  icon: string;
} {
  switch (rec) {
    case 'add_weight':
      return { label: 'Add Weight', color: 'text-green-500', icon: '↑' };
    case 'maintain':
      return { label: 'Maintain', color: 'text-primary', icon: '→' };
    case 'consolidate':
      return { label: 'Consolidate', color: 'text-neon-amber', icon: '↓' };
    case 'stall':
      return { label: 'Plateau', color: 'text-destructive', icon: '⚠' };
  }
}
