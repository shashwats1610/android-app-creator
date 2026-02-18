import { useState, useMemo, useCallback } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { format } from 'date-fns';
import {
  Utensils, Droplets, Plus, Check, ChevronLeft, ChevronDown, ChevronUp,
  Pencil, Trash2, GripVertical, X, Save, RotateCcw, FileText, Zap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { MacroTargets, MealEntry, FoodItem, MealTemplate } from '@/types/workout';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const macroColors: Record<keyof MacroTargets, string> = {
  protein: 'text-neon',
  carbs: 'text-neon-amber',
  fats: 'text-neon-red',
  calories: 'text-neon-purple',
};

function sumFoodMacros(foods: FoodItem[] | undefined): MacroTargets {
  return (foods || []).reduce(
    (acc, f) => ({
      protein: acc.protein + f.protein,
      carbs: acc.carbs + f.carbs,
      fats: acc.fats + f.fats,
      calories: acc.calories + f.calories,
    }),
    { protein: 0, carbs: 0, fats: 0, calories: 0 }
  );
}

function sumAllMealMacros(meals: MealEntry[]): MacroTargets {
  return meals.reduce(
    (acc, m) => {
      const mMacros = sumFoodMacros(m.foods);
      return {
        protein: acc.protein + mMacros.protein,
        carbs: acc.carbs + mMacros.carbs,
        fats: acc.fats + mMacros.fats,
        calories: acc.calories + mMacros.calories,
      };
    },
    { protein: 0, carbs: 0, fats: 0, calories: 0 }
  );
}

// ========== ADD FOOD SHEET ==========
function AddFoodSheet({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (food: FoodItem) => void;
}) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [calories, setCalories] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    const p = Number(protein) || 0;
    const c = Number(carbs) || 0;
    const f = Number(fats) || 0;
    const cal = Number(calories) || Math.round(p * 4 + c * 4 + f * 9);

    onAdd({
      id: `food_${Date.now()}`,
      name: name.trim(),
      quantity: quantity.trim() || undefined,
      protein: p,
      carbs: c,
      fats: f,
      calories: cal,
    });
    setName('');
    setQuantity('');
    setProtein('');
    setCarbs('');
    setFats('');
    setCalories('');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Add Food Item</SheetTitle>
          <SheetDescription>Enter food details and macros</SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <label className="text-[11px] font-medium text-muted-foreground">Food Name</label>
              <Input placeholder="e.g. Chicken breast" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 touch-target" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Quantity</label>
              <Input placeholder="e.g. 200g" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mt-1 touch-target" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Calories</label>
              <Input type="number" placeholder="Auto" value={calories} onChange={(e) => setCalories(e.target.value)} className="mt-1 touch-target" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-medium text-neon">Protein (g)</label>
              <Input type="number" placeholder="0" value={protein} onChange={(e) => setProtein(e.target.value)} className="mt-1 touch-target" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-neon-amber">Carbs (g)</label>
              <Input type="number" placeholder="0" value={carbs} onChange={(e) => setCarbs(e.target.value)} className="mt-1 touch-target" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-neon-red">Fats (g)</label>
              <Input type="number" placeholder="0" value={fats} onChange={(e) => setFats(e.target.value)} className="mt-1 touch-target" />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            Calories auto-calculated if left blank: P×4 + C×4 + F×9
          </p>
          <Button className="touch-target text-base font-semibold" size="lg" onClick={handleAdd} disabled={!name.trim()}>
            <Plus className="mr-2 h-4 w-4" /> Add Food
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ========== EDIT MEAL SHEET ==========
function EditMealSheet({
  meal,
  open,
  onOpenChange,
  onSave,
}: {
  meal: MealEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (meal: MealEntry) => void;
}) {
  const [name, setName] = useState(meal?.name ?? '');
  const [isPreWorkout, setIsPreWorkout] = useState(meal?.isPreWorkout ?? false);
  const [isPostWorkout, setIsPostWorkout] = useState(meal?.isPostWorkout ?? false);
  const [notes, setNotes] = useState(meal?.notes ?? '');

  // Reset when meal changes
  useState(() => {
    if (meal) {
      setName(meal.name);
      setIsPreWorkout(meal.isPreWorkout ?? false);
      setIsPostWorkout(meal.isPostWorkout ?? false);
      setNotes(meal.notes ?? '');
    }
  });

  if (!meal) return null;

  const handleSave = () => {
    onSave({
      ...meal,
      name: name.trim() || meal.name,
      isPreWorkout,
      isPostWorkout,
      notes: notes.trim() || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Edit Meal</SheetTitle>
          <SheetDescription>Customize meal name and tags</SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex flex-col gap-3">
          <div>
            <label className="text-[11px] font-medium text-muted-foreground">Meal Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 touch-target" />
          </div>
          <div className="flex gap-2">
            <Button
              variant={isPreWorkout ? 'default' : 'outline'}
              size="sm"
              className="flex-1 touch-target text-xs"
              onClick={() => { setIsPreWorkout(!isPreWorkout); if (!isPreWorkout) setIsPostWorkout(false); }}
            >
              <Zap className="mr-1 h-3 w-3" /> Pre-Workout
            </Button>
            <Button
              variant={isPostWorkout ? 'default' : 'outline'}
              size="sm"
              className="flex-1 touch-target text-xs"
              onClick={() => { setIsPostWorkout(!isPostWorkout); if (!isPostWorkout) setIsPreWorkout(false); }}
            >
              <Zap className="mr-1 h-3 w-3" /> Post-Workout
            </Button>
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Meal prep notes, food preferences..."
              className="mt-1 min-h-[60px] text-xs"
            />
          </div>
          <Button className="touch-target text-base font-semibold" size="lg" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ========== MEAL CARD ==========
function MealCard({
  meal,
  onToggle,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAddFood,
  onRemoveFood,
  isFirst,
  isLast,
}: {
  meal: MealEntry;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddFood: () => void;
  onRemoveFood: (foodId: string) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const foods = meal.foods || [];
  const mealMacros = sumFoodMacros(foods);
  const hasFoods = foods.length > 0;

  return (
    <Card className={`transition-colors ${meal.completed ? 'border-primary/30 bg-primary/5' : ''}`}>
      <CardContent className="p-0">
        {/* Main row */}
        <div className="flex items-center gap-2 p-3">
          {/* Reorder */}
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={isFirst}
              className="text-muted-foreground/50 hover:text-foreground disabled:opacity-20 touch-target"
              aria-label="Move up"
            >
              <ChevronUp className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={isLast}
              className="text-muted-foreground/50 hover:text-foreground disabled:opacity-20 touch-target"
              aria-label="Move down"
            >
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          {/* Check circle */}
          <button type="button" onClick={onToggle} className="touch-target shrink-0">
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                meal.completed ? 'border-primary bg-primary' : 'border-muted-foreground/30'
              }`}
            >
              {meal.completed && <Check className="h-3 w-3 text-primary-foreground" />}
            </div>
          </button>

          {/* Name & info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-medium truncate ${meal.completed ? 'line-through text-muted-foreground' : ''}`}>
                {meal.name}
              </span>
              {meal.isPreWorkout && (
                <Badge variant="secondary" className="text-[9px] shrink-0">Pre</Badge>
              )}
              {meal.isPostWorkout && (
                <Badge variant="secondary" className="text-[9px] shrink-0">Post</Badge>
              )}
            </div>
            {hasFoods && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {foods.length} item{foods.length !== 1 ? 's' : ''} · {mealMacros.calories}kcal · P{mealMacros.protein}g C{mealMacros.carbs}g F{mealMacros.fats}g
              </p>
            )}
            {meal.completed && meal.timestamp && (
              <p className="text-[10px] text-muted-foreground">{format(new Date(meal.timestamp), 'HH:mm')}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button type="button" onClick={onEdit} className="touch-target p-1 text-muted-foreground hover:text-foreground" aria-label="Edit meal">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={onDelete} className="touch-target p-1 text-muted-foreground hover:text-destructive" aria-label="Delete meal">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Foods collapsible */}
        <Collapsible>
          <CollapsibleTrigger className="flex w-full items-center gap-2 border-t border-border px-3 py-1.5 text-left text-[11px] text-muted-foreground hover:bg-muted/30 transition-colors">
            <FileText className="h-3 w-3" />
            <span>{hasFoods ? `${foods.length} food items` : 'Add foods'}</span>
            <ChevronDown className="ml-auto h-3 w-3" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t border-border px-3 py-2 space-y-1.5">
              {foods.map((food) => (
                <div key={food.id} className="flex items-center justify-between rounded-md bg-muted/30 px-2 py-1.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium truncate">{food.name}</span>
                      {food.quantity && (
                        <span className="text-[10px] text-muted-foreground shrink-0">{food.quantity}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {food.calories}kcal · P{food.protein}g C{food.carbs}g F{food.fats}g
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveFood(food.id)}
                    className="touch-target p-1 text-muted-foreground hover:text-destructive shrink-0"
                    aria-label="Remove food"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs touch-target"
                onClick={onAddFood}
              >
                <Plus className="mr-1 h-3 w-3" /> Add Food
              </Button>
              {meal.notes && (
                <p className="text-[10px] text-muted-foreground italic pt-1 border-t border-border">
                  {meal.notes}
                </p>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

// ========== MAIN PAGE ==========
export default function NutritionPage() {
  const navigate = useNavigate();
  const {
    settings, dailyNutrition, updateDailyNutrition, dailyHydration,
    addHydrationEntry, mealTemplates, saveMealTemplates,
  } = useAppStore();
  const today = format(new Date(), 'yyyy-MM-dd');

  // Initialize from templates if no data for today
  const createMealsFromTemplates = useCallback((): MealEntry[] => {
    return (mealTemplates ?? []).map((t, i) => ({
      id: `meal_${Date.now()}_${i}`,
      mealNumber: i + 1,
      name: t.name,
      completed: false,
      isPreWorkout: t.isPreWorkout,
      isPostWorkout: t.isPostWorkout,
      foods: t.defaultFoods ? [...t.defaultFoods] : [],
    }));
  }, [mealTemplates]);

  const nutrition = dailyNutrition[today] ?? {
    date: today,
    consumed: { protein: 0, carbs: 0, fats: 0, calories: 0 },
    meals: createMealsFromTemplates(),
  };

  const [meals, setMeals] = useState<MealEntry[]>(nutrition.meals);
  const [editingMeal, setEditingMeal] = useState<MealEntry | null>(null);
  const [addFoodForMealId, setAddFoodForMealId] = useState<string | null>(null);
  const [manualMacros, setManualMacros] = useState<MacroTargets>({ protein: 0, carbs: 0, fats: 0, calories: 0 });

  // Auto-calculated macros from food items
  const foodMacros = useMemo(() => sumAllMealMacros(meals), [meals]);
  const totalConsumed: MacroTargets = {
    protein: foodMacros.protein + manualMacros.protein,
    carbs: foodMacros.carbs + manualMacros.carbs,
    fats: foodMacros.fats + manualMacros.fats,
    calories: foodMacros.calories + manualMacros.calories,
  };

  const save = useCallback((newMeals: MealEntry[]) => {
    const macros = sumAllMealMacros(newMeals);
    const total: MacroTargets = {
      protein: macros.protein + manualMacros.protein,
      carbs: macros.carbs + manualMacros.carbs,
      fats: macros.fats + manualMacros.fats,
      calories: macros.calories + manualMacros.calories,
    };
    updateDailyNutrition(today, { date: today, consumed: total, meals: newMeals });
  }, [today, manualMacros, updateDailyNutrition]);

  const updateManualMacro = (key: keyof MacroTargets, value: number) => {
    const next = { ...manualMacros, [key]: value };
    setManualMacros(next);
    const macros = sumAllMealMacros(meals);
    const total: MacroTargets = {
      protein: macros.protein + next.protein,
      carbs: macros.carbs + next.carbs,
      fats: macros.fats + next.fats,
      calories: macros.calories + next.calories,
    };
    updateDailyNutrition(today, { date: today, consumed: total, meals });
  };

  const toggleMeal = (id: string) => {
    const next = meals.map((m) =>
      m.id === id ? { ...m, completed: !m.completed, timestamp: !m.completed ? new Date().toISOString() : undefined } : m
    );
    setMeals(next);
    save(next);
  };

  const deleteMeal = (id: string) => {
    const next = meals.filter((m) => m.id !== id).map((m, i) => ({ ...m, mealNumber: i + 1 }));
    setMeals(next);
    save(next);
    toast.success('Meal removed');
  };

  const addNewMeal = () => {
    const newMeal: MealEntry = {
      id: `meal_${Date.now()}`,
      mealNumber: meals.length + 1,
      name: `Meal ${meals.length + 1}`,
      completed: false,
      foods: [],
    };
    const next = [...meals, newMeal];
    setMeals(next);
    save(next);
  };

  const moveMeal = (idx: number, direction: -1 | 1) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= meals.length) return;
    const next = [...meals];
    [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
    const renumbered = next.map((m, i) => ({ ...m, mealNumber: i + 1 }));
    setMeals(renumbered);
    save(renumbered);
  };

  const updateMeal = (updated: MealEntry) => {
    const next = meals.map((m) => (m.id === updated.id ? updated : m));
    setMeals(next);
    save(next);
  };

  const addFoodToMeal = (mealId: string, food: FoodItem) => {
    const next = meals.map((m) =>
      m.id === mealId ? { ...m, foods: [...m.foods, food] } : m
    );
    setMeals(next);
    save(next);
    toast.success(`${food.name} added`);
  };

  const removeFoodFromMeal = (mealId: string, foodId: string) => {
    const next = meals.map((m) =>
      m.id === mealId ? { ...m, foods: m.foods.filter((f) => f.id !== foodId) } : m
    );
    setMeals(next);
    save(next);
  };

  const saveAsTemplate = () => {
    const templates: MealTemplate[] = meals.map((m, i) => ({
      id: `mt_${Date.now()}_${i}`,
      name: m.name,
      isPreWorkout: m.isPreWorkout,
      isPostWorkout: m.isPostWorkout,
      defaultFoods: (m.foods || []).length > 0 ? [...(m.foods || [])] : undefined,
    }));
    saveMealTemplates(templates);
    toast.success('Meal plan saved as template!');
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
    toast.success(`💧 ${ml}ml logged!`, { duration: 1500 });
  };

  const completedMeals = meals.filter((m) => m.completed).length;

  return (
    <>
      <motion.div
        className="flex flex-col gap-4 p-4 pt-6 pb-24"
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

        {/* Macro Overview */}
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Utensils className="h-4 w-4 text-neon-amber" />
                <span className="text-sm font-semibold">Daily Macros</span>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  From food items + manual
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(settings.macroTargets) as (keyof MacroTargets)[]).map((key) => {
                  const target = settings.macroTargets[key];
                  const current = totalConsumed[key];
                  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
                  const unit = key === 'calories' ? 'kcal' : 'g';
                  return (
                    <div key={key} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold capitalize ${macroColors[key]}`}>{key}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {Math.round(current)}/{target}{unit}
                        </span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  );
                })}
              </div>

              {/* Manual macro adjustments */}
              <Collapsible className="mt-3">
                <CollapsibleTrigger className="flex w-full items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                  <Plus className="h-3 w-3" />
                  <span>Quick add macros manually</span>
                  <ChevronDown className="ml-auto h-3 w-3" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(settings.macroTargets) as (keyof MacroTargets)[]).map((key) => {
                      const unit = key === 'calories' ? 'kcal' : 'g';
                      return (
                        <div key={key}>
                          <label className={`text-[10px] font-medium capitalize ${macroColors[key]}`}>
                            + {key} ({unit})
                          </label>
                          <Input
                            type="number"
                            placeholder="0"
                            className="h-8 text-xs touch-target mt-0.5"
                            value={manualMacros[key] || ''}
                            onChange={(e) => updateManualMacro(key, Number(e.target.value) || 0)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </motion.div>

        {/* Meal Checklist */}
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold">Meals</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{completedMeals}/{meals.length}</span>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={saveAsTemplate}>
                    <Save className="mr-1 h-3 w-3" /> Save Template
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <AnimatePresence initial={false}>
                  {meals.map((meal, idx) => (
                    <motion.div
                      key={meal.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <MealCard
                        meal={meal}
                        onToggle={() => toggleMeal(meal.id)}
                        onEdit={() => setEditingMeal(meal)}
                        onDelete={() => deleteMeal(meal.id)}
                        onMoveUp={() => moveMeal(idx, -1)}
                        onMoveDown={() => moveMeal(idx, 1)}
                        onAddFood={() => setAddFoodForMealId(meal.id)}
                        onRemoveFood={(foodId) => removeFoodFromMeal(meal.id, foodId)}
                        isFirst={idx === 0}
                        isLast={idx === meals.length - 1}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <Button
                variant="outline"
                className="mt-3 w-full touch-target text-xs"
                onClick={addNewMeal}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add Meal
              </Button>
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

      {/* Edit Meal Sheet */}
      <EditMealSheet
        meal={editingMeal}
        open={!!editingMeal}
        onOpenChange={(open) => { if (!open) setEditingMeal(null); }}
        onSave={updateMeal}
      />

      {/* Add Food Sheet */}
      <AddFoodSheet
        open={!!addFoodForMealId}
        onOpenChange={(open) => { if (!open) setAddFoodForMealId(null); }}
        onAdd={(food) => {
          if (addFoodForMealId) addFoodToMeal(addFoodForMealId, food);
        }}
      />
    </>
  );
}
