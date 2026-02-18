

# Improve Meal Card UI + Add Sample Data for Testing

## Problem

1. **Meal Card UI**: The meal titles, badges, macros, and action buttons are all crammed into a single row, making them hard to read on mobile. The reorder arrows, check circle, name, badges, macros, timestamps, edit/delete buttons all compete for horizontal space.

2. **No sample data**: The app starts with empty states everywhere (no sessions, no PRs, no body measurements, no nutrition data, no hydration entries), making it impossible to test features without manually entering data first.

---

## Changes

### 1. Redesigned MealCard Layout

Restructure the card from a single cramped horizontal row into a cleaner multi-line layout:

- **Top row**: Check circle + Meal name (larger, always visible) + Pre/Post badges + "Next up" badge
- **Second row**: Macro summary (P / C / F / Cal) displayed as colored chips, always visible even if zero
- **Third row** (completed only): Timestamp + food count
- **Actions**: Edit/delete buttons aligned to the right of the top row, reorder arrows moved to a vertical strip on the left edge

Key visual improvements:
- Meal name gets `text-sm font-semibold` instead of being truncated in a tight row
- Macro chips use colored backgrounds (not just colored text) for better visibility
- Completed meals get a more distinct visual state with a green check overlay
- "Next up" badge is more prominent with a pulsing dot
- More vertical padding so content breathes

### 2. Sample Data Seed

Create a `src/data/sampleData.ts` file with realistic test data covering all features:

- **3 workout sessions** (past 3 days) with logged sets, PRs, volume
- **5 personal records** (squat, bench, RDL, OHP, barbell row) with history entries
- **4 body measurements** over 2 weeks (showing a trend)
- **Today's nutrition** with 2 completed meals (with foods/macros) and 3 uncompleted
- **Today's hydration** with a few entries totaling ~1500ml
- **5 recent foods** (chicken breast, rice, eggs, protein shake, oats)
- **Estimated maxes** filled in
- **Macro targets** set to realistic values

Add a "Load Sample Data" button on the Settings page that imports all this data at once, so the user can populate every feature with one tap.

---

## Technical Details

### Files Modified

| File | Changes |
|------|---------|
| `src/pages/NutritionPage.tsx` | Redesigned MealCard component with better layout |
| `src/data/sampleData.ts` | New file with comprehensive test data |
| `src/pages/SettingsPage.tsx` | Add "Load Sample Data" button |
| `src/stores/useAppStore.ts` | Add `loadSampleData` action |

### MealCard Layout Changes

Current layout (single row, everything horizontal):
```
[arrows] [check] [name badges macros timestamp] [edit delete]
```

New layout (structured vertically):
```
[arrows] | [check] [Meal Name]  [Pre] [Next up]  [edit] [delete]
         |         P:42  C:65  F:12  · 540cal
         |         Completed at 12:30 PM · 3 foods
```

### Sample Data Structure

The sample data will use dates relative to "today" so it always looks current:
- Sessions: today-1, today-2, today-4
- Body measurements: today, today-5, today-10, today-14
- Nutrition: today (with 2 completed meals + foods)
- Hydration: today (3 entries, ~1500ml)
- Recent foods: 5 common bodybuilding foods with realistic macros
- PRs: 5 compound lifts with 3-4 history entries each

### Settings Page Addition

A "Developer / Testing" section at the bottom of the Settings page with:
- "Load Sample Data" button that calls `loadSampleData()`
- Toast confirmation after loading
- Warning that it will merge with (not replace) existing data

