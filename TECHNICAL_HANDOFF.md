# Hypertrophy Tracker — Technical Handoff Document

> **Last updated:** 2026-02-18  
> **Purpose:** Complete reference for any developer (Antigravity, Cursor, or otherwise) to understand the entire app and build a backend from it.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Complete Data Model Reference](#3-complete-data-model-reference)
4. [Store Actions (API Surface)](#4-store-actions-api-surface)
5. [Feature Inventory](#5-feature-inventory)
6. [Progressive Overload Algorithm](#6-progressive-overload-algorithm)
7. [Default Workout Plan & Exercise ID Map](#7-default-workout-plan--exercise-id-map)
8. [Backend Migration Guide](#8-backend-migration-guide)
9. [React Native Migration Notes](#9-react-native-migration-notes)

---

## 1. Project Overview

### What It Is
A **hypertrophy/bodybuilding workout tracker** built as a mobile-first single-page application (SPA). It tracks workout sessions, progressive overload, personal records, body measurements, nutrition (5-meal plan with macro tracking), and hydration.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build Tool | Vite |
| Language | TypeScript (strict) |
| State Management | Zustand 5 with `persist` middleware (localStorage) |
| Styling | Tailwind CSS 4 + custom design tokens in `index.css` |
| UI Components | shadcn/ui (Radix primitives) |
| Animations | Framer Motion 12 |
| Charts | Recharts 2 |
| Routing | React Router DOM 6 |
| Date Utils | date-fns 3 |
| Forms | React Hook Form + Zod |
| Toasts | Sonner |

### Design Goals
- **Mobile-first**: All touch targets ≥44px, bottom navigation, sheet-based modals
- **Offline-capable**: All data in localStorage, no network requests
- **Future-ready**: Designed for conversion to React Native / Android APK
- **Single user**: No authentication currently (entire state is one user's data)

---

## 2. Architecture

### File Structure

```
src/
├── App.tsx                    # Root component, routing, theme application
├── main.tsx                   # Entry point
├── index.css                  # Tailwind + custom CSS tokens + animations
│
├── types/
│   └── workout.ts             # ALL TypeScript interfaces (236 lines)
│
├── stores/
│   └── useAppStore.ts         # Single Zustand store (380 lines)
│
├── data/
│   ├── workoutPlan.ts         # Default 7-day workout plan (162 lines, 70+ exercises)
│   └── sampleData.ts          # Test data for all features (262 lines)
│
├── lib/
│   ├── progressiveOverload.ts # Overload algorithm (83 lines)
│   └── utils.ts               # Tailwind merge utility
│
├── hooks/
│   ├── useTheme.ts            # Dark/light theme toggle
│   ├── use-mobile.tsx         # Mobile detection hook
│   └── use-toast.ts           # Toast hook
│
├── components/
│   ├── CircularProgress.tsx   # SVG circular progress indicator
│   ├── EmptyState.tsx         # Reusable empty state component
│   ├── NavLink.tsx            # Bottom nav link component
│   ├── PageHeader.tsx         # Consistent page header
│   ├── PlateCalculator.tsx    # Barbell plate breakdown calculator
│   ├── WeeklyVolumeChart.tsx  # 7-day volume bar chart
│   ├── layout/
│   │   ├── AppLayout.tsx      # Main layout with Outlet
│   │   └── BottomNav.tsx      # Bottom tab navigation
│   └── ui/                    # shadcn/ui primitives (50+ components)
│
└── pages/
    ├── OnboardingPage.tsx     # First-time setup wizard
    ├── HomePage.tsx           # Dashboard with stats, hydration, today's workout
    ├── WorkoutPage.tsx        # Workout plan overview (7 days)
    ├── WorkoutDayPage.tsx     # Single day exercise list
    ├── EditPlanPage.tsx       # Edit/reorder workout days
    ├── EditDayPage.tsx        # Edit exercises within a day
    ├── SessionPage.tsx        # LIVE workout session (set logging, rest timer, plate calc)
    ├── SessionCompletePage.tsx# Post-session summary
    ├── HistoryPage.tsx        # Past session history
    ├── RecordsPage.tsx        # PRs + Body measurements + charts
    ├── NutritionPage.tsx      # 5-meal plan, quick-log, hydration
    ├── SettingsPage.tsx       # Theme, maxes, macros, data management
    ├── Index.tsx              # Redirects to /
    └── NotFound.tsx           # 404 page
```

### Routing Table

| Route | Page | Purpose |
|-------|------|---------|
| `*` (pre-onboarding) | `OnboardingPage` | First-time setup: estimated maxes, macro targets, hydration goal |
| `/` | `HomePage` | Dashboard: today's workout, streak, stats, hydration, volume chart |
| `/workout` | `WorkoutPage` | View all 7 days of the workout split |
| `/workout/day/:dayId` | `WorkoutDayPage` | View exercises for a specific day |
| `/workout/edit` | `EditPlanPage` | Add/remove/reorder workout days |
| `/workout/edit/day/:dayId` | `EditDayPage` | Add/remove/reorder exercises in a day |
| `/session` | `SessionPage` | **Live workout session** — no bottom nav, full-screen |
| `/session/complete` | `SessionCompletePage` | Post-session summary with stats |
| `/history` | `HistoryPage` | Browse past completed sessions |
| `/records` | `RecordsPage` | Personal records (by muscle group) + body measurements |
| `/nutrition` | `NutritionPage` | Daily meals, quick-log, macro tracking, hydration |
| `/settings` | `SettingsPage` | Theme, 1RM maxes, macro targets, rest overrides, data import/export |
| `*` | `NotFound` | 404 page |

**Layout:** Routes under `AppLayout` get bottom navigation (Home, Workout, Records, Nutrition, Settings). `/session` and `/session/complete` are full-screen without nav.

### State Management

Single Zustand store at `src/stores/useAppStore.ts` with `persist` middleware:

```typescript
persist(storeDefinition, { name: 'hypertrophy-tracker-storage' })
```

- **Storage key:** `hypertrophy-tracker-storage`
- **Persistence:** Entire state serialized to `localStorage`
- **No server calls:** All operations are synchronous, local-only

---

## 3. Complete Data Model Reference

All types defined in `src/types/workout.ts`.

### Enums

#### MuscleGroup (17 values)
```
quads | hamstrings | glutes | calves
chest | front_delts | side_delts | rear_delts
lats | upper_back | traps | lower_back
biceps | triceps | forearms
abs | obliques
```

#### ExerciseType (4 values)
```
bilateral | unilateral | timed | bodyweight
```

#### OverloadRecommendation (4 values)
```
add_weight | maintain | consolidate | stall
```

### Core Interfaces

#### Exercise
```typescript
interface Exercise {
  id: string;              // e.g. "ex_1", "ss5_1a" — CRITICAL for PR/session linking
  name: string;            // Display name
  muscleGroups: MuscleGroup[];  // Primary + secondary muscles
  type: ExerciseType;      // Determines UI: weight input, timer, bodyweight toggle
  sets: number;            // Prescribed set count
  repRangeMin: number;     // Low end of rep target
  repRangeMax: number;     // High end of rep target
  restSeconds: number;     // Default rest timer (seconds)
  formCue: string;         // Coaching cue shown during session
  supersetPairId?: string; // ID of partner exercise (for supersets)
  notes?: string;
}
```

#### WorkoutDay
```typescript
interface WorkoutDay {
  id: string;              // e.g. "day_1" through "day_7"
  dayNumber: number;       // 1-7, position in the split
  name: string;            // e.g. "Legs — Quad Focus + Abs"
  focusMuscles: MuscleGroup[];  // Summary of targeted muscles
  exercises: Exercise[];   // Ordered list of exercises for this day
}
```

#### WorkoutPlan
```typescript
interface WorkoutPlan {
  id: string;              // e.g. "default_hypertrophy_7day"
  name: string;            // e.g. "7-Day Hypertrophy Split"
  days: WorkoutDay[];      // Ordered array of 7 days
}
```

#### LoggedSet
```typescript
interface LoggedSet {
  setNumber: number;       // 1-indexed within the exercise
  weight: number;          // kg (0 for bodyweight exercises)
  reps: number;            // Actual reps performed (or seconds for timed)
  rpe: number;             // Rate of Perceived Exertion, 1-10 scale
  completed: boolean;      // Always true for logged sets
  timestamp: string;       // ISO datetime when set was logged
  side?: 'left' | 'right'; // For unilateral exercises
  duration?: number;       // Seconds, for timed exercises
}
```

#### LoggedExercise
```typescript
interface LoggedExercise {
  exerciseId: string;      // Links to Exercise.id
  exerciseName: string;    // Denormalized for display
  sets: LoggedSet[];       // All logged sets for this exercise
  personalRecord: boolean; // True if any set was a new PR
  notes?: string;
}
```

#### WorkoutSession
```typescript
interface WorkoutSession {
  id: string;              // Unique session ID
  dayId: string;           // Links to WorkoutDay.id
  dayName: string;         // Denormalized
  dayNumber: number;       // 1-7
  date: string;            // ISO date (YYYY-MM-DD)
  startTime: string;       // ISO datetime
  endTime?: string;        // ISO datetime (set on completion)
  exercises: LoggedExercise[];  // All exercises logged in this session
  totalVolume: number;     // Sum of (weight × reps) across all sets
  totalSets: number;       // Count of completed sets
  prsHit: number;          // Count of exercises where PR was achieved
  completed: boolean;      // True when session is finished
  notes?: string;          // Optional session notes
}
```

#### PersonalRecord
```typescript
interface PersonalRecord {
  exerciseId: string;      // Links to Exercise.id
  exerciseName: string;    // Denormalized
  bestWeight: number;      // Heaviest single set (kg)
  bestWeightDate: string;  // ISO date
  bestReps: number;        // Most reps in a single set
  bestRepsDate: string;    // ISO date
  bestVolume: number;      // Best single-set volume (weight × reps)
  bestVolumeDate: string;  // ISO date
  history: PREntry[];      // Chronological log of PR-worthy performances
}

interface PREntry {
  date: string;
  weight: number;
  reps: number;
  rpe: number;
}
```

#### BodyMeasurement
```typescript
interface BodyMeasurement {
  id: string;
  date: string;            // ISO date
  bodyweight?: number;     // kg
  leftArm?: number;        // cm
  rightArm?: number;       // cm
  chest?: number;          // cm
  waist?: number;          // cm
  leftQuad?: number;       // cm
  rightQuad?: number;      // cm
  leftCalf?: number;       // cm
  rightCalf?: number;      // cm
  notes?: string;
}
```

#### Nutrition Types
```typescript
interface MacroTargets {
  protein: number;         // grams
  carbs: number;           // grams
  fats: number;            // grams
  calories: number;        // kcal
}

interface FoodItem {
  id: string;
  name: string;
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
  quantity?: string;       // e.g. "200g", "1 cup"
}

interface MealEntry {
  id: string;
  mealNumber: number;      // 1-5
  name: string;            // e.g. "Meal 1 — Breakfast"
  completed: boolean;
  timestamp?: string;      // ISO, when meal was logged
  isPreWorkout?: boolean;
  isPostWorkout?: boolean;
  foods: FoodItem[];       // All foods logged in this meal
  notes?: string;
}

interface MealTemplate {
  id: string;              // e.g. "mt1" through "mt5"
  name: string;
  isPreWorkout?: boolean;
  isPostWorkout?: boolean;
  defaultFoods?: FoodItem[];
}

interface DailyNutrition {
  date: string;            // ISO date (key in Record)
  consumed: MacroTargets;  // Running total for the day
  meals: MealEntry[];      // All 5 meals for the day
}
```

#### Hydration Types
```typescript
interface HydrationEntry {
  id: string;
  amount: number;          // ml
  timestamp: string;       // ISO datetime
}

interface DailyHydration {
  date: string;            // ISO date (key in Record)
  goal: number;            // ml target
  entries: HydrationEntry[];
  total: number;           // Sum of all entry amounts
}
```

#### User Settings
```typescript
interface EstimatedMaxes {
  backSquat: number;       // kg
  benchPress: number;
  rdl: number;
  overheadPress: number;
  pullUp: number;          // Added weight on top of bodyweight
  barbellRow: number;
  barbellCurl: number;
  weightedDip: number;
}

interface UserSettings {
  onboardingComplete: boolean;
  estimatedMaxes: EstimatedMaxes;
  macroTargets: MacroTargets;
  hydrationGoal: number;        // ml per day (default: 3000)
  theme: 'dark' | 'light';
  currentDayIndex: number;      // 0-6, tracks which day in the split is "today"
  restTimerOverrides: Record<string, number>;  // exerciseId → custom rest seconds
}
```

#### App State (Root)
```typescript
interface AppState {
  settings: UserSettings;
  workoutPlan: WorkoutPlan;
  sessions: WorkoutSession[];                    // Newest first
  personalRecords: Record<string, PersonalRecord>; // Keyed by exerciseId
  bodyMeasurements: BodyMeasurement[];           // Newest first
  dailyNutrition: Record<string, DailyNutrition>; // Keyed by ISO date
  dailyHydration: Record<string, DailyHydration>; // Keyed by ISO date
  inProgressSession: InProgressSession | null;
  streak: number;                                // Consecutive training days (≤3 day gap)
  mealTemplates: MealTemplate[];                 // Default 5 meal slots
  recentFoods: FoodItem[];                       // Max 20, most recent first
}

interface InProgressSession {
  session: WorkoutSession;       // The session being built
  currentExerciseIndex: number;  // Which exercise the user is on
  currentSetIndex: number;       // Which set (not always used; sets are appended)
}
```

### Entity Relationships

```
WorkoutPlan
  └── WorkoutDay[] (1:many)
        └── Exercise[] (1:many)

WorkoutSession
  └── LoggedExercise[] (1:many, linked by exerciseId → Exercise.id)
        └── LoggedSet[] (1:many)

PersonalRecord (keyed by exerciseId → Exercise.id)
  └── PREntry[] (history)

DailyNutrition (keyed by ISO date)
  └── MealEntry[] (1:many)
        └── FoodItem[] (1:many)

DailyHydration (keyed by ISO date)
  └── HydrationEntry[] (1:many)
```

---

## 4. Store Actions (API Surface)

All actions defined in `src/stores/useAppStore.ts`. These map directly to future API endpoints.

### Settings Domain

| Action | Signature | Description |
|--------|-----------|-------------|
| `updateSettings` | `(partial: Partial<UserSettings>) => void` | Merge partial settings update |
| `updateEstimatedMaxes` | `(maxes: Partial<EstimatedMaxes>) => void` | Update individual 1RM estimates |
| `updateMacroTargets` | `(targets: Partial<MacroTargets>) => void` | Update daily macro goals |
| `setTheme` | `(theme: 'dark' \| 'light') => void` | Toggle theme |
| `completeOnboarding` | `() => void` | Set `onboardingComplete = true` |

### Workout Plan Domain

| Action | Signature | Description |
|--------|-----------|-------------|
| `updateWorkoutPlan` | `(plan: WorkoutPlan) => void` | Replace entire plan |
| `updateWorkoutDay` | `(dayId: string, updates: Partial<WorkoutDay>) => void` | Partial update to a day |
| `addWorkoutDay` | `(day: WorkoutDay) => void` | Append a new day |
| `removeWorkoutDay` | `(dayId: string) => void` | Delete a day |
| `reorderWorkoutDays` | `(dayIds: string[]) => void` | Reorder days; auto-renumbers `dayNumber` |
| `updateExercise` | `(dayId: string, exerciseId: string, updates: Partial<Exercise>) => void` | Edit exercise within a day |
| `addExercise` | `(dayId: string, exercise: Exercise) => void` | Add exercise to a day |
| `removeExercise` | `(dayId: string, exerciseId: string) => void` | Remove exercise from a day |
| `reorderExercises` | `(dayId: string, exerciseIds: string[]) => void` | Reorder exercises within a day |

### Session Domain

| Action | Signature | Description |
|--------|-----------|-------------|
| `startSession` | `(session: InProgressSession) => void` | Begin a new workout session |
| `updateInProgressSession` | `(session: InProgressSession) => void` | Update live session state (each set logged) |
| `completeSession` | `(session: WorkoutSession) => void` | Finalize session, add to history, recalculate streak |
| `clearInProgressSession` | `() => void` | Abandon session without saving |
| `advanceDay` | `() => void` | Move `currentDayIndex` forward by 1 (wraps at plan length) |

**Streak Calculation Logic (in `completeSession`):**
```
1. Prepend new session to sessions array
2. Extract unique dates, sort descending
3. Starting at most recent, count consecutive dates with ≤3 day gaps
4. streak = count of qualifying dates
```

### Records Domain

| Action | Signature | Description |
|--------|-----------|-------------|
| `updatePersonalRecord` | `(exerciseId: string, record: PersonalRecord) => void` | Upsert PR for an exercise |
| `addBodyMeasurement` | `(measurement: BodyMeasurement) => void` | Prepend new measurement |

**PR Detection Logic (in `SessionPage.handleLogSet`):**
```
After each set is logged:
1. Calculate volume = weight × reps
2. Look up existing PR for this exercise
3. If weight > bestWeight OR reps > bestReps OR volume > bestVolume → update PR
4. Append to PR history
5. Mark exercise as having a PR, show confetti animation
```

### Nutrition Domain

| Action | Signature | Description |
|--------|-----------|-------------|
| `updateDailyNutrition` | `(date: string, nutrition: DailyNutrition) => void` | Replace full daily nutrition entry |
| `saveMealTemplates` | `(templates: MealTemplate[]) => void` | Replace meal template list |
| `addRecentFood` | `(food: FoodItem) => void` | Add food to recent list (dedupes by name, max 20) |

### Hydration Domain

| Action | Signature | Description |
|--------|-----------|-------------|
| `addHydrationEntry` | `(date: string, entry: HydrationEntry) => void` | Add water intake, auto-sum total |
| `updateDailyHydrationGoal` | `(goal: number) => void` | Update hydration goal in settings |

### Data Management Domain

| Action | Signature | Description |
|--------|-----------|-------------|
| `exportData` | `() => string` | Serialize entire state to JSON string |
| `importData` | `(json: string) => boolean` | Parse JSON, replace state, return success |
| `resetAllData` | `() => void` | Reset to defaults (including default workout plan) |
| `loadSampleData` | `(data: Partial<AppState>) => void` | Merge sample/test data into current state |

---

## 5. Feature Inventory

### 5.1 Onboarding (`OnboardingPage`)
- Multi-step wizard (runs when `settings.onboardingComplete === false`)
- **Step 1:** Estimated 1RM maxes for 8 key lifts
- **Step 2:** Daily macro targets (protein, carbs, fats, calories)
- **Step 3:** Hydration goal (ml/day)
- Calls `completeOnboarding()` on finish

### 5.2 Home Dashboard (`HomePage`)
- Time-based greeting
- Current day workout card with "Start Workout" CTA
- Quick stats row: total sessions, weekly volume (with sparkline), PR count
- Weekly volume bar chart (`WeeklyVolumeChart`)
- Hydration widget with quick-add buttons (250ml, 500ml, 750ml)
- In-progress session recovery banner
- **Smart nudges:**
  - "Last workout X days ago" if >2 days since training
  - "Recovery day?" if ≥3 consecutive training days
  - "Deload week?" if total sessions ≥16 and on a deload cadence
  - "Measurement Day" on Sundays
- Streak counter with flame animation

### 5.3 Workout Plan (`WorkoutPage`, `WorkoutDayPage`)
- View all 7 days as cards with muscle focus badges
- Tap a day → see exercise list with sets/reps/rest
- Start session from any day

### 5.4 Plan Editor (`EditPlanPage`, `EditDayPage`)
- Add/remove/reorder workout days
- Edit individual exercises: name, muscle groups, sets, rep range, rest, form cue, type
- Add/remove exercises within a day
- Superset pairing support

### 5.5 Live Session (`SessionPage`)
- **Session timer** (elapsed time, warns after 90 min)
- **Exercise navigation pills** (numbered, shows completion status)
- **Set logging:** weight (kg), reps, RPE (6-10 selector)
- **Auto-fill:** Weight from last session's matching set
- **Input validation:** Prevents 0 weight/reps, warns on extreme values (>100 reps, >500kg)
- **Rest timer:** Countdown overlay with ±15s adjust, vibration on complete, skip option
- **Rest timer overrides:** Per-exercise custom rest times from settings
- **Plate calculator:** Shows which plates to load on each side of the barbell
- **Progressive overload recommendations:** Shows suggestion badge per exercise
- **PR detection:** Real-time PR check after each set, confetti animation
- **Hydration reminders:** Every 4th set
- **Last session reference:** Shows previous weight/reps for current set number
- **Session notes:** Free-text notes on completion
- **Exercise type handling:**
  - Bilateral: standard weight/reps
  - Unilateral: side indicator (left/right)
  - Timed: duration in seconds instead of reps
  - Bodyweight: no weight input
- **Superset display:** Shows paired exercises together
- **Abandon session:** Confirmation dialog

### 5.6 Session Complete (`SessionCompletePage`)
- Summary: duration, total volume, total sets, PRs hit
- Exercise-by-exercise breakdown
- Navigation back to home

### 5.7 History (`HistoryPage`)
- Chronological list of past sessions
- Each entry shows: day name, date, volume, sets, PRs, duration

### 5.8 Personal Records (`RecordsPage` — PRs tab)
- Grouped by primary muscle group
- Each PR card shows: exercise name, best weight, best reps, best volume
- Tap → detail sheet with PR history chart (weight over time)
- PRs sorted by best weight within each muscle group

### 5.9 Body Measurements (`RecordsPage` — Body tab)
- 9 measurement points: bodyweight, left/right arm, chest, waist, left/right quad, left/right calf
- "Log Measurements" button → form sheet
- **Bodyweight trend chart** with linear regression trend line
- **Summary stats:** Current weight, total change, weekly rate of change
- **Date comparison tool:** Select two dates, see side-by-side measurement diffs
- **Measurement history:** Cards showing all logged measurements with deltas from previous

### 5.10 Nutrition (`NutritionPage`)
- **5-meal daily plan** (default templates: Breakfast, Pre-Workout, Post-Workout, Dinner, Night Snack)
- **Daily macro summary:** progress bars for P/C/F/Cal with color coding
- **Meal cards:**
  - Completion status (checkmark or "Next Up" badge)
  - Timestamp when completed
  - Pre/Post workout tags (⚡ Zap icon)
  - Macro chip breakdown per meal
  - Expandable food item list
  - Edit meal name/tags, delete foods
- **Quick-Log sheet** (bottom sheet):
  - Recent foods chips (tap to add)
  - Manual entry: food name + P/C/F/Cal
  - Auto-calorie calculation: P×4 + C×4 + F×9
  - "Add & enter another" for multi-food logging
  - "Skip & Complete" to mark meal done without food
  - Link to detailed food entry form
- **Add Food sheet** (detailed): name, quantity, macros, auto-cal
- **Edit Meal sheet:** rename, toggle pre/post workout flags
- **Recent foods system:** Last 20 foods, deduped by name, shown in quick-log
- **Hydration section:** Daily progress bar, quick-add buttons, entry log

### 5.11 Settings (`SettingsPage`)
- **Theme toggle:** Dark/light mode
- **Edit Workout Plan:** Link to plan editor
- **Estimated 1RM Maxes:** Collapsible form for 8 lifts
- **Macro Targets:** Collapsible form for P/C/F/Cal + hydration goal
- **Rest Timer Overrides:** Bottom sheet listing all exercises with custom rest time inputs
- **Data Management:**
  - Export backup (JSON file download)
  - Import backup (file picker)
  - Reset all data (type "RESET" to confirm)
- **Developer/Testing:**
  - Load Sample Data button (merges realistic test data into current state)

---

## 6. Progressive Overload Algorithm

Defined in `src/lib/progressiveOverload.ts`.

### Function: `getExerciseRecommendation(exercise, sessions)`

**Inputs:**
- `exercise: Exercise` — the exercise to analyze
- `sessions: WorkoutSession[]` — all completed sessions (newest first)

**Process:**
1. Find last 3 sessions containing this exercise
2. From the most recent session, calculate averages: `avgWeight`, `avgReps`, `avgRpe`
3. Determine increment: **5 kg** for lower body, **2.5 kg** for upper body
4. Apply decision logic:

| Condition | Recommendation | Action |
|-----------|---------------|--------|
| `avgReps ≥ repRangeMax` AND `avgRpe < 9` | `add_weight` | `suggestedWeight = avgWeight + increment` |
| `avgReps ≥ repRangeMin` AND `avgRpe ≥ 9` | `maintain` | Stay at current weight |
| `avgReps < repRangeMin` | `consolidate` | Reduce expectations, build back up |
| Same weight across 3+ sessions AND not `add_weight` | `stall` | Plateau detected |

5. Return `ExerciseRecommendation` with suggested weight/reps

### Function: `getRecommendationLabel(rec)`

Returns display metadata:
| Recommendation | Label | Color | Icon |
|----------------|-------|-------|------|
| `add_weight` | "Add Weight" | green | ↑ |
| `maintain` | "Maintain" | primary | → |
| `consolidate` | "Consolidate" | amber | ↓ |
| `stall` | "Plateau" | destructive | ⚠ |

### Lower Body Muscle Groups
`quads`, `hamstrings`, `glutes`, `calves` — get 5kg increments. Everything else gets 2.5kg.

---

## 7. Default Workout Plan & Exercise ID Map

Plan ID: `default_hypertrophy_7day`  
Plan Name: "7-Day Hypertrophy Split"

Exercise IDs are generated sequentially by a counter (`ex_1`, `ex_2`, ...) except for superset exercises which have custom IDs.

### Day 1: Legs — Quad Focus + Abs (`day_1`)
| ID | Exercise | Muscles | Sets | Reps | Rest | Type |
|----|----------|---------|------|------|------|------|
| `ex_1` | Back Squat | quads, glutes | 4 | 6-8 | 180s | bilateral |
| `ex_2` | Hack Squat | quads | 3 | 8-10 | 120s | bilateral |
| `ex_3` | Leg Press | quads, glutes | 3 | 10-12 | 120s | bilateral |
| `ex_4` | Walking Lunges | quads, glutes | 3 | 10-12 | 90s | unilateral |
| `ex_5` | Leg Extension | quads | 3 | 12-15 | 60s | bilateral |
| `ex_6` | Standing Calf Raise | calves | 4 | 12-15 | 60s | bilateral |
| `ex_7` | Seated Calf Raise | calves | 3 | 15-20 | 60s | bilateral |
| `ex_8` | Cable Crunch | abs | 3 | 15-20 | 60s | bilateral |
| `ex_9` | Hanging Leg Raise | abs | 3 | 12-15 | 60s | bilateral |

### Day 2: Push — Chest/Shoulders/Triceps + Abs (`day_2`)
| ID | Exercise | Muscles | Sets | Reps | Rest | Type |
|----|----------|---------|------|------|------|------|
| `ex_10` | Flat Barbell Bench Press | chest, triceps, front_delts | 4 | 6-8 | 180s | bilateral |
| `ex_11` | Incline Dumbbell Press | chest, front_delts | 3 | 8-10 | 120s | bilateral |
| `ex_12` | Cable Crossover (Low-to-High) | chest | 3 | 12-15 | 60s | bilateral |
| `ex_13` | Overhead Press (Barbell) | front_delts, triceps | 4 | 6-8 | 150s | bilateral |
| `ex_14` | Lateral Raise (Dumbbell) | side_delts | 4 | 12-15 | 60s | bilateral |
| `ex_15` | Tricep Pushdown (Rope) | triceps | 3 | 12-15 | 60s | bilateral |
| `ex_16` | Overhead Tricep Extension (Cable) | triceps | 3 | 10-12 | 60s | bilateral |
| `ex_17` | Plank | abs | 3 | 45-60s | 60s | timed |
| `ex_18` | Side Plank | obliques | 3 | 30-45s | 60s | timed |

### Day 3: Pull — Back/Biceps + Abs (`day_3`)
| ID | Exercise | Muscles | Sets | Reps | Rest | Type |
|----|----------|---------|------|------|------|------|
| `ex_19` | Barbell Row (Overhand) | lats, upper_back, biceps | 4 | 6-8 | 150s | bilateral |
| `ex_20` | Pull-Up (Weighted) | lats, biceps | 4 | 6-10 | 120s | bodyweight |
| `ex_21` | Seated Cable Row (Close Grip) | lats, upper_back | 3 | 10-12 | 90s | bilateral |
| `ex_22` | Single-Arm Dumbbell Row | lats, upper_back | 3 | 10-12 | 90s | unilateral |
| `ex_23` | Face Pull | rear_delts, upper_back | 3 | 15-20 | 60s | bilateral |
| `ex_24` | Barbell Curl | biceps | 3 | 8-10 | 90s | bilateral |
| `ex_25` | Incline Dumbbell Curl | biceps | 3 | 10-12 | 60s | bilateral |
| `ex_26` | Hammer Curl | biceps, forearms | 3 | 10-12 | 60s | bilateral |
| `ex_27` | Ab Wheel Rollout | abs | 3 | 10-15 | 60s | bilateral |
| `ex_28` | Bicycle Crunch | abs, obliques | 3 | 15-20 | 60s | bilateral |

### Day 4: Legs — Posterior Chain + Arm Finisher (`day_4`)
| ID | Exercise | Muscles | Sets | Reps | Rest | Type |
|----|----------|---------|------|------|------|------|
| `ex_29` | Romanian Deadlift (RDL) | hamstrings, glutes, lower_back | 4 | 8-10 | 150s | bilateral |
| `ex_30` | Bulgarian Split Squat | quads, glutes | 3 | 8-10 | 120s | unilateral |
| `ex_31` | Leg Curl (Lying or Seated) | hamstrings | 3 | 10-12 | 90s | bilateral |
| `ex_32` | Hip Thrust (Barbell) | glutes | 4 | 8-12 | 120s | bilateral |
| `ex_33` | Good Morning | hamstrings, lower_back, glutes | 3 | 10-12 | 90s | bilateral |
| `ex_34` | Standing Calf Raise | calves | 4 | 12-15 | 60s | bilateral |
| `ex_35` | Reverse Curl (EZ Bar) | forearms, biceps | 3 | 12-15 | 60s | bilateral |
| `ex_36` | Tricep Dip (Weighted) | triceps, chest | 3 | 8-10 | 120s | bodyweight |
| `ex_37` | Wrist Curl | forearms | 3 | 15-20 | 60s | bilateral |
| `ex_38` | Plank | abs | 3 | 45-60s | 60s | timed |

### Day 5: Shoulders + Arms + Abs (`day_5`)

**⚠️ Contains supersets — custom IDs**

| ID | Exercise | Muscles | Sets | Reps | Rest | Type | Superset |
|----|----------|---------|------|------|------|------|----------|
| `ex_39` | Overhead Press (Dumbbell) | front_delts, triceps | 4 | 8-10 | 120s | bilateral | — |
| `ex_40` | Arnold Press | front_delts, side_delts | 3 | 10-12 | 90s | bilateral | — |
| `ex_41` | Lateral Raise (Cable) | side_delts | 4 | 12-15 | 60s | unilateral | — |
| `ex_42` | Reverse Pec Deck | rear_delts | 3 | 12-15 | 60s | bilateral | — |
| `ss5_1a` | Barbell Curl | biceps | 3 | 8-10 | 90s | bilateral | paired with `ss5_1b` |
| `ss5_1b` | Skull Crusher (EZ Bar) | triceps | 3 | 8-10 | 90s | bilateral | paired with `ss5_1a` |
| `ss5_2a` | Hammer Curl | biceps, forearms | 3 | 10-12 | 60s | bilateral | paired with `ss5_2b` |
| `ss5_2b` | Tricep Kickback | triceps | 3 | 10-12 | 60s | bilateral | paired with `ss5_2a` |
| `ex_47` | Concentration Curl | biceps | 3 | 12-15 | 60s | unilateral | — |
| `ex_48` | Overhead Cable Tricep Extension | triceps | 3 | 12-15 | 60s | bilateral | — |
| `ex_49` | Cable Crunch | abs | 3 | 15-20 | 60s | bilateral | — |
| `ex_50` | Hanging Knee Raise | abs | 3 | 12-15 | 60s | bilateral | — |
| `ex_51` | Russian Twist | obliques | 3 | 15-20 | 60s | bilateral | — |

> **Note:** The counter jumps because `ss5_*` IDs replace `ex_43`–`ex_46`. The uid() counter continues at `ex_47`.

### Day 6: Legs — High Volume + Back Thickness (`day_6`)
| ID | Exercise | Muscles | Sets | Reps | Rest | Type |
|----|----------|---------|------|------|------|------|
| `ex_52` | Front Squat | quads, abs | 4 | 6-8 | 180s | bilateral |
| `ex_53` | Leg Press (Narrow Stance) | quads | 3 | 12-15 | 120s | bilateral |
| `ex_54` | Sissy Squat or Smith Machine Squat | quads | 3 | 12-15 | 90s | bilateral |
| `ex_55` | Leg Extension | quads | 3 | 15-20 | 60s | bilateral |
| `ex_56` | T-Bar Row | lats, upper_back | 4 | 8-10 | 120s | bilateral |
| `ex_57` | Chest-Supported Row | upper_back, rear_delts | 3 | 10-12 | 90s | bilateral |
| `ex_58` | Seated Calf Raise | calves | 4 | 15-20 | 60s | bilateral |
| `ex_59` | Dead Bug | abs | 3 | 12-15 | 60s | bilateral |

### Day 7: Full Arms + Abs (`day_7`)

**⚠️ Contains supersets — custom IDs**

| ID | Exercise | Muscles | Sets | Reps | Rest | Type | Superset |
|----|----------|---------|------|------|------|------|----------|
| `ss7_1a` | EZ Bar Curl | biceps | 4 | 8-10 | 90s | bilateral | paired with `ss7_1b` |
| `ss7_1b` | Close Grip Bench Press | triceps, chest | 4 | 8-10 | 90s | bilateral | paired with `ss7_1a` |
| `ss7_2a` | Preacher Curl | biceps | 3 | 10-12 | 60s | bilateral | paired with `ss7_2b` |
| `ss7_2b` | Overhead Tricep Extension (DB) | triceps | 3 | 10-12 | 60s | bilateral | paired with `ss7_2a` |
| `ss7_3a` | Spider Curl | biceps | 3 | 12-15 | 60s | bilateral | paired with `ss7_3b` |
| `ss7_3b` | Rope Pushdown | triceps | 3 | 12-15 | 60s | bilateral | paired with `ss7_3a` |
| `ex_66` | Cross-Body Hammer Curl | biceps, forearms | 3 | 12-15 | 60s | unilateral | — |
| `ex_67` | Diamond Push-Up | triceps, chest | 3 | 12-20 | 60s | bodyweight | — |
| `ex_68` | Reverse Curl | forearms, biceps | 3 | 15-20 | 60s | bilateral | — |
| `ex_69` | Cable Crunch | abs | 3 | 15-20 | 60s | bilateral | — |
| `ex_70` | Plank (Weighted) | abs | 3 | 45-60s | 60s | timed | — |

### Critical ID Notes

- **Regular exercises:** `ex_1` through `ex_70` (with gaps due to supersets)
- **Day 5 supersets:** `ss5_1a`, `ss5_1b`, `ss5_2a`, `ss5_2b`
- **Day 7 supersets:** `ss7_1a`, `ss7_1b`, `ss7_2a`, `ss7_2b`, `ss7_3a`, `ss7_3b`
- **Exercise IDs are the foreign key** linking Sessions, PRs, and progressive overload. Changing them will break all historical data.
- IDs are generated by a module-level counter in `workoutPlan.ts`. If exercises are reordered in code, IDs change.

### Key Exercise → ID Mappings (for backend seeding)

| Exercise | ID |
|----------|-----|
| Back Squat | `ex_1` |
| Hack Squat | `ex_2` |
| Leg Press | `ex_3` |
| Flat Barbell Bench Press | `ex_10` |
| Overhead Press (Barbell) | `ex_13` |
| Barbell Row (Overhand) | `ex_19` |
| Pull-Up (Weighted) | `ex_20` |
| Barbell Curl (Day 3) | `ex_24` |
| Romanian Deadlift (RDL) | `ex_29` |
| Bulgarian Split Squat | `ex_30` |
| Hip Thrust | `ex_32` |
| Front Squat | `ex_52` |
| T-Bar Row | `ex_56` |

---

## 8. Backend Migration Guide

### Current Storage

- **Mechanism:** Zustand `persist` → `localStorage`
- **Key:** `hypertrophy-tracker-storage`
- **Format:** JSON blob containing entire `AppState`
- **Limitations:** Single device, no sync, ~5MB browser limit

### Suggested Database Schema

```sql
-- Users (currently implicit, single user)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User settings
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  onboarding_complete BOOLEAN DEFAULT false,
  theme TEXT DEFAULT 'dark',
  current_day_index INTEGER DEFAULT 0,
  hydration_goal INTEGER DEFAULT 3000,
  estimated_maxes JSONB DEFAULT '{}',
  macro_targets JSONB DEFAULT '{"protein":200,"carbs":300,"fats":80,"calories":2800}',
  rest_timer_overrides JSONB DEFAULT '{}'
);

-- Workout plans
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Workout days
CREATE TABLE workout_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES workout_plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  focus_muscles TEXT[] DEFAULT '{}',
  sort_order INTEGER
);

-- Exercises (definition, not logged)
CREATE TABLE exercises (
  id TEXT PRIMARY KEY,  -- Keep string IDs like "ex_1", "ss5_1a"
  day_id UUID REFERENCES workout_days(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  muscle_groups TEXT[] NOT NULL,
  type TEXT DEFAULT 'bilateral',
  sets INTEGER NOT NULL,
  rep_range_min INTEGER NOT NULL,
  rep_range_max INTEGER NOT NULL,
  rest_seconds INTEGER DEFAULT 90,
  form_cue TEXT,
  superset_pair_id TEXT,
  notes TEXT,
  sort_order INTEGER
);

-- Workout sessions
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  day_id TEXT NOT NULL,       -- References workout day string ID
  day_name TEXT NOT NULL,
  day_number INTEGER,
  date DATE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  total_volume NUMERIC DEFAULT 0,
  total_sets INTEGER DEFAULT 0,
  prs_hit INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Logged exercises (within a session)
CREATE TABLE logged_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  personal_record BOOLEAN DEFAULT false,
  notes TEXT,
  sort_order INTEGER
);

-- Logged sets (within a logged exercise)
CREATE TABLE logged_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logged_exercise_id UUID REFERENCES logged_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  weight NUMERIC DEFAULT 0,
  reps INTEGER DEFAULT 0,
  rpe NUMERIC DEFAULT 8,
  completed BOOLEAN DEFAULT true,
  timestamp TIMESTAMPTZ NOT NULL,
  side TEXT,               -- 'left' | 'right' | null
  duration INTEGER         -- seconds, for timed exercises
);

-- Personal records
CREATE TABLE personal_records (
  exercise_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  exercise_name TEXT NOT NULL,
  best_weight NUMERIC DEFAULT 0,
  best_weight_date DATE,
  best_reps INTEGER DEFAULT 0,
  best_reps_date DATE,
  best_volume NUMERIC DEFAULT 0,
  best_volume_date DATE,
  PRIMARY KEY (exercise_id, user_id)
);

-- PR history entries
CREATE TABLE pr_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  weight NUMERIC NOT NULL,
  reps INTEGER NOT NULL,
  rpe NUMERIC
);

-- Body measurements
CREATE TABLE body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  bodyweight NUMERIC,
  left_arm NUMERIC,
  right_arm NUMERIC,
  chest NUMERIC,
  waist NUMERIC,
  left_quad NUMERIC,
  right_quad NUMERIC,
  left_calf NUMERIC,
  right_calf NUMERIC,
  notes TEXT
);

-- Daily nutrition
CREATE TABLE daily_nutrition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  consumed JSONB DEFAULT '{"protein":0,"carbs":0,"fats":0,"calories":0}',
  UNIQUE(user_id, date)
);

-- Meal entries
CREATE TABLE meal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_nutrition_id UUID REFERENCES daily_nutrition(id) ON DELETE CASCADE,
  meal_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  timestamp TIMESTAMPTZ,
  is_pre_workout BOOLEAN DEFAULT false,
  is_post_workout BOOLEAN DEFAULT false,
  notes TEXT,
  sort_order INTEGER
);

-- Food items (within meals)
CREATE TABLE food_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_entry_id UUID REFERENCES meal_entries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  protein NUMERIC DEFAULT 0,
  carbs NUMERIC DEFAULT 0,
  fats NUMERIC DEFAULT 0,
  calories NUMERIC DEFAULT 0,
  quantity TEXT
);

-- Meal templates
CREATE TABLE meal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  is_pre_workout BOOLEAN DEFAULT false,
  is_post_workout BOOLEAN DEFAULT false,
  sort_order INTEGER
);

-- Daily hydration
CREATE TABLE daily_hydration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  goal INTEGER DEFAULT 3000,
  total INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Hydration entries
CREATE TABLE hydration_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_hydration_id UUID REFERENCES daily_hydration(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL
);

-- Recent foods (per user, max 20)
CREATE TABLE recent_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  protein NUMERIC DEFAULT 0,
  carbs NUMERIC DEFAULT 0,
  fats NUMERIC DEFAULT 0,
  calories NUMERIC DEFAULT 0,
  quantity TEXT,
  used_at TIMESTAMPTZ DEFAULT now()
);
```

### API Endpoints (REST mapping from store actions)

| Store Action | HTTP Method | Endpoint | Notes |
|-------------|-------------|----------|-------|
| `updateSettings` | PATCH | `/api/settings` | Merge partial JSON |
| `updateEstimatedMaxes` | PATCH | `/api/settings/maxes` | |
| `updateMacroTargets` | PATCH | `/api/settings/macros` | |
| `completeOnboarding` | POST | `/api/settings/onboarding` | |
| `updateWorkoutPlan` | PUT | `/api/workout-plan` | |
| `updateWorkoutDay` | PATCH | `/api/workout-days/:dayId` | |
| `addWorkoutDay` | POST | `/api/workout-days` | |
| `removeWorkoutDay` | DELETE | `/api/workout-days/:dayId` | |
| `reorderWorkoutDays` | PUT | `/api/workout-days/order` | Body: `{ dayIds: string[] }` |
| `updateExercise` | PATCH | `/api/workout-days/:dayId/exercises/:exId` | |
| `addExercise` | POST | `/api/workout-days/:dayId/exercises` | |
| `removeExercise` | DELETE | `/api/workout-days/:dayId/exercises/:exId` | |
| `reorderExercises` | PUT | `/api/workout-days/:dayId/exercises/order` | Body: `{ exerciseIds: string[] }` |
| `startSession` | POST | `/api/sessions` | Returns session ID |
| `updateInProgressSession` | PATCH | `/api/sessions/:id/progress` | Send updated exercise/set data |
| `completeSession` | POST | `/api/sessions/:id/complete` | Server calculates streak |
| `clearInProgressSession` | DELETE | `/api/sessions/in-progress` | |
| `updatePersonalRecord` | PUT | `/api/records/:exerciseId` | Server should validate PR logic |
| `addBodyMeasurement` | POST | `/api/body-measurements` | |
| `updateDailyNutrition` | PUT | `/api/nutrition/:date` | |
| `addRecentFood` | POST | `/api/recent-foods` | Server enforces max 20 |
| `addHydrationEntry` | POST | `/api/hydration/:date/entries` | Server recalculates total |
| `exportData` | GET | `/api/export` | Returns full JSON |
| `importData` | POST | `/api/import` | Accepts full JSON |

### Auth Considerations

- Currently **no authentication** — single user, all data local
- For multi-user: add JWT/session-based auth
- Each table needs a `user_id` foreign key
- Row-Level Security (RLS) policies: users can only access their own data

### Offline-First Sync Strategy

For React Native mobile app:
1. **Local-first:** Use MMKV or WatermelonDB for local storage
2. **Queue changes:** Store mutations in a sync queue when offline
3. **Conflict resolution:** Last-write-wins for most fields; merge for arrays (sessions, measurements)
4. **Sync on reconnect:** Push queued mutations, pull latest state
5. **Optimistic updates:** Apply changes locally first, sync in background

---

## 9. React Native Migration Notes

### Component Mapping

| Web (Current) | React Native Equivalent |
|---------------|------------------------|
| `<div>` | `<View>` |
| `<p>`, `<span>` | `<Text>` |
| `<button>` | `<TouchableOpacity>` or `<Pressable>` |
| `<input>` | `<TextInput>` |
| shadcn/ui `<Card>` | Custom `<View>` with styles or React Native Paper |
| shadcn/ui `<Sheet>` | `@gorhom/bottom-sheet` |
| shadcn/ui `<Dialog>` | `react-native-modal` or RN `Modal` |
| shadcn/ui `<Tabs>` | `react-native-tab-view` or custom |
| shadcn/ui `<Progress>` | `react-native-progress` or custom `<View>` |
| shadcn/ui `<Switch>` | React Native `<Switch>` |
| shadcn/ui `<Select>` | `@react-native-picker/picker` or custom bottom sheet |
| shadcn/ui `<ScrollArea>` | `<ScrollView>` or `<FlatList>` |
| shadcn/ui `<Collapsible>` | `react-native-collapsible` or Reanimated |
| Tailwind CSS | NativeWind (Tailwind for RN) or StyleSheet |

### Navigation

| Web | React Native |
|-----|-------------|
| `react-router-dom` | `@react-navigation/native` |
| `<Routes>` + `<Route>` | Stack Navigator + Tab Navigator |
| `useNavigate()` | `useNavigation()` |
| `useParams()` | `useRoute().params` |
| Bottom nav (`<Link>`) | Bottom Tab Navigator |
| `/session` (no nav) | Stack screen with `headerShown: false` |

### Charts

| Web | React Native |
|-----|-------------|
| Recharts `<LineChart>` | `react-native-chart-kit` or `victory-native` |
| Recharts `<BarChart>` | Same libraries |
| Custom sparklines | `react-native-svg` + manual paths |

### Animations

| Web | React Native |
|-----|-------------|
| Framer Motion `<motion.div>` | `react-native-reanimated` `<Animated.View>` |
| `AnimatePresence` | Layout animations or `Animated.View` with `entering`/`exiting` |
| CSS `@keyframes` | Reanimated `withTiming`, `withSpring` |
| `navigator.vibrate()` | `react-native-haptic-feedback` or `Vibration` API |

### Storage

| Web | React Native |
|-----|-------------|
| `localStorage` | `@react-native-async-storage/async-storage` or `react-native-mmkv` (faster) |
| Zustand `persist` | Zustand `persist` with AsyncStorage or MMKV adapter |

### Platform-Specific Considerations

- **Haptic feedback:** Replace `navigator.vibrate()` with `react-native-haptic-feedback` for richer tactile responses
- **File export:** Use `react-native-share` or `react-native-fs` for JSON backup export
- **Notifications:** Add push notifications for rest day reminders, meal reminders (use `react-native-push-notification`)
- **Keep screen awake:** During active sessions, use `react-native-keep-awake`
- **Safe areas:** Use `react-native-safe-area-context` for notch/island handling
- **Keyboard handling:** Use `KeyboardAvoidingView` for input screens

---

## Appendix: Sample Data Reference

Sample data is defined in `src/data/sampleData.ts` and loaded via the "Load Sample Data" button in Settings.

### Sample Sessions (3)
- **Session 1:** Day 1 (Legs), 3 exercises logged (Back Squat PR, Hack Squat, Leg Press)
- **Session 2:** Day 2 (Push), 2 exercises logged (Bench Press PR, OHP)
- **Session 3:** Day 3 (Pull), 1 exercise logged (Barbell Row)

### Sample PRs (5)
- Back Squat (`ex_1`): 105kg
- Flat Barbell Bench Press (`ex_10`): 85kg
- Romanian Deadlift (`ex_29`): 100kg
- Overhead Press (`ex_13`): 52.5kg
- Barbell Row (`ex_19`): 75kg

### Sample Body Measurements (4 entries)
- Bodyweight progression: 81.0 → 81.5 → 82.0 → 82.3 kg over 14 days
- Includes: chest, waist, arms, quads

### Sample Nutrition (1 day)
- 2 meals completed (Breakfast + Pre-Workout)
- 3 meals pending
- Consumed: P68g C59g F17.6g 685cal

### Sample Hydration (1 day)
- 1500ml of 3000ml goal (3 entries of 500ml each)

### Sample Estimated Maxes
- Squat 130, Bench 100, RDL 120, OHP 65, Pull-Up +20, Row 90, Curl 45, Dip +25

---

*End of Technical Handoff Document*
