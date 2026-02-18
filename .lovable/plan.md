

# Redesign Daily Macros & Meal Logging for Real-World Flow

## Problem

The current nutrition page feels like a data-entry form rather than a natural post-meal logging experience. Users have to expand collapsibles, type full macro details for each food item, and navigate multiple sheets just to log what they ate. In reality, someone finishes a meal, pulls out their phone, and wants to log it in under 10 seconds.

## Design Philosophy

The new flow should mirror: **"I just ate. Let me log it."**

---

## Changes

### 1. Quick-Log Meal Flow (Tap to Complete with Inline Entry)

Instead of the current flow (expand collapsible > click add food > fill 6 fields in a sheet), tapping the check circle on a meal will open a **quick-log bottom sheet** that asks:

- "What did you eat?" (optional -- can skip to just mark as done)
- Quick macro entry right there: 4 inline number inputs (P / C / F / Cal) 
- A "Recent Foods" row showing the last 5-10 foods the user has logged (tap to auto-add)
- "Add detailed food item" link for users who want granular tracking
- Big "Done" button that checks off the meal and logs the timestamp

If the user just wants to check it off without details, a **"Skip & Complete"** link at the top lets them do that instantly.

### 2. Recent/Saved Foods System

- Store a `recentFoods: FoodItem[]` array in the app store (persisted, max 20 items, deduped by name)
- Show as horizontal scrollable chips in the quick-log sheet
- Tap a chip to instantly add that food with its saved macros
- This eliminates re-typing for the 80% of foods people eat repeatedly

### 3. Meal-Level Quick Macros

- Each MealCard shows a compact inline macro summary that updates live
- When a meal is completed, show the macro contribution in a subtle colored row
- Remove the global "Quick add macros manually" collapsible -- instead, each meal's quick-log sheet has its own macro fields, making per-meal tracking natural

### 4. Visual "What's Next" Indicator

- The next uncompleted meal gets a subtle highlighted border and a "Next up" badge
- Completed meals collapse slightly (reduced padding) to push focus to what's upcoming
- Time-based suggestion: if it's afternoon and breakfast isn't checked, show a gentle nudge

### 5. Smarter Calorie Auto-Calc

- When the user types Protein, Carbs, or Fats in the quick-log, the Calories field updates live (P x 4 + C x 4 + F x 9) unless manually overridden
- Show the formula result as placeholder text so users see what will be calculated

---

## Technical Details

### Files Modified

| File | Changes |
|------|---------|
| `src/types/workout.ts` | Add `recentFoods` to `AppState` |
| `src/stores/useAppStore.ts` | Add `recentFoods` state, `addRecentFood` action, persist it |
| `src/pages/NutritionPage.tsx` | Full rework of meal interaction flow |

### New Components (within NutritionPage.tsx)

- **QuickLogSheet**: Bottom sheet shown when tapping a meal's check circle. Contains: skip button, recent foods chips, inline P/C/F/Cal inputs, detailed food add link, done button.
- **RecentFoodChip**: Horizontal scrollable chip component showing food name + calories, tap to add.
- Refactored **MealCard**: Slimmer completed state, "Next up" badge logic, per-meal macro summary always visible (no collapsible needed for basic info).

### Store Changes

```
// New state
recentFoods: FoodItem[]  // max 20, most recent first

// New action  
addRecentFood: (food: FoodItem) => void
// Dedupes by name, keeps max 20, prepends new
```

### Flow Diagram

1. User taps meal check circle
2. QuickLogSheet opens with: recent foods row + macro inputs
3. User either:
   a. Taps recent food chips (auto-fills macros) and hits Done
   b. Types quick macros manually and hits Done  
   c. Taps "Add detailed food" to open the existing AddFoodSheet
   d. Taps "Skip & Complete" to just check off
4. Meal is marked complete with timestamp, macros are added to daily totals
5. Any new food items are saved to recentFoods for next time

### Data Safety

- All existing meal data and templates remain compatible
- `recentFoods` defaults to `[]` for existing users
- The `foods` array fallback (`|| []`) is preserved throughout

