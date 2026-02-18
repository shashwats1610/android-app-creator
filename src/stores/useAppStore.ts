import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppState,
  UserSettings,
  WorkoutPlan,
  WorkoutSession,
  PersonalRecord,
  BodyMeasurement,
  DailyNutrition,
  DailyHydration,
  InProgressSession,
  HydrationEntry,
  MacroTargets,
  EstimatedMaxes,
} from '@/types/workout';
import { defaultWorkoutPlan } from '@/data/workoutPlan';

const defaultSettings: UserSettings = {
  onboardingComplete: false,
  estimatedMaxes: {
    backSquat: 0,
    benchPress: 0,
    rdl: 0,
    overheadPress: 0,
    pullUp: 0,
    barbellRow: 0,
    barbellCurl: 0,
    weightedDip: 0,
  },
  macroTargets: { protein: 200, carbs: 300, fats: 80, calories: 2800 },
  hydrationGoal: 3000,
  theme: 'dark',
  currentDayIndex: 0,
  restTimerOverrides: {},
};

interface AppActions {
  // Settings
  updateSettings: (partial: Partial<UserSettings>) => void;
  updateEstimatedMaxes: (maxes: Partial<EstimatedMaxes>) => void;
  updateMacroTargets: (targets: Partial<MacroTargets>) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  completeOnboarding: () => void;

  // Workout Plan
  updateWorkoutPlan: (plan: WorkoutPlan) => void;
  updateWorkoutDay: (dayId: string, updates: Partial<import('@/types/workout').WorkoutDay>) => void;
  addWorkoutDay: (day: import('@/types/workout').WorkoutDay) => void;
  removeWorkoutDay: (dayId: string) => void;
  reorderWorkoutDays: (dayIds: string[]) => void;
  updateExercise: (dayId: string, exerciseId: string, updates: Partial<import('@/types/workout').Exercise>) => void;
  addExercise: (dayId: string, exercise: import('@/types/workout').Exercise) => void;
  removeExercise: (dayId: string, exerciseId: string) => void;
  reorderExercises: (dayId: string, exerciseIds: string[]) => void;

  // Sessions
  startSession: (session: InProgressSession) => void;
  updateInProgressSession: (session: InProgressSession) => void;
  completeSession: (session: WorkoutSession) => void;
  clearInProgressSession: () => void;
  advanceDay: () => void;

  // Records
  updatePersonalRecord: (exerciseId: string, record: PersonalRecord) => void;

  // Body
  addBodyMeasurement: (measurement: BodyMeasurement) => void;

  // Nutrition
  updateDailyNutrition: (date: string, nutrition: DailyNutrition) => void;

  // Hydration
  addHydrationEntry: (date: string, entry: HydrationEntry) => void;
  updateDailyHydrationGoal: (goal: number) => void;

  // Data management
  exportData: () => string;
  importData: (json: string) => boolean;
  resetAllData: () => void;
}

type Store = AppState & AppActions;

export const useAppStore = create<Store>()(
  persist(
    (set, get) => ({
      // State
      settings: defaultSettings,
      workoutPlan: defaultWorkoutPlan,
      sessions: [],
      personalRecords: {},
      bodyMeasurements: [],
      dailyNutrition: {},
      dailyHydration: {},
      inProgressSession: null,
      streak: 0,

      // Settings
      updateSettings: (partial) =>
        set((s) => ({ settings: { ...s.settings, ...partial } })),

      updateEstimatedMaxes: (maxes) =>
        set((s) => ({
          settings: {
            ...s.settings,
            estimatedMaxes: { ...s.settings.estimatedMaxes, ...maxes },
          },
        })),

      updateMacroTargets: (targets) =>
        set((s) => ({
          settings: {
            ...s.settings,
            macroTargets: { ...s.settings.macroTargets, ...targets },
          },
        })),

      setTheme: (theme) =>
        set((s) => ({ settings: { ...s.settings, theme } })),

      completeOnboarding: () =>
        set((s) => ({ settings: { ...s.settings, onboardingComplete: true } })),

      // Workout Plan
      updateWorkoutPlan: (plan) => set({ workoutPlan: plan }),

      updateWorkoutDay: (dayId, updates) =>
        set((s) => ({
          workoutPlan: {
            ...s.workoutPlan,
            days: s.workoutPlan.days.map((d) => (d.id === dayId ? { ...d, ...updates } : d)),
          },
        })),

      addWorkoutDay: (day) =>
        set((s) => ({
          workoutPlan: { ...s.workoutPlan, days: [...s.workoutPlan.days, day] },
        })),

      removeWorkoutDay: (dayId) =>
        set((s) => ({
          workoutPlan: {
            ...s.workoutPlan,
            days: s.workoutPlan.days.filter((d) => d.id !== dayId),
          },
        })),

      reorderWorkoutDays: (dayIds) =>
        set((s) => {
          const map = Object.fromEntries(s.workoutPlan.days.map((d) => [d.id, d]));
          return {
            workoutPlan: {
              ...s.workoutPlan,
              days: dayIds.map((id, i) => ({ ...map[id], dayNumber: i + 1 })),
            },
          };
        }),

      updateExercise: (dayId, exerciseId, updates) =>
        set((s) => ({
          workoutPlan: {
            ...s.workoutPlan,
            days: s.workoutPlan.days.map((d) =>
              d.id === dayId
                ? { ...d, exercises: d.exercises.map((ex) => (ex.id === exerciseId ? { ...ex, ...updates } : ex)) }
                : d
            ),
          },
        })),

      addExercise: (dayId, exercise) =>
        set((s) => ({
          workoutPlan: {
            ...s.workoutPlan,
            days: s.workoutPlan.days.map((d) =>
              d.id === dayId ? { ...d, exercises: [...d.exercises, exercise] } : d
            ),
          },
        })),

      removeExercise: (dayId, exerciseId) =>
        set((s) => ({
          workoutPlan: {
            ...s.workoutPlan,
            days: s.workoutPlan.days.map((d) =>
              d.id === dayId ? { ...d, exercises: d.exercises.filter((ex) => ex.id !== exerciseId) } : d
            ),
          },
        })),

      reorderExercises: (dayId, exerciseIds) =>
        set((s) => {
          const day = s.workoutPlan.days.find((d) => d.id === dayId);
          if (!day) return s;
          const map = Object.fromEntries(day.exercises.map((ex) => [ex.id, ex]));
          return {
            workoutPlan: {
              ...s.workoutPlan,
              days: s.workoutPlan.days.map((d) =>
                d.id === dayId ? { ...d, exercises: exerciseIds.map((id) => map[id]) } : d
              ),
            },
          };
        }),

      // Sessions
      startSession: (inProgress) => set({ inProgressSession: inProgress }),

      updateInProgressSession: (inProgress) =>
        set({ inProgressSession: inProgress }),

      completeSession: (session) =>
        set((s) => {
          const allSessions = [session, ...s.sessions];
          const uniqueDates = [...new Set(allSessions.map(sess => sess.date))].sort().reverse();
          let streak = 1;
          for (let i = 0; i < uniqueDates.length - 1; i++) {
            const curr = new Date(uniqueDates[i]);
            const next = new Date(uniqueDates[i + 1]);
            const gap = Math.floor((curr.getTime() - next.getTime()) / 86400000);
            if (gap <= 3) streak++;
            else break;
          }
          return {
            sessions: allSessions,
            inProgressSession: null,
            streak,
          };
        }),

      clearInProgressSession: () => set({ inProgressSession: null }),

      advanceDay: () =>
        set((s) => ({
          settings: {
            ...s.settings,
            currentDayIndex: (s.settings.currentDayIndex + 1) % s.workoutPlan.days.length,
          },
        })),

      // Records
      updatePersonalRecord: (exerciseId, record) =>
        set((s) => ({
          personalRecords: { ...s.personalRecords, [exerciseId]: record },
        })),

      // Body
      addBodyMeasurement: (measurement) =>
        set((s) => ({
          bodyMeasurements: [measurement, ...s.bodyMeasurements],
        })),

      // Nutrition
      updateDailyNutrition: (date, nutrition) =>
        set((s) => ({
          dailyNutrition: { ...s.dailyNutrition, [date]: nutrition },
        })),

      // Hydration
      addHydrationEntry: (date, entry) =>
        set((s) => {
          const existing = s.dailyHydration[date] || {
            date,
            goal: s.settings.hydrationGoal,
            entries: [],
            total: 0,
          };
          const entries = [...existing.entries, entry];
          const total = entries.reduce((sum, e) => sum + e.amount, 0);
          return {
            dailyHydration: {
              ...s.dailyHydration,
              [date]: { ...existing, entries, total },
            },
          };
        }),

      updateDailyHydrationGoal: (goal) =>
        set((s) => ({ settings: { ...s.settings, hydrationGoal: goal } })),

      // Data management
      exportData: () => {
        const { settings, workoutPlan, sessions, personalRecords, bodyMeasurements, dailyNutrition, dailyHydration, streak } = get();
        return JSON.stringify({ settings, workoutPlan, sessions, personalRecords, bodyMeasurements, dailyNutrition, dailyHydration, streak }, null, 2);
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json);
          set({
            settings: data.settings ?? defaultSettings,
            workoutPlan: data.workoutPlan ?? defaultWorkoutPlan,
            sessions: data.sessions ?? [],
            personalRecords: data.personalRecords ?? {},
            bodyMeasurements: data.bodyMeasurements ?? [],
            dailyNutrition: data.dailyNutrition ?? {},
            dailyHydration: data.dailyHydration ?? {},
            streak: data.streak ?? 0,
          });
          return true;
        } catch {
          return false;
        }
      },

      resetAllData: () =>
        set({
          settings: defaultSettings,
          workoutPlan: defaultWorkoutPlan,
          sessions: [],
          personalRecords: {},
          bodyMeasurements: [],
          dailyNutrition: {},
          dailyHydration: {},
          inProgressSession: null,
          streak: 0,
        }),
    }),
    {
      name: 'hypertrophy-tracker-storage',
    }
  )
);
