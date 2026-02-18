
# UI/UX Enhancement Plan for Hypertrophy App

## Overview
This plan covers a set of polish and usability improvements across the entire app -- from onboarding through workout sessions to history and settings. The focus is on making the app feel more premium, intuitive, and delightful to use on mobile.

---

## 1. Page Transitions and Navigation Polish

**Current issue:** Pages load with basic fade/slide but transitions between routes feel disconnected. Back buttons are inconsistent (some use icons, some use ghost buttons).

**Changes:**
- Add shared layout transitions using framer-motion `AnimatePresence` wrapping the `<Outlet />` in `AppLayout`
- Standardize all page headers with a reusable `PageHeader` component (back arrow + title + optional right action)
- Add haptic-style micro-interactions: scale-on-press for buttons and cards

---

## 2. Empty States

**Current issue:** History, Records, and Nutrition pages show blank space when there is no data.

**Changes:**
- Add illustrated empty states with contextual call-to-action for:
  - History: "No workouts yet -- start your first session"
  - Records/PRs: "Hit your first PR to see it here"
  - Body Measurements: "Log your first weigh-in"
- Use subtle Lucide icons + muted text + a single action button

---

## 3. Skeleton Loading States

**Current issue:** Pages pop in abruptly when data loads from Zustand (persisted storage).

**Changes:**
- Add skeleton pulse placeholders for the Home page cards, History week groups, and Records tabs while store hydrates
- Use the existing `Skeleton` UI component from shadcn

---

## 4. Session Page UX Improvements

**Current issue:** The session screen is functional but dense. The rest timer is full-screen but lacks personality.

**Changes:**
- Add a circular progress ring to the rest timer (replacing the linear progress bar) for a more visually engaging countdown
- Add a subtle vibration pattern completion cue (via `navigator.vibrate` where supported)
- Show a "swipe to next exercise" gesture hint on first use
- Animate the set completion checkmark with a satisfying spring animation
- Add a confetti/particle burst on PR detection (lightweight CSS-only)

---

## 5. Bottom Navigation Enhancements

**Current issue:** The nav works well but could feel more premium.

**Changes:**
- Add a subtle top-border glow on the active tab (matching the primary neon color)
- Add a badge dot on the History tab when a session was completed today
- Slightly increase the nav height and add a frosted-glass blur effect (already partially done with `backdrop-blur-lg`, enhance it)

---

## 6. Home Page Dashboard Refinements

**Current issue:** The home page is functional but the quick-stats row and nav cards are plain.

**Changes:**
- Add mini sparkline charts (7-day trend) inside the "Volume (wk)" stat card using a tiny recharts `<Sparkline>`
- Add a greeting based on time of day ("Good morning", "Good evening")
- Animate the streak counter with a flame pulse animation
- Add a "Last workout X days ago" subtle reminder if more than 2 days since last session

---

## 7. Improved Onboarding

**Current issue:** Onboarding is functional but minimal.

**Changes:**
- Add a "Skip all" link on step 1 for users who want defaults
- Add unit toggle (kg/lbs) on the 1RM step
- Add subtle background gradient animation on the welcome step
- Pre-fill macro suggestions based on common templates (e.g., "Bulking", "Cutting", "Maintenance" presets)

---

## 8. Pull-to-Refresh Pattern

**Changes:**
- Add a pull-to-refresh visual indicator on the Home page that re-calculates today's stats
- Implemented via a simple touch-gesture handler + rotation animation on refresh icon

---

## 9. Accessibility and Touch Improvements

**Changes:**
- Ensure all interactive elements have visible focus rings (already good with shadcn defaults, audit for custom buttons)
- Add `aria-label` to icon-only buttons (back arrows, info icons)
- Increase contrast on `text-[10px]` labels -- bump to `text-[11px]` with slightly less muted color
- Add `role="progressbar"` with `aria-valuenow` to all Progress components

---

## 10. Dark/Light Theme Polish

**Current issue:** Light mode exists but may not feel as polished as dark mode.

**Changes:**
- Audit light mode card shadows (add subtle `shadow-sm` to cards in light mode)
- Ensure neon colors have sufficient contrast in light mode
- Add a smooth color-scheme transition (`transition-colors duration-300` on body)

---

## Technical Approach

### New Components
- `src/components/PageHeader.tsx` -- Reusable header with back nav, title, right action slot
- `src/components/EmptyState.tsx` -- Reusable empty state with icon, message, CTA
- `src/components/CircularProgress.tsx` -- SVG-based circular timer for rest screen

### Modified Files
- `src/components/layout/AppLayout.tsx` -- AnimatePresence wrapper
- `src/components/layout/BottomNav.tsx` -- Glow effect, badge dot, height tweak
- `src/pages/HomePage.tsx` -- Greeting, sparkline, last-workout reminder, streak animation
- `src/pages/SessionPage.tsx` -- Circular timer, vibration, PR confetti, set animation
- `src/pages/SessionCompletePage.tsx` -- Confetti on mount, share button
- `src/pages/HistoryPage.tsx` -- Empty state
- `src/pages/RecordsPage.tsx` -- Empty state for PRs and measurements tabs
- `src/pages/NutritionPage.tsx` -- Empty state
- `src/pages/OnboardingPage.tsx` -- Skip all, unit toggle, macro presets, background animation
- `src/pages/SettingsPage.tsx` -- Unit preference (kg/lbs)
- `src/index.css` -- Theme transition, confetti keyframes, circular progress styles
- `tailwind.config.ts` -- Any new animation keyframes

### No New Dependencies
All changes use existing libraries (framer-motion, recharts, lucide-react, tailwind).
