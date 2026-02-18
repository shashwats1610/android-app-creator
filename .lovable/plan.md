

# Color System Overhaul

## Current Problems

1. **Primary green (hsl 150, 100%, 50%) is too saturated** -- pure neon green feels "gamery" rather than premium. It strains the eyes on large surfaces like buttons.
2. **Dark mode background is too blue-tinted** (hsl 225) -- creates a cold, sterile feel for a fitness app that should feel energetic and warm.
3. **Light mode is washed out** -- near-white backgrounds with low-contrast cards feel flat and generic.
4. **Neon accent colors lack cohesion** -- amber, red, blue, purple are all at max saturation with no shared undertone, making the palette feel like a grab-bag.
5. **No semantic color hierarchy** -- success, warning, destructive colors don't form a clear family with the primary.

## New Color Direction: "Midnight Iron"

A warm-dark palette inspired by premium fitness apps like Strong, Hevy, and Nike Training. The primary shifts from neon green to a vibrant **cyan-teal** (more unique, better contrast, still energetic). The dark background gets a warmer, near-black tone. Accents are desaturated slightly for harmony.

### Dark Mode (Primary Experience)

| Token | Current | New | Reasoning |
|---|---|---|---|
| background | 225 25% 6% (blue-black) | 240 10% 5% (warm charcoal) | Warmer, less fatiguing |
| card | 225 20% 9% | 240 8% 8% | Subtle lift from background |
| primary | 150 100% 50% (neon green) | 172 80% 48% (vibrant teal) | More unique, better readability on dark |
| primary-foreground | 225 25% 6% | 0 0% 100% (white) | White on teal reads better than black |
| muted | 225 15% 15% | 240 6% 12% | Warmer neutral |
| muted-foreground | 220 10% 55% | 240 5% 50% | Slightly warmer grey |
| border | 225 15% 16% | 240 6% 14% | Less blue cast |
| neon | 150 100% 50% | 172 90% 55% | Matches new primary |
| neon-amber | 38 100% 55% | 42 95% 58% | Slightly warmer gold |
| neon-red | 0 90% 60% | 4 80% 58% | Less aggressive red |
| neon-blue | 210 100% 60% | 210 85% 62% | Slightly softer |
| neon-purple | 270 80% 60% | 265 70% 62% | Softer purple |
| success | 150 80% 50% | 160 70% 48% | Distinct from primary |
| accent bg | 225 20% 14% | 172 15% 12% | Tinted toward primary |
| accent foreground | 150 100% 50% | 172 80% 55% | Matches primary |

### Light Mode

| Token | Current | New | Reasoning |
|---|---|---|---|
| background | 0 0% 97% | 210 20% 97% | Very subtle cool tint |
| card | 0 0% 100% | 0 0% 100% | Keep pure white |
| primary | 150 80% 40% | 172 70% 38% | Teal, darkened for contrast |
| accent | 150 60% 94% | 172 40% 93% | Soft teal tint |
| muted | 220 14% 94% | 220 12% 93% | Slightly deeper for card contrast |

### Additional Changes

- **PR Glow**: Shift from amber to a warm gold gradient glow (42 95% 58%) for celebration moments
- **Card glow in dark mode**: Use primary teal at very low opacity for a subtle ambient glow instead of pure green
- **Gradient overlays**: Cards like "Today's Workout" will use `from-primary/10 via-transparent` with the new teal, creating a classier look
- **Ring/focus color**: Matches new primary teal

## Files Modified

1. **`src/index.css`** -- Update all CSS custom properties in both `:root` and `.dark` blocks
2. **`tailwind.config.ts`** -- No structural changes needed (it reads from CSS vars), but will verify all color references

## What Stays the Same

- The overall dark-first design philosophy
- Font choices (Inter + Space Grotesk)
- Animation keyframes and timings
- Component structure and layout
- The neon glow utility approach (just with new hues)

## Technical Details

The change is isolated to the CSS custom properties in `src/index.css`. Since the entire app uses `hsl(var(--token))` indirection, updating the ~40 HSL values in the CSS is the only code change needed. Every component, glow effect, and gradient automatically picks up the new palette.

