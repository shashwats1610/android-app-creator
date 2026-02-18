

# Practical Feature Additions

## Overview

After auditing every page, here are 7 high-impact features ordered by how much daily value they provide to a user actively training. None require a backend -- all work with the existing Zustand + localStorage architecture.

---

## 1. Auto-Fill Last Session Weights

**The problem:** Every set, the user has to manually type their weight even though 90% of the time it's the same as last session. This is the single biggest friction point during a workout.

**The solution:**
- When an exercise loads in `SessionPage`, auto-populate the weight input with the last session's weight for that exercise and set number
- Show a subtle "Last: 80kg x 10" chip above the input that the user can tap to instantly fill both weight and reps
- If no history exists, leave blank as today

**Files:** `src/pages/SessionPage.tsx`

---

## 2. Progressive Overload Engine

**The problem:** The types `OverloadRecommendation` and `ExerciseRecommendation` exist but are never used. This is the core value prop of a hypertrophy tracker -- telling users when to add weight.

**The solution:**
- Create a utility `src/lib/progressiveOverload.ts` that analyzes last 2-3 sessions for an exercise
- Logic:
  - If all sets hit top of rep range at RPE < 9 --> recommend "add_weight" (+2.5kg upper, +5kg lower)
  - If all sets hit rep range at RPE 9-10 --> "maintain"
  - If reps fell short of range --> "consolidate" (same weight, focus on form)
- Show recommendation as a colored badge on the pre-session exercise card and inside the session page
- Display suggested weight prominently: "Suggested: 82.5kg"

**Files:** `src/lib/progressiveOverload.ts` (new), `src/pages/SessionPage.tsx`, `src/pages/WorkoutDayPage.tsx`

---

## 3. Weekly Volume per Muscle Group Dashboard

**The problem:** Hypertrophy training is all about hitting enough weekly sets per muscle group (typically 10-20 sets). The app tracks volume in kg but never shows **sets per muscle group per week**, which is the metric that actually matters.

**The solution:**
- Add a "Weekly Volume" card to the Home page showing a horizontal bar chart of sets per muscle group this week
- Color-code: under 10 sets = amber (under-training), 10-20 = green (optimal), over 20 = red (potentially over-training)
- Tap to expand and see which exercises contributed to each muscle group
- Uses existing session data + workout plan muscle group mappings

**Files:** `src/pages/HomePage.tsx`, possibly a new `src/components/WeeklyVolumeChart.tsx`

---

## 4. Streak Calculation (Currently Broken)

**The problem:** The streak counter shows on the home page but is never actually updated. It's always 0.

**The solution:**
- After completing a session in `completeSession`, calculate streak by checking consecutive days (or every-other-day patterns common in lifting)
- A "day" counts if there's at least one session within it
- Allow rest days: streak only breaks after 3+ consecutive days without training (since most programs are 3-5 days/week)
- Update the `streak` value in the store on session completion

**Files:** `src/stores/useAppStore.ts` (update `completeSession`)

---

## 5. Plate Calculator

**The problem:** In the gym, users need to mentally calculate which plates to load on the bar. This is surprisingly annoying, especially at heavier weights or with mixed plate availability.

**The solution:**
- Add a small "plates" icon button next to the weight input in the session page
- Opens a bottom sheet showing: barbell weight (default 20kg, configurable) and a visual plate breakdown per side
- Supports standard plates: 25, 20, 15, 10, 5, 2.5, 1.25 kg
- Example: 100kg = bar (20kg) + per side: 1x25kg + 1x15kg

**Files:** `src/components/PlateCalculator.tsx` (new), `src/pages/SessionPage.tsx`

---

## 6. Session Notes

**The problem:** Users can't write notes during or after a workout. Things like "left shoulder felt tight", "gym was packed, had to substitute cable rows", or "felt great today" are critical context that helps future training decisions.

**The solution:**
- Add a notes text area at the bottom of the session page (collapsible, doesn't take up space by default)
- Add per-exercise notes (tap the info icon to expand a small textarea)
- Notes persist in the `WorkoutSession` and show in the History detail sheet
- The `notes` field already exists in the `WorkoutSession` type -- just needs UI

**Files:** `src/pages/SessionPage.tsx`, `src/pages/HistoryPage.tsx`

---

## 7. Rest Day / Deload Awareness

**The problem:** The app always shows "Start Workout" regardless of context. If the user trained hard for 4 days straight, there's no guidance about rest.

**The solution:**
- On the home page, if the user has trained 3+ consecutive days, show a subtle "Recovery day?" card with a message like "You've trained 3 days in a row -- consider a rest day for optimal recovery"
- During deload weeks (every 4th week based on session count), suggest lighter weights (auto-reduce progressive overload suggestions by 40%)
- This is advisory only -- never blocks the user from training

**Files:** `src/pages/HomePage.tsx`

---

## Technical Summary

| Feature | New Files | Modified Files | Complexity |
|---|---|---|---|
| Auto-fill weights | -- | SessionPage.tsx | Low |
| Progressive overload | progressiveOverload.ts | SessionPage, WorkoutDayPage | Medium |
| Weekly muscle volume | WeeklyVolumeChart.tsx | HomePage | Medium |
| Streak fix | -- | useAppStore.ts | Low |
| Plate calculator | PlateCalculator.tsx | SessionPage | Low |
| Session notes | -- | SessionPage, HistoryPage | Low |
| Rest day awareness | -- | HomePage | Low |

No new dependencies needed. All features use existing libraries (recharts for charts, framer-motion for animations, lucide for icons).
