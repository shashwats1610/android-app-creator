import { useState, useMemo } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { format, parseISO } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Scale, Plus, ArrowLeftRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { PersonalRecord, MuscleGroup, BodyMeasurement } from '@/types/workout';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const muscleGroupOrder: MuscleGroup[] = [
  'chest', 'lats', 'upper_back', 'traps',
  'front_delts', 'side_delts', 'rear_delts',
  'quads', 'hamstrings', 'glutes', 'calves',
  'biceps', 'triceps', 'forearms',
  'abs', 'obliques', 'lower_back',
];

const muscleGroupLabels: Record<string, string> = {
  chest: 'Chest', lats: 'Lats', upper_back: 'Upper Back', traps: 'Traps',
  front_delts: 'Front Delts', side_delts: 'Side Delts', rear_delts: 'Rear Delts',
  quads: 'Quads', hamstrings: 'Hamstrings', glutes: 'Glutes', calves: 'Calves',
  biceps: 'Biceps', triceps: 'Triceps', forearms: 'Forearms',
  abs: 'Abs', obliques: 'Obliques', lower_back: 'Lower Back',
};

function groupPRsByMuscle(
  records: Record<string, PersonalRecord>,
  workoutPlan: any
): Record<string, PersonalRecord[]> {
  const groups: Record<string, PersonalRecord[]> = {};
  const exerciseMuscles: Record<string, MuscleGroup[]> = {};
  for (const day of workoutPlan.days) {
    for (const ex of day.exercises) {
      exerciseMuscles[ex.id] = ex.muscleGroups;
    }
  }
  for (const pr of Object.values(records)) {
    const muscles = exerciseMuscles[pr.exerciseId] ?? ['other'];
    const primaryMuscle = muscles[0] ?? 'other';
    if (!groups[primaryMuscle]) groups[primaryMuscle] = [];
    groups[primaryMuscle].push(pr);
  }
  return groups;
}

const measurementFields = [
  { key: 'bodyweight', label: 'Bodyweight', unit: 'kg' },
  { key: 'leftArm', label: 'Left Arm', unit: 'cm' },
  { key: 'rightArm', label: 'Right Arm', unit: 'cm' },
  { key: 'chest', label: 'Chest', unit: 'cm' },
  { key: 'waist', label: 'Waist', unit: 'cm' },
  { key: 'leftQuad', label: 'Left Quad', unit: 'cm' },
  { key: 'rightQuad', label: 'Right Quad', unit: 'cm' },
  { key: 'leftCalf', label: 'Left Calf', unit: 'cm' },
  { key: 'rightCalf', label: 'Right Calf', unit: 'cm' },
] as const;

// ========== LINEAR REGRESSION ==========
function linearRegression(points: { x: number; y: number }[]): { slope: number; intercept: number } {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.y ?? 0 };
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

// ========== BODYWEIGHT CHART ==========
function BodyweightChart({ measurements }: { measurements: BodyMeasurement[] }) {
  const { data, trendData, summary } = useMemo(() => {
    const filtered = measurements
      .filter((m) => m.bodyweight)
      .map((m) => ({
        date: format(parseISO(m.date), 'MMM d'),
        weight: m.bodyweight!,
        rawDate: new Date(m.date).getTime(),
      }))
      .reverse();

    // Trend line
    const points = filtered.map((d, i) => ({ x: i, y: d.weight }));
    const { slope, intercept } = linearRegression(points);
    const trend = filtered.map((d, i) => ({
      ...d,
      trend: Math.round((intercept + slope * i) * 10) / 10,
    }));

    // Summary stats
    const first = filtered[0]?.weight ?? 0;
    const last = filtered[filtered.length - 1]?.weight ?? 0;
    const change = last - first;
    const avg = filtered.length > 0 ? filtered.reduce((s, d) => s + d.weight, 0) / filtered.length : 0;

    return {
      data: trend,
      trendData: trend,
      summary: { first, last, change, avg, count: filtered.length, weeklyRate: filtered.length >= 2 ? (slope * 7) : 0 },
    };
  }, [measurements]);

  if (data.length < 2) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">Bodyweight Trend</p>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-3 rounded-full bg-primary" /> Actual
            </span>
            <span className="flex items-center gap-1">
              <span className="h-0.5 w-3 rounded-full bg-muted-foreground/50" style={{ borderTop: '2px dashed' }} /> Trend
            </span>
          </div>
        </div>

        {/* Summary row */}
        <div className="mb-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-muted/50 p-2 text-center">
            <span className="text-sm font-bold font-display">{summary.last.toFixed(1)}</span>
            <p className="text-[9px] text-muted-foreground">Current (kg)</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2 text-center">
            <span className={`text-sm font-bold font-display ${summary.change > 0 ? 'text-primary' : summary.change < 0 ? 'text-neon-blue' : ''}`}>
              {summary.change > 0 ? '+' : ''}{summary.change.toFixed(1)}
            </span>
            <p className="text-[9px] text-muted-foreground">Change (kg)</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2 text-center">
            <span className={`text-sm font-bold font-display ${summary.weeklyRate > 0 ? 'text-primary' : summary.weeklyRate < 0 ? 'text-neon-blue' : ''}`}>
              {summary.weeklyRate > 0 ? '+' : ''}{summary.weeklyRate.toFixed(2)}
            </span>
            <p className="text-[9px] text-muted-foreground">Per week (kg)</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
              width={35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="trend"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ========== DATE COMPARISON ==========
function DateComparison({ measurements }: { measurements: BodyMeasurement[] }) {
  const [dateA, setDateA] = useState('');
  const [dateB, setDateB] = useState('');

  if (measurements.length < 2) return null;

  const mA = measurements.find((m) => m.id === dateA);
  const mB = measurements.find((m) => m.id === dateB);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold">Compare Dates</p>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Select value={dateA} onValueChange={setDateA}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Date A" />
            </SelectTrigger>
            <SelectContent>
              {measurements.map((m) => (
                <SelectItem key={m.id} value={m.id} className="text-xs">
                  {format(parseISO(m.date), 'MMM d, yyyy')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateB} onValueChange={setDateB}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Date B" />
            </SelectTrigger>
            <SelectContent>
              {measurements.map((m) => (
                <SelectItem key={m.id} value={m.id} className="text-xs">
                  {format(parseISO(m.date), 'MMM d, yyyy')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {mA && mB && (
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="grid grid-cols-4 gap-1 text-[10px] font-medium text-muted-foreground mb-1.5">
              <span>Metric</span>
              <span>{format(parseISO(mA.date), 'MMM d')}</span>
              <span>{format(parseISO(mB.date), 'MMM d')}</span>
              <span>Diff</span>
            </div>
            {measurementFields.map(({ key, label, unit }) => {
              const valA = (mA as any)[key] as number | undefined;
              const valB = (mB as any)[key] as number | undefined;
              if (!valA && !valB) return null;
              const diff = valA && valB ? valB - valA : null;
              return (
                <div key={key} className="grid grid-cols-4 gap-1 text-xs py-0.5">
                  <span className="text-muted-foreground">{label}</span>
                  <span>{valA ? `${valA}${unit}` : '—'}</span>
                  <span>{valB ? `${valB}${unit}` : '—'}</span>
                  <span className={
                    diff === null ? 'text-muted-foreground' :
                    diff > 0 ? 'text-neon font-semibold' :
                    diff < 0 ? 'text-neon-red font-semibold' : 'text-muted-foreground'
                  }>
                    {diff === null ? '—' : `${diff > 0 ? '+' : ''}${diff.toFixed(1)}`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ========== MAIN PAGE ==========
export default function RecordsPage() {
  const { personalRecords, workoutPlan, bodyMeasurements, addBodyMeasurement } = useAppStore();
  const [selectedPR, setSelectedPR] = useState<PersonalRecord | null>(null);
  const [showAddMeasurement, setShowAddMeasurement] = useState(false);
  const [measurementForm, setMeasurementForm] = useState<Record<string, number | undefined>>({});

  const prsByMuscle = groupPRsByMuscle(personalRecords, workoutPlan);
  const prCount = Object.keys(personalRecords).length;

  const handleSaveMeasurement = () => {
    const hasValues = Object.values(measurementForm).some((v) => v !== undefined && v > 0);
    if (!hasValues) return;
    const measurement: BodyMeasurement = {
      id: `bm_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ...measurementForm as any,
    };
    addBodyMeasurement(measurement);
    setMeasurementForm({});
    setShowAddMeasurement(false);
  };

  return (
    <>
      <motion.div className="flex flex-col gap-4 p-4 pt-6 pb-24" variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
          <h1 className="font-display text-2xl font-bold">Records</h1>
          <p className="text-sm text-muted-foreground">PRs & body measurements</p>
        </motion.div>

        <Tabs defaultValue="prs">
          <motion.div variants={item}>
            <TabsList className="w-full">
              <TabsTrigger value="prs" className="flex-1">
                <Trophy className="mr-1.5 h-3.5 w-3.5" /> PRs ({prCount})
              </TabsTrigger>
              <TabsTrigger value="body" className="flex-1">
                <Scale className="mr-1.5 h-3.5 w-3.5" /> Body
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* PRs Tab */}
          <TabsContent value="prs" className="mt-4 flex flex-col gap-4">
            {prCount === 0 && (
              <motion.div variants={item} className="flex flex-col items-center justify-center py-12 text-center">
                <Trophy className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No PRs yet.</p>
                <p className="text-xs text-muted-foreground">Complete workouts to start tracking records.</p>
              </motion.div>
            )}

            {muscleGroupOrder
              .filter((mg) => prsByMuscle[mg]?.length)
              .map((mg) => (
                <motion.div key={mg} variants={item}>
                  <p className="mb-2 text-xs font-semibold uppercase text-primary">
                    {muscleGroupLabels[mg]}
                  </p>
                  <div className="flex flex-col gap-2">
                    {prsByMuscle[mg]!
                      .sort((a, b) => b.bestWeight - a.bestWeight)
                      .map((pr) => (
                        <Card
                          key={pr.exerciseId}
                          className="cursor-pointer transition-colors hover:bg-accent/30"
                          onClick={() => setSelectedPR(pr)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold">{pr.exerciseName}</p>
                                <div className="mt-1 flex gap-3 text-[10px] text-muted-foreground">
                                  <span>🏋️ {pr.bestWeight}kg</span>
                                  <span>🔁 {pr.bestReps} reps</span>
                                  <span>📊 {pr.bestVolume} vol</span>
                                </div>
                              </div>
                              <Trophy className="h-4 w-4 text-neon-amber/60" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </motion.div>
              ))}
          </TabsContent>

          {/* Body Measurements Tab */}
          <TabsContent value="body" className="mt-4 flex flex-col gap-4">
            <motion.div variants={item}>
              <Button
                variant="outline"
                className="w-full touch-target"
                onClick={() => setShowAddMeasurement(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Log Measurements
              </Button>
            </motion.div>

            {bodyMeasurements.length === 0 && (
              <motion.div variants={item} className="flex flex-col items-center justify-center py-12 text-center">
                <Scale className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No measurements yet.</p>
                <p className="text-xs text-muted-foreground">Log your body stats to track progress over time.</p>
              </motion.div>
            )}

            {/* Bodyweight Chart */}
            {bodyMeasurements.length >= 2 && (
              <motion.div variants={item}>
                <BodyweightChart measurements={bodyMeasurements} />
              </motion.div>
            )}

            {/* Date Comparison */}
            {bodyMeasurements.length >= 2 && (
              <motion.div variants={item}>
                <DateComparison measurements={bodyMeasurements} />
              </motion.div>
            )}

            {/* Measurement History */}
            {bodyMeasurements.map((m, idx) => {
              const prev = bodyMeasurements[idx + 1];
              return (
                <motion.div key={m.id} variants={item}>
                  <Card>
                    <CardContent className="p-3">
                      <p className="mb-2 text-xs font-semibold text-muted-foreground">
                        {format(parseISO(m.date), 'EEE, MMM d, yyyy')}
                      </p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {measurementFields.map(({ key, label, unit }) => {
                          const val = (m as any)[key] as number | undefined;
                          if (!val) return null;
                          const prevVal = prev ? (prev as any)[key] as number | undefined : undefined;
                          const diff = prevVal ? val - prevVal : null;
                          return (
                            <div key={key} className="flex items-center justify-between py-0.5">
                              <span className="text-xs text-muted-foreground">{label}</span>
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-semibold">{val}{unit}</span>
                                {diff !== null && diff !== 0 && (
                                  <span className={`text-[9px] font-medium ${diff > 0 ? 'text-neon' : 'text-neon-red'}`}>
                                    {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* PR Detail Sheet */}
      <Sheet open={!!selectedPR} onOpenChange={(open) => { if (!open) setSelectedPR(null); }}>
        <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto rounded-t-2xl">
          {selectedPR && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedPR.exerciseName}</SheetTitle>
                <SheetDescription>PR History</SheetDescription>
              </SheetHeader>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-muted p-2 text-center">
                  <span className="font-display text-lg font-bold">{selectedPR.bestWeight}kg</span>
                  <p className="text-[9px] text-muted-foreground">Best Weight · {selectedPR.bestWeightDate}</p>
                </div>
                <div className="rounded-lg bg-muted p-2 text-center">
                  <span className="font-display text-lg font-bold">{selectedPR.bestReps}</span>
                  <p className="text-[9px] text-muted-foreground">Best Reps · {selectedPR.bestRepsDate}</p>
                </div>
                <div className="rounded-lg bg-muted p-2 text-center">
                  <span className="font-display text-lg font-bold">{selectedPR.bestVolume}</span>
                  <p className="text-[9px] text-muted-foreground">Best Vol · {selectedPR.bestVolumeDate}</p>
                </div>
              </div>
              {selectedPR.history.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold text-muted-foreground">Timeline</p>
                  <div className="flex flex-col gap-1">
                    <div className="grid grid-cols-4 gap-1 text-[10px] font-medium text-muted-foreground">
                      <span>Date</span><span>Weight</span><span>Reps</span><span>RPE</span>
                    </div>
                    {selectedPR.history.slice().reverse().map((entry, i) => (
                      <div key={i} className="grid grid-cols-4 gap-1 text-xs py-0.5">
                        <span>{entry.date}</span>
                        <span>{entry.weight}kg</span>
                        <span>{entry.reps}</span>
                        <span>{entry.rpe}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Measurement Sheet */}
      <Sheet open={showAddMeasurement} onOpenChange={setShowAddMeasurement}>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Log Measurements</SheetTitle>
            <SheetDescription>Only fill in what you measured today</SheetDescription>
          </SheetHeader>
          <div className="mt-4 flex flex-col gap-3">
            {measurementFields.map(({ key, label, unit }) => (
              <div key={key} className="flex items-center gap-3">
                <label className="w-24 text-xs font-medium">{label}</label>
                <Input
                  type="number"
                  placeholder={unit}
                  className="touch-target"
                  value={measurementForm[key] ?? ''}
                  onChange={(e) =>
                    setMeasurementForm((prev) => ({
                      ...prev,
                      [key]: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
            ))}
            <Button className="mt-2 touch-target text-base font-semibold" size="lg" onClick={handleSaveMeasurement}>
              Save Measurements
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
