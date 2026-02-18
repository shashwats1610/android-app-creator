

# Hypertrophy Tracker — Frontend Implementation Plan

## Phase 1: Foundation
- **Theming system** with Dark mode (default, gym aesthetic with neon accents) and Light mode toggle
- **Bottom tab navigation** (5 tabs): Home, Workout, History, Records, Settings
- **TypeScript type definitions** for all data models (exercises, sets, sessions, measurements, nutrition)
- **Zustand state management** with localStorage persistence (maps to AsyncStorage for native)
- **Mobile-first layout** with 48×48px minimum touch targets throughout

## Phase 2: Data & Onboarding
- **Complete 7-day workout plan** pre-loaded with all exercises, sets, rep ranges, rest times, form cues, and superset pairings from the spec (Days 1-7, ~70 exercises total)
- **3-step onboarding flow**: Welcome → Estimated 1RM input for compound lifts → Macro/hydration goals
- All onboarding values editable later from Settings

## Phase 3: Home Dashboard
- Today's workout card with "Start Workout" button showing current day in the split
- In-progress session recovery banner
- Quick stats: streak counter, phase indicator, weekly summary
- Hydration tracker widget with progress bar and quick-add buttons
- Sunday measurement reminder banner
- Navigation cards to Stats and Nutrition

## Phase 4: Live Workout Session (Core Feature)
- **Pre-session screen** with progressive overload recommendations (add weight / maintain / consolidate / stall) — all editable
- **Set logging**: weight, reps, RPE (1-10), complete button per set
- **Per-side logging** for unilateral exercises (left/right)
- **Time-based exercises** with countdown timer (e.g., planks)
- **Superset handling** with visual pairing and auto-transition
- **Rest timer** with countdown, ±15s adjust, skip button
- **Form cue bottom sheet** per exercise
- **Beat-last-session indicators** (green/amber) on each set
- **PR flash celebration** animation when records are broken
- **Hydration reminders** every 3-4 sets
- **Session timer** with 90-min warning
- Auto-save every logged set

## Phase 5: Session Complete & History
- **Session summary**: date, day name, total sets, total volume, volume comparison, PRs broken, elapsed time
- **History screen**: scrollable list of past sessions (reverse chronological)
- Weekly volume summaries by muscle group (collapsible)
- Tap any session for full detail view
- Missed session tracking

## Phase 6: Records & Body Stats
- **Personal Records board**: all exercises grouped by muscle group, best weight + reps with dates
- PR history timeline per exercise
- **Bodyweight graph** (line chart, last 90 days)
- **Body measurements**: arms, chest, waist, quads, calves (left/right)
- **Compare dates** feature: side-by-side comparison with color-coded differences

## Phase 7: Nutrition & Hydration
- **Daily macro tracker**: Protein, Carbs, Fats, Calories — targets vs. consumed with progress rings
- **Meal checklist** (Meals 1-5) with checkboxes and timestamps
- Pre/Post workout meals visually distinguished
- Weekly adherence score
- **Hydration tracker**: daily progress, quick-add buttons, 14-day bar chart, low-intake warnings

## Phase 8: Settings & Editability
- Edit estimated maxes for all compound lifts
- Edit macro targets and hydration goals
- Edit rest timer overrides per exercise
- **Full workout plan editor**: add/remove/reorder exercises, modify sets/reps/rest/cues, edit superset pairings, add/remove days
- Data export (JSON backup) and import with confirmation
- Reset all data (requires typing "RESET")
- Light/Dark mode toggle

## Phase 9: Antigravity Handoff Documentation (MD File)
- Complete component tree and file structure mapping (React web → Expo/React Native)
- All TypeScript types and data model documentation
- State management architecture and localStorage key mapping
- Feature-by-feature native implementation notes
- Native features to add: haptics, push notifications, file system access, expo-sharing
- Capacitor/EAS build configuration guidance
- UI component mapping table (shadcn/Radix → React Native equivalents)

