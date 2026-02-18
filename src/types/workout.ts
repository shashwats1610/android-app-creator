// ============================================================
// Hypertrophy Tracker — Core Type Definitions
// ============================================================

// ---------- Exercise & Workout Plan ----------

export type MuscleGroup =
  | 'quads' | 'hamstrings' | 'glutes' | 'calves'
  | 'chest' | 'front_delts' | 'side_delts' | 'rear_delts'
  | 'lats' | 'upper_back' | 'traps' | 'lower_back'
  | 'biceps' | 'triceps' | 'forearms'
  | 'abs' | 'obliques';

export type ExerciseType = 'bilateral' | 'unilateral' | 'timed' | 'bodyweight';

export interface Exercise {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  type: ExerciseType;
  sets: number;
  repRangeMin: number;
  repRangeMax: number;
  restSeconds: number;
  formCue: string;
  supersetPairId?: string; // ID of partner exercise in superset
  notes?: string;
}

export interface WorkoutDay {
  id: string;
  dayNumber: number; // 1-7
  name: string; // e.g. "Legs — Quad Focus + Abs"
  focusMuscles: MuscleGroup[];
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  days: WorkoutDay[];
}

// ---------- Session Logging ----------

export interface LoggedSet {
  setNumber: number;
  weight: number;
  reps: number;
  rpe: number; // 1-10
  completed: boolean;
  timestamp: string; // ISO
  side?: 'left' | 'right'; // for unilateral
  duration?: number; // seconds, for timed exercises
}

export interface LoggedExercise {
  exerciseId: string;
  exerciseName: string;
  sets: LoggedSet[];
  personalRecord: boolean;
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  dayId: string;
  dayName: string;
  dayNumber: number;
  date: string; // ISO date
  startTime: string; // ISO
  endTime?: string; // ISO
  exercises: LoggedExercise[];
  totalVolume: number; // sum of weight * reps
  totalSets: number;
  prsHit: number;
  completed: boolean;
  notes?: string;
}

// ---------- Progressive Overload ----------

export type OverloadRecommendation = 'add_weight' | 'maintain' | 'consolidate' | 'stall';

export interface ExerciseRecommendation {
  exerciseId: string;
  recommendation: OverloadRecommendation;
  suggestedWeight: number;
  suggestedReps: number;
  lastSessionWeight: number;
  lastSessionReps: number;
  lastSessionRpe: number;
}

// ---------- Personal Records ----------

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  bestWeight: number;
  bestWeightDate: string;
  bestReps: number;
  bestRepsDate: string;
  bestVolume: number; // single set: weight * reps
  bestVolumeDate: string;
  history: PREntry[];
}

export interface PREntry {
  date: string;
  weight: number;
  reps: number;
  rpe: number;
}

// ---------- Body Measurements ----------

export interface BodyMeasurement {
  id: string;
  date: string; // ISO date
  bodyweight?: number; // kg
  leftArm?: number; // cm
  rightArm?: number;
  chest?: number;
  waist?: number;
  leftQuad?: number;
  rightQuad?: number;
  leftCalf?: number;
  rightCalf?: number;
  notes?: string;
}

// ---------- Nutrition ----------

export interface MacroTargets {
  protein: number; // grams
  carbs: number;
  fats: number;
  calories: number;
}

export interface FoodItem {
  id: string;
  name: string;
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
  quantity?: string; // e.g. "200g", "1 cup"
}

export interface MealEntry {
  id: string;
  mealNumber: number;
  name: string;
  completed: boolean;
  timestamp?: string;
  isPreWorkout?: boolean;
  isPostWorkout?: boolean;
  foods: FoodItem[];
  notes?: string;
}

export interface MealTemplate {
  id: string;
  name: string;
  isPreWorkout?: boolean;
  isPostWorkout?: boolean;
  defaultFoods?: FoodItem[];
}

export interface DailyNutrition {
  date: string;
  consumed: MacroTargets;
  meals: MealEntry[];
}

// ---------- Hydration ----------

export interface HydrationEntry {
  id: string;
  amount: number; // ml
  timestamp: string;
}

export interface DailyHydration {
  date: string;
  goal: number; // ml
  entries: HydrationEntry[];
  total: number;
}

// ---------- User Settings / Onboarding ----------

export interface EstimatedMaxes {
  backSquat: number;
  benchPress: number;
  rdl: number;
  overheadPress: number;
  pullUp: number;
  barbellRow: number;
  barbellCurl: number;
  weightedDip: number;
}

export interface UserSettings {
  onboardingComplete: boolean;
  estimatedMaxes: EstimatedMaxes;
  macroTargets: MacroTargets;
  hydrationGoal: number; // ml per day
  theme: 'dark' | 'light';
  currentDayIndex: number; // 0-6, which day in the split we're on
  restTimerOverrides: Record<string, number>; // exerciseId -> seconds
}

// ---------- App State ----------

export interface InProgressSession {
  session: WorkoutSession;
  currentExerciseIndex: number;
  currentSetIndex: number;
}

export interface AppState {
  settings: UserSettings;
  workoutPlan: WorkoutPlan;
  sessions: WorkoutSession[];
  personalRecords: Record<string, PersonalRecord>;
  bodyMeasurements: BodyMeasurement[];
  dailyNutrition: Record<string, DailyNutrition>; // keyed by ISO date
  dailyHydration: Record<string, DailyHydration>; // keyed by ISO date
  inProgressSession: InProgressSession | null;
  streak: number;
  mealTemplates: import('@/types/workout').MealTemplate[];
  recentFoods: FoodItem[]; // max 20, most recent first
}
