

# Create Comprehensive Technical Handoff Document

## What

Create a detailed `TECHNICAL_HANDOFF.md` file at the project root that serves as a complete reference for Antigravity, Cursor, or any developer to understand the entire app architecture and build a backend from it.

## Why

Currently, the only documentation is the default Lovable README with no project-specific information. A developer picking up this project would need to manually trace through every file to understand the data models, state management, feature set, and how things connect.

## What the File Will Cover

### 1. Project Overview
- App purpose (hypertrophy/bodybuilding tracker), mobile-first React SPA
- Tech stack: React 18, Vite, TypeScript, Zustand, Tailwind CSS, shadcn/ui, Framer Motion, Recharts
- Designed for future conversion to React Native / Android APK

### 2. Architecture
- File structure map (pages, components, stores, types, data, lib, hooks)
- Routing table: all 14 routes mapped to their pages and purpose
- State management: single Zustand store with localStorage persistence

### 3. Complete Data Model Reference
- Every TypeScript interface from `src/types/workout.ts` documented with field descriptions
- 17 muscle group enums, 4 exercise types
- Entity relationships: WorkoutPlan > WorkoutDay > Exercise, Session > LoggedExercise > LoggedSet, etc.

### 4. Store Actions (API Surface)
- All 25+ store actions grouped by domain (Settings, Workout Plan, Sessions, Records, Nutrition, Hydration, Data Management)
- Input/output types for each action
- Business logic notes (streak calculation, PR tracking, progressive overload algorithm)

### 5. Feature Inventory
- **Onboarding**: estimated maxes, macro targets, hydration goal setup
- **Workout Plan**: 7-day hypertrophy split, 70+ exercises with form cues, superset support
- **Live Session**: set logging with weight/reps/RPE, rest timer with vibration, plate calculator, progressive overload recommendations
- **Personal Records**: weight/reps/volume PRs per exercise, history tracking
- **Body Measurements**: 9 measurement points, trend charts
- **Nutrition**: 5-meal daily plan, quick-log sheet, recent foods system, macro auto-calculation, meal templates
- **Hydration**: daily goal tracking, quick-add buttons
- **Settings**: theme toggle, data export/import/reset, sample data loader

### 6. Progressive Overload Algorithm
- Documented from `src/lib/progressiveOverload.ts`
- 4 recommendation states: add_weight, maintain, consolidate, stall
- Weight increment rules (5kg lower body, 2.5kg upper body)
- Stall detection across 3+ sessions

### 7. Default Workout Plan
- All 7 days with exercise IDs, muscle groups, set/rep schemes
- Superset pairings on Days 5 and 7
- Exercise ID mapping (ex_1 through ex_70+) critical for PR/session linkage

### 8. Backend Migration Guide
- Current storage: Zustand + localStorage (key: `hypertrophy-tracker-storage`)
- Suggested database tables mapping to TypeScript interfaces
- Auth considerations (currently none -- single user)
- API endpoints that would replace each store action
- Data sync strategy for offline-first mobile app

### 9. React Native Migration Notes
- Component mapping: shadcn/ui to React Native equivalents
- Navigation: react-router-dom to React Navigation
- Charts: Recharts to react-native-chart-kit or Victory Native
- Animations: Framer Motion to React Native Reanimated
- Storage: localStorage to AsyncStorage or MMKV

---

## Technical Details

### File Created

| File | Description |
|------|-------------|
| `TECHNICAL_HANDOFF.md` | ~800-line comprehensive reference document |

### Key Data Points Included

The document will contain exact exercise ID mappings (e.g., `ex_1` = Back Squat, `ex_10` = Bench Press, `ex_29` = RDL) which are critical for the backend to correctly link sessions, PRs, and progressive overload recommendations.

It will also include the complete store action signatures so a backend developer can create matching API endpoints without needing to read the Zustand store code.

