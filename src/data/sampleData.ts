import { format, subDays } from 'date-fns';
import type {
  WorkoutSession,
  PersonalRecord,
  BodyMeasurement,
  DailyNutrition,
  DailyHydration,
  FoodItem,
  EstimatedMaxes,
  MacroTargets,
} from '@/types/workout';

const now = new Date();
const today = format(now, 'yyyy-MM-dd');
const yesterday = format(subDays(now, 1), 'yyyy-MM-dd');
const twoDaysAgo = format(subDays(now, 2), 'yyyy-MM-dd');
const fourDaysAgo = format(subDays(now, 4), 'yyyy-MM-dd');

// ========== SESSIONS ==========
export const sampleSessions: WorkoutSession[] = [
  {
    id: 'sample_sess_1',
    dayId: 'day_1',
    dayName: 'Legs — Quad Focus + Abs',
    dayNumber: 1,
    date: yesterday,
    startTime: new Date(subDays(now, 1).setHours(7, 0)).toISOString(),
    endTime: new Date(subDays(now, 1).setHours(8, 25)).toISOString(),
    exercises: [
      {
        exerciseId: 'ex_1', exerciseName: 'Back Squat', personalRecord: true,
        sets: [
          { setNumber: 1, weight: 100, reps: 8, rpe: 7, completed: true, timestamp: new Date().toISOString() },
          { setNumber: 2, weight: 105, reps: 7, rpe: 8, completed: true, timestamp: new Date().toISOString() },
          { setNumber: 3, weight: 105, reps: 6, rpe: 8.5, completed: true, timestamp: new Date().toISOString() },
          { setNumber: 4, weight: 105, reps: 6, rpe: 9, completed: true, timestamp: new Date().toISOString() },
        ],
      },
      {
        exerciseId: 'ex_2', exerciseName: 'Hack Squat', personalRecord: false,
        sets: [
          { setNumber: 1, weight: 80, reps: 10, rpe: 7, completed: true, timestamp: new Date().toISOString() },
          { setNumber: 2, weight: 80, reps: 9, rpe: 8, completed: true, timestamp: new Date().toISOString() },
          { setNumber: 3, weight: 80, reps: 8, rpe: 8.5, completed: true, timestamp: new Date().toISOString() },
        ],
      },
      {
        exerciseId: 'ex_3', exerciseName: 'Leg Press', personalRecord: false,
        sets: [
          { setNumber: 1, weight: 180, reps: 12, rpe: 7, completed: true, timestamp: new Date().toISOString() },
          { setNumber: 2, weight: 180, reps: 11, rpe: 8, completed: true, timestamp: new Date().toISOString() },
          { setNumber: 3, weight: 200, reps: 10, rpe: 9, completed: true, timestamp: new Date().toISOString() },
        ],
      },
    ],
    totalVolume: 8760,
    totalSets: 10,
    prsHit: 1,
    completed: true,
  },
  {
    id: 'sample_sess_2',
    dayId: 'day_2',
    dayName: 'Push — Chest/Shoulders/Triceps + Abs',
    dayNumber: 2,
    date: twoDaysAgo,
    startTime: new Date(subDays(now, 2).setHours(6, 30)).toISOString(),
    endTime: new Date(subDays(now, 2).setHours(7, 50)).toISOString(),
    exercises: [
      {
        exerciseId: 'ex_10', exerciseName: 'Flat Barbell Bench Press', personalRecord: true,
        sets: [
          { setNumber: 1, weight: 80, reps: 8, rpe: 7, completed: true, timestamp: new Date().toISOString() },
          { setNumber: 2, weight: 85, reps: 7, rpe: 8, completed: true, timestamp: new Date().toISOString() },
          { setNumber: 3, weight: 85, reps: 6, rpe: 9, completed: true, timestamp: new Date().toISOString() },
          { setNumber: 4, weight: 85, reps: 6, rpe: 9, completed: true, timestamp: new Date().toISOString() },
        ],
      },
      {
        exerciseId: 'ex_13', exerciseName: 'Overhead Press (Barbell)', personalRecord: false,
        sets: [
          { setNumber: 1, weight: 50, reps: 8, rpe: 7, completed: true, timestamp: new Date().toISOString() },
          { setNumber: 2, weight: 52.5, reps: 7, rpe: 8, completed: true, timestamp: new Date().toISOString() },
          { setNumber: 3, weight: 52.5, reps: 6, rpe: 9, completed: true, timestamp: new Date().toISOString() },
        ],
      },
    ],
    totalVolume: 5925,
    totalSets: 7,
    prsHit: 1,
    completed: true,
  },
  {
    id: 'sample_sess_3',
    dayId: 'day_3',
    dayName: 'Pull — Back/Biceps + Abs',
    dayNumber: 3,
    date: fourDaysAgo,
    startTime: new Date(subDays(now, 4).setHours(7, 15)).toISOString(),
    endTime: new Date(subDays(now, 4).setHours(8, 35)).toISOString(),
    exercises: [
      {
        exerciseId: 'ex_19', exerciseName: 'Barbell Row (Overhand)', personalRecord: false,
        sets: [
          { setNumber: 1, weight: 70, reps: 8, rpe: 7, completed: true, timestamp: new Date().toISOString() },
          { setNumber: 2, weight: 75, reps: 7, rpe: 8, completed: true, timestamp: new Date().toISOString() },
          { setNumber: 3, weight: 75, reps: 7, rpe: 8.5, completed: true, timestamp: new Date().toISOString() },
          { setNumber: 4, weight: 75, reps: 6, rpe: 9, completed: true, timestamp: new Date().toISOString() },
        ],
      },
    ],
    totalVolume: 4235,
    totalSets: 4,
    prsHit: 0,
    completed: true,
  },
];

// ========== PERSONAL RECORDS ==========
export const samplePersonalRecords: Record<string, PersonalRecord> = {
  ex_1: {
    exerciseId: 'ex_1', exerciseName: 'Back Squat',
    bestWeight: 105, bestWeightDate: yesterday,
    bestReps: 8, bestRepsDate: yesterday,
    bestVolume: 840, bestVolumeDate: yesterday,
    history: [
      { date: fourDaysAgo, weight: 95, reps: 8, rpe: 8 },
      { date: format(subDays(now, 8), 'yyyy-MM-dd'), weight: 90, reps: 8, rpe: 7.5 },
      { date: yesterday, weight: 105, reps: 8, rpe: 7 },
    ],
  },
  ex_10: {
    exerciseId: 'ex_10', exerciseName: 'Flat Barbell Bench Press',
    bestWeight: 85, bestWeightDate: twoDaysAgo,
    bestReps: 8, bestRepsDate: twoDaysAgo,
    bestVolume: 640, bestVolumeDate: twoDaysAgo,
    history: [
      { date: format(subDays(now, 9), 'yyyy-MM-dd'), weight: 75, reps: 8, rpe: 7 },
      { date: format(subDays(now, 5), 'yyyy-MM-dd'), weight: 80, reps: 7, rpe: 8 },
      { date: twoDaysAgo, weight: 85, reps: 8, rpe: 7 },
    ],
  },
  ex_29: {
    exerciseId: 'ex_29', exerciseName: 'Romanian Deadlift (RDL)',
    bestWeight: 100, bestWeightDate: format(subDays(now, 3), 'yyyy-MM-dd'),
    bestReps: 10, bestRepsDate: format(subDays(now, 3), 'yyyy-MM-dd'),
    bestVolume: 1000, bestVolumeDate: format(subDays(now, 3), 'yyyy-MM-dd'),
    history: [
      { date: format(subDays(now, 10), 'yyyy-MM-dd'), weight: 90, reps: 9, rpe: 8 },
      { date: format(subDays(now, 3), 'yyyy-MM-dd'), weight: 100, reps: 10, rpe: 8 },
    ],
  },
  ex_13: {
    exerciseId: 'ex_13', exerciseName: 'Overhead Press (Barbell)',
    bestWeight: 52.5, bestWeightDate: twoDaysAgo,
    bestReps: 8, bestRepsDate: format(subDays(now, 9), 'yyyy-MM-dd'),
    bestVolume: 420, bestVolumeDate: twoDaysAgo,
    history: [
      { date: format(subDays(now, 9), 'yyyy-MM-dd'), weight: 45, reps: 8, rpe: 7 },
      { date: twoDaysAgo, weight: 52.5, reps: 8, rpe: 7 },
    ],
  },
  ex_19: {
    exerciseId: 'ex_19', exerciseName: 'Barbell Row (Overhand)',
    bestWeight: 75, bestWeightDate: fourDaysAgo,
    bestReps: 8, bestRepsDate: fourDaysAgo,
    bestVolume: 600, bestVolumeDate: fourDaysAgo,
    history: [
      { date: format(subDays(now, 11), 'yyyy-MM-dd'), weight: 65, reps: 8, rpe: 7 },
      { date: fourDaysAgo, weight: 75, reps: 8, rpe: 7 },
    ],
  },
};

// ========== BODY MEASUREMENTS ==========
export const sampleBodyMeasurements: BodyMeasurement[] = [
  { id: 'bm_1', date: today, bodyweight: 82.3, chest: 104, waist: 82, leftArm: 37.5, rightArm: 38, leftQuad: 59, rightQuad: 59.5 },
  { id: 'bm_2', date: format(subDays(now, 5), 'yyyy-MM-dd'), bodyweight: 82.0, chest: 103.5, waist: 82.5, leftArm: 37, rightArm: 37.5 },
  { id: 'bm_3', date: format(subDays(now, 10), 'yyyy-MM-dd'), bodyweight: 81.5, chest: 103, waist: 83, leftArm: 37, rightArm: 37 },
  { id: 'bm_4', date: format(subDays(now, 14), 'yyyy-MM-dd'), bodyweight: 81.0, chest: 102.5, waist: 83.5, leftArm: 36.5, rightArm: 36.5 },
];

// ========== RECENT FOODS ==========
export const sampleRecentFoods: FoodItem[] = [
  { id: 'rf_1', name: 'Chicken Breast', protein: 31, carbs: 0, fats: 3.6, calories: 165, quantity: '100g' },
  { id: 'rf_2', name: 'White Rice', protein: 2.7, carbs: 28, fats: 0.3, calories: 130, quantity: '100g cooked' },
  { id: 'rf_3', name: 'Eggs (2 large)', protein: 12, carbs: 1, fats: 10, calories: 140, quantity: '2 eggs' },
  { id: 'rf_4', name: 'Whey Protein Shake', protein: 25, carbs: 3, fats: 1, calories: 120, quantity: '1 scoop' },
  { id: 'rf_5', name: 'Oats', protein: 5, carbs: 27, fats: 3, calories: 150, quantity: '40g dry' },
];

// ========== DAILY NUTRITION (today) ==========
export const sampleDailyNutrition: Record<string, DailyNutrition> = {
  [today]: {
    date: today,
    consumed: { protein: 68, carbs: 59, fats: 17.6, calories: 685 },
    meals: [
      {
        id: 'sm_1', mealNumber: 1, name: 'Meal 1 — Breakfast', completed: true,
        timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 30).toISOString(),
        foods: [
          { id: 'sf_1', name: 'Eggs (3 large)', protein: 18, carbs: 1.5, fats: 15, calories: 210, quantity: '3 eggs' },
          { id: 'sf_2', name: 'Oats', protein: 5, carbs: 27, fats: 3, calories: 150, quantity: '40g' },
          { id: 'sf_3', name: 'Banana', protein: 1, carbs: 27, fats: 0.3, calories: 105, quantity: '1 medium' },
        ],
      },
      {
        id: 'sm_2', mealNumber: 2, name: 'Meal 2 — Pre-Workout', completed: true, isPreWorkout: true,
        timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0).toISOString(),
        foods: [
          { id: 'sf_4', name: 'Chicken Breast', protein: 31, carbs: 0, fats: 3.6, calories: 165, quantity: '100g' },
          { id: 'sf_5', name: 'White Rice', protein: 5.4, carbs: 56, fats: 0.6, calories: 260, quantity: '200g cooked' },
        ],
      },
      {
        id: 'sm_3', mealNumber: 3, name: 'Meal 3 — Post-Workout', completed: false, isPostWorkout: true,
        foods: [],
      },
      {
        id: 'sm_4', mealNumber: 4, name: 'Meal 4 — Dinner', completed: false,
        foods: [],
      },
      {
        id: 'sm_5', mealNumber: 5, name: 'Meal 5 — Night Snack', completed: false,
        foods: [],
      },
    ],
  },
};

// ========== DAILY HYDRATION (today) ==========
export const sampleDailyHydration: Record<string, DailyHydration> = {
  [today]: {
    date: today,
    goal: 3000,
    entries: [
      { id: 'sh_1', amount: 500, timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0).toISOString() },
      { id: 'sh_2', amount: 500, timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30).toISOString() },
      { id: 'sh_3', amount: 500, timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 45).toISOString() },
    ],
    total: 1500,
  },
};

// ========== SETTINGS ==========
export const sampleEstimatedMaxes: EstimatedMaxes = {
  backSquat: 130,
  benchPress: 100,
  rdl: 120,
  overheadPress: 65,
  pullUp: 20,
  barbellRow: 90,
  barbellCurl: 45,
  weightedDip: 25,
};

export const sampleMacroTargets: MacroTargets = {
  protein: 200,
  carbs: 300,
  fats: 80,
  calories: 2800,
};
