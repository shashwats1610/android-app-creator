import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, ChevronRight, ChevronLeft, Target, Droplets } from 'lucide-react';
import type { EstimatedMaxes, MacroTargets } from '@/types/workout';

const steps = ['welcome', 'maxes', 'nutrition'] as const;
type Step = typeof steps[number];

const maxFields: { key: keyof EstimatedMaxes; label: string }[] = [
  { key: 'backSquat', label: 'Back Squat' },
  { key: 'benchPress', label: 'Bench Press' },
  { key: 'rdl', label: 'RDL' },
  { key: 'overheadPress', label: 'Overhead Press' },
  { key: 'pullUp', label: 'Pull-Up (added weight)' },
  { key: 'barbellRow', label: 'Barbell Row' },
  { key: 'barbellCurl', label: 'Barbell Curl' },
  { key: 'weightedDip', label: 'Weighted Dip' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { updateEstimatedMaxes, updateMacroTargets, updateSettings, completeOnboarding } = useAppStore();

  const [step, setStep] = useState<Step>('welcome');
  const [maxes, setMaxes] = useState<Record<string, number>>({});
  const [macros, setMacros] = useState<MacroTargets>({ protein: 200, carbs: 300, fats: 80, calories: 2800 });
  const [hydrationGoal, setHydrationGoal] = useState(3000);

  const stepIdx = steps.indexOf(step);

  const next = () => {
    if (stepIdx < steps.length - 1) {
      setStep(steps[stepIdx + 1]);
    } else {
      // Save and finish
      updateEstimatedMaxes(maxes as any);
      updateMacroTargets(macros);
      updateSettings({ hydrationGoal });
      completeOnboarding();
      navigate('/', { replace: true });
    }
  };

  const back = () => {
    if (stepIdx > 0) setStep(steps[stepIdx - 1]);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      {/* Progress dots */}
      <div className="mb-8 flex gap-2">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all ${
              i <= stepIdx ? 'w-8 bg-primary' : 'w-2 bg-muted'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-sm"
        >
          {step === 'welcome' && (
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/15">
                <Dumbbell className="h-10 w-10 text-primary" />
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight">
                Hyper<span className="text-primary">trophy</span>
              </h1>
              <p className="mt-3 text-muted-foreground">
                Your personal hypertrophy tracking companion. Log sets, track progressive overload, and crush PRs.
              </p>
            </div>
          )}

          {step === 'maxes' && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-bold">Estimated 1RM</h2>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Enter your estimated one-rep max (kg) for compound lifts. Used for progressive overload suggestions. You can edit these later.
              </p>
              <div className="grid gap-3">
                {maxFields.map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-3">
                    <label className="w-36 text-sm">{label}</label>
                    <Input
                      type="number"
                      placeholder="kg"
                      className="touch-target"
                      value={maxes[key] || ''}
                      onChange={(e) =>
                        setMaxes((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'nutrition' && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Droplets className="h-5 w-5 text-neon-blue" />
                <h2 className="font-display text-xl font-bold">Nutrition & Hydration</h2>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Set your daily macro targets and hydration goal. Editable anytime in Settings.
              </p>
              <Card>
                <CardContent className="grid gap-3 p-4">
                  {[
                    { key: 'protein' as const, label: 'Protein (g)', color: 'text-neon' },
                    { key: 'carbs' as const, label: 'Carbs (g)', color: 'text-neon-amber' },
                    { key: 'fats' as const, label: 'Fats (g)', color: 'text-neon-red' },
                    { key: 'calories' as const, label: 'Calories', color: 'text-neon-purple' },
                  ].map(({ key, label, color }) => (
                    <div key={key} className="flex items-center gap-3">
                      <label className={`w-28 text-sm font-medium ${color}`}>{label}</label>
                      <Input
                        type="number"
                        className="touch-target"
                        value={macros[key]}
                        onChange={(e) =>
                          setMacros((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                        }
                      />
                    </div>
                  ))}
                  <div className="flex items-center gap-3">
                    <label className="w-28 text-sm font-medium text-neon-blue">Water (ml)</label>
                    <Input
                      type="number"
                      className="touch-target"
                      value={hydrationGoal}
                      onChange={(e) => setHydrationGoal(Number(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="mt-8 flex w-full max-w-sm gap-3">
        {stepIdx > 0 && (
          <Button variant="outline" onClick={back} className="touch-target">
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        )}
        <Button onClick={next} className="flex-1 touch-target text-base font-semibold" size="lg">
          {stepIdx === steps.length - 1 ? "Let's Go" : 'Next'}
          {stepIdx < steps.length - 1 && <ChevronRight className="ml-1 h-4 w-4" />}
        </Button>
      </div>

      {step === 'maxes' && (
        <button onClick={next} className="mt-3 text-xs text-muted-foreground underline">
          Skip for now
        </button>
      )}
    </div>
  );
}
