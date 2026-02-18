import { useAppStore } from '@/stores/useAppStore';
import { useTheme } from '@/hooks/useTheme';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Sun, Moon, Download, Upload, Trash2, Dumbbell, ChevronRight, ChevronDown,
  Target, Utensils, Timer, Database,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';
import type { EstimatedMaxes, MacroTargets } from '@/types/workout';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const maxFields: { key: keyof EstimatedMaxes; label: string }[] = [
  { key: 'backSquat', label: 'Back Squat' },
  { key: 'benchPress', label: 'Bench Press' },
  { key: 'rdl', label: 'RDL' },
  { key: 'overheadPress', label: 'Overhead Press' },
  { key: 'pullUp', label: 'Pull-Up (added wt)' },
  { key: 'barbellRow', label: 'Barbell Row' },
  { key: 'barbellCurl', label: 'Barbell Curl' },
  { key: 'weightedDip', label: 'Weighted Dip' },
];

const macroFields: { key: keyof MacroTargets; label: string; unit: string; color: string }[] = [
  { key: 'protein', label: 'Protein', unit: 'g', color: 'text-neon' },
  { key: 'carbs', label: 'Carbs', unit: 'g', color: 'text-neon-amber' },
  { key: 'fats', label: 'Fats', unit: 'g', color: 'text-neon-red' },
  { key: 'calories', label: 'Calories', unit: 'kcal', color: 'text-neon-purple' },
];

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const {
    exportData, importData, resetAllData, loadSampleData, settings, workoutPlan,
    updateEstimatedMaxes, updateMacroTargets, updateSettings,
  } = useAppStore();
  const [resetText, setResetText] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [showRestOverrides, setShowRestOverrides] = useState(false);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hypertrophy-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const success = importData(text);
      if (!success) alert('Invalid backup file.');
    };
    input.click();
  };

  const handleReset = () => {
    if (resetText === 'RESET') {
      resetAllData();
      setShowReset(false);
      setResetText('');
    }
  };

  // All exercises across all days for rest timer overrides
  const allExercises = workoutPlan.days.flatMap((d) =>
    d.exercises.map((ex) => ({ ...ex, dayName: d.name }))
  );

  return (
    <>
      <motion.div className="flex flex-col gap-4 p-4 pt-6 pb-24" variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
          <h1 className="font-display text-2xl font-bold">Settings</h1>
        </motion.div>

        {/* Theme */}
        <motion.div variants={item}>
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <span className="text-sm font-medium">Dark Mode</span>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Edit Workout Plan */}
        <motion.div variants={item}>
          <Card className="cursor-pointer transition-colors hover:bg-accent/50" onClick={() => navigate('/workout/edit')}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Dumbbell className="h-5 w-5 text-primary" />
                <div>
                  <span className="text-sm font-medium">Edit Workout Plan</span>
                  <p className="text-[10px] text-muted-foreground">Add, remove, reorder days & exercises</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Estimated 1RM Maxes */}
        <motion.div variants={item}>
          <Collapsible>
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-primary" />
                <div>
                  <span className="text-sm font-medium">Estimated 1RM Maxes</span>
                  <p className="text-[10px] text-muted-foreground">Used for progressive overload suggestions</p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <Card>
                <CardContent className="grid gap-2.5 p-4">
                  {maxFields.map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-3">
                      <label className="w-32 text-xs font-medium">{label}</label>
                      <Input
                        type="number"
                        inputMode="decimal"
                        placeholder="kg"
                        className="touch-target"
                        value={settings.estimatedMaxes[key] || ''}
                        onChange={(e) => updateEstimatedMaxes({ [key]: Number(e.target.value) })}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </motion.div>

        {/* Macro Targets */}
        <motion.div variants={item}>
          <Collapsible>
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left">
              <div className="flex items-center gap-3">
                <Utensils className="h-5 w-5 text-neon-amber" />
                <div>
                  <span className="text-sm font-medium">Macro Targets</span>
                  <p className="text-[10px] text-muted-foreground">Daily nutrition goals</p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <Card>
                <CardContent className="grid gap-2.5 p-4">
                  {macroFields.map(({ key, label, unit, color }) => (
                    <div key={key} className="flex items-center gap-3">
                      <label className={`w-24 text-xs font-medium ${color}`}>{label} ({unit})</label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        className="touch-target"
                        value={settings.macroTargets[key] || ''}
                        onChange={(e) => updateMacroTargets({ [key]: Number(e.target.value) })}
                      />
                    </div>
                  ))}
                  <div className="flex items-center gap-3">
                    <label className="w-24 text-xs font-medium text-neon-blue">Water (ml)</label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      className="touch-target"
                      value={settings.hydrationGoal || ''}
                      onChange={(e) => updateSettings({ hydrationGoal: Number(e.target.value) })}
                    />
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </motion.div>

        {/* Rest Timer Overrides */}
        <motion.div variants={item}>
          <Card
            className="cursor-pointer transition-colors hover:bg-accent/50"
            onClick={() => setShowRestOverrides(true)}
          >
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Timer className="h-5 w-5 text-neon-purple" />
                <div>
                  <span className="text-sm font-medium">Rest Timer Overrides</span>
                  <p className="text-[10px] text-muted-foreground">
                    {Object.keys(settings.restTimerOverrides).length} custom timers set
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Management */}
        <motion.div variants={item}>
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Data Management</p>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="justify-start touch-target" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Export Backup (JSON)
            </Button>
            <Button variant="outline" className="justify-start touch-target" onClick={handleImport}>
              <Upload className="mr-2 h-4 w-4" /> Import Backup
            </Button>
            <Button
              variant="outline"
              className="justify-start touch-target text-destructive hover:text-destructive"
              onClick={() => setShowReset(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Reset All Data
            </Button>
          </div>
        </motion.div>

        {/* Developer / Testing */}
        <motion.div variants={item}>
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Developer / Testing</p>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Database className="h-5 w-5 text-neon-purple" />
                <div>
                  <span className="text-sm font-medium">Load Sample Data</span>
                  <p className="text-[10px] text-muted-foreground">Populate all features with realistic test data (merges with existing)</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full touch-target text-xs"
                onClick={() => {
                  loadSampleData();
                  toast.success('Sample data loaded! Check all pages to see the data.', { duration: 3000 });
                }}
              >
                <Database className="mr-2 h-4 w-4" /> Load Sample Data
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {showReset && (
          <motion.div variants={item}>
            <Card className="border-destructive/40">
              <CardContent className="p-4">
                <p className="mb-2 text-sm text-destructive font-semibold">Type "RESET" to confirm</p>
                <div className="flex gap-2">
                  <Input
                    value={resetText}
                    onChange={(e) => setResetText(e.target.value)}
                    placeholder="RESET"
                    className="touch-target"
                  />
                  <Button variant="destructive" onClick={handleReset} disabled={resetText !== 'RESET'} className="touch-target">
                    Confirm
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Rest Timer Overrides Sheet */}
      <Sheet open={showRestOverrides} onOpenChange={setShowRestOverrides}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Rest Timer Overrides</SheetTitle>
            <SheetDescription>Set custom rest times per exercise (leave blank for default)</SheetDescription>
          </SheetHeader>
          <div className="mt-4 flex flex-col gap-1">
            {workoutPlan.days.map((day) => (
              <div key={day.id} className="mb-3">
                <p className="mb-1.5 text-[10px] font-semibold uppercase text-primary">{day.name}</p>
                {day.exercises.map((ex) => {
                  const override = settings.restTimerOverrides[ex.id];
                  return (
                    <div key={ex.id} className="flex items-center gap-2 py-1">
                      <span className="flex-1 text-xs truncate">{ex.name}</span>
                      <span className="text-[10px] text-muted-foreground w-12 text-right">
                        def: {ex.restSeconds}s
                      </span>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder={`${ex.restSeconds}`}
                        className="w-20 h-8 text-xs"
                        value={override ?? ''}
                        onChange={(e) => {
                          const val = e.target.value ? Number(e.target.value) : undefined;
                          const current = { ...settings.restTimerOverrides };
                          if (val === undefined || val <= 0) {
                            delete current[ex.id];
                          } else {
                            current[ex.id] = val;
                          }
                          updateSettings({ restTimerOverrides: current });
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
