import { useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { format } from 'date-fns';
import { Utensils, Droplets, Plus, Check, ChevronLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { MacroTargets, MealEntry } from '@/types/workout';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const defaultMeals: MealEntry[] = [
  { id: 'm1', mealNumber: 1, name: 'Meal 1 — Breakfast', completed: false },
  { id: 'm2', mealNumber: 2, name: 'Meal 2 — Pre-Workout', completed: false, isPreWorkout: true },
  { id: 'm3', mealNumber: 3, name: 'Meal 3 — Post-Workout', completed: false, isPostWorkout: true },
  { id: 'm4', mealNumber: 4, name: 'Meal 4 — Dinner', completed: false },
  { id: 'm5', mealNumber: 5, name: 'Meal 5 — Night Snack', completed: false },
];

const macroColors: Record<keyof MacroTargets, string> = {
  protein: 'text-neon',
  carbs: 'text-neon-amber',
  fats: 'text-neon-red',
  calories: 'text-neon-purple',
};

const macroBgColors: Record<keyof MacroTargets, string> = {
  protein: 'bg-neon/20',
  carbs: 'bg-neon-amber/20',
  fats: 'bg-neon-red/20',
  calories: 'bg-neon-purple/20',
};

export default function NutritionPage() {
  const navigate = useNavigate();
  const { settings, dailyNutrition, updateDailyNutrition, dailyHydration, addHydrationEntry } = useAppStore();
  const today = format(new Date(), 'yyyy-MM-dd');

  const nutrition = dailyNutrition[today] ?? {
    date: today,
    consumed: { protein: 0, carbs: 0, fats: 0, calories: 0 },
    meals: defaultMeals,
  };

  const [consumed, setConsumed] = useState<MacroTargets>(nutrition.consumed);
  const [meals, setMeals] = useState<MealEntry[]>(nutrition.meals);

  const save = (newConsumed: MacroTargets, newMeals: MealEntry[]) => {
    updateDailyNutrition(today, { date: today, consumed: newConsumed, meals: newMeals });
  };

  const updateMacro = (key: keyof MacroTargets, value: number) => {
    const next = { ...consumed, [key]: value };
    setConsumed(next);
    save(next, meals);
  };

  const toggleMeal = (id: string) => {
    const next = meals.map((m) =>
      m.id === id ? { ...m, completed: !m.completed, timestamp: !m.completed ? new Date().toISOString() : undefined } : m
    );
    setMeals(next);
    save(consumed, next);
  };

  // Hydration
  const hydration = dailyHydration[today];
  const hydrationTotal = hydration?.total ?? 0;
  const hydrationPct = Math.min(100, (hydrationTotal / settings.hydrationGoal) * 100);

  const quickAddWater = (ml: number) => {
    addHydrationEntry(today, {
      id: `h_${Date.now()}`,
      amount: ml,
      timestamp: new Date().toISOString(),
    });
  };

  const completedMeals = meals.filter((m) => m.completed).length;

  return (
    <motion.div
      className="flex flex-col gap-4 p-4 pt-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-3">
      <Button variant="ghost" size="icon" className="touch-target" onClick={() => navigate('/')}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-xl font-bold">Nutrition & Hydration</h1>
          <p className="text-xs text-muted-foreground">{format(new Date(), 'EEEE, MMM d')}</p>
        </div>
      </motion.div>

      {/* Macro Targets */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Utensils className="h-4 w-4 text-neon-amber" />
              <span className="text-sm font-semibold">Daily Macros</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(settings.macroTargets) as (keyof MacroTargets)[]).map((key) => {
                const target = settings.macroTargets[key];
                const current = consumed[key];
                const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
                const unit = key === 'calories' ? 'kcal' : 'g';
                return (
                  <div key={key} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold capitalize ${macroColors[key]}`}>{key}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {current}/{target}{unit}
                      </span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                    <Input
                      type="number"
                      placeholder="0"
                      className="h-8 text-xs touch-target"
                      value={current || ''}
                      onChange={(e) => updateMacro(key, Number(e.target.value))}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Meal Checklist */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold">Meal Checklist</span>
              <span className="text-xs text-muted-foreground">{completedMeals}/{meals.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {meals.map((meal) => (
                <button
                  key={meal.id}
                  onClick={() => toggleMeal(meal.id)}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors touch-target ${
                    meal.completed ? 'border-primary/30 bg-primary/5' : 'border-border'
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      meal.completed ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                    }`}
                  >
                    {meal.completed && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <div className="flex-1">
                    <span className={`text-sm ${meal.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {meal.name}
                    </span>
                    {(meal.isPreWorkout || meal.isPostWorkout) && (
                      <span className="ml-2 rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                        {meal.isPreWorkout ? 'Pre' : 'Post'}-Workout
                      </span>
                    )}
                  </div>
                  {meal.completed && meal.timestamp && (
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(meal.timestamp), 'HH:mm')}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Hydration */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-neon-blue" />
                <span className="text-sm font-semibold">Hydration</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {hydrationTotal}ml / {settings.hydrationGoal}ml
              </span>
            </div>
            <Progress value={hydrationPct} className="mb-3 h-2" />
            <div className="flex gap-2">
              {[250, 500, 750, 1000].map((ml) => (
                <Button
                  key={ml}
                  variant="outline"
                  size="sm"
                  className="flex-1 touch-target text-xs"
                  onClick={() => quickAddWater(ml)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  {ml >= 1000 ? '1L' : `${ml}ml`}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
