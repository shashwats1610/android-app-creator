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

      // Sessions
      startSession: (inProgress) => set({ inProgressSession: inProgress }),

      updateInProgressSession: (inProgress) =>
        set({ inProgressSession: inProgress }),

      completeSession: (session) =>
        set((s) => ({
          sessions: [session, ...s.sessions],
          inProgressSession: null,
        })),

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
