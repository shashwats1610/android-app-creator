import { useAppStore } from '@/stores/useAppStore';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function WorkoutPage() {
  const { workoutPlan, settings } = useAppStore();
  const navigate = useNavigate();
  const currentDay = workoutPlan.days[settings.currentDayIndex];

  return (
    <motion.div className="flex flex-col gap-4 p-4 pt-6" variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Workout Plan</h1>
          <p className="text-sm text-muted-foreground">{workoutPlan.name}</p>
        </div>
        <Button variant="outline" size="sm" className="touch-target" onClick={() => navigate('/workout/edit')}>
          <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit Plan
        </Button>
      </motion.div>

      {workoutPlan.days.map((day, idx) => {
        const isCurrent = idx === settings.currentDayIndex;
        return (
          <motion.div key={day.id} variants={item}>
            <Card
              className={`cursor-pointer transition-all ${isCurrent ? 'border-primary/50 card-glow' : 'hover:bg-accent/30'}`}
              onClick={() => navigate(`/workout/day/${day.id}`)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {day.dayNumber}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{day.name}</p>
                    <p className="text-xs text-muted-foreground">{day.exercises.length} exercises</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
