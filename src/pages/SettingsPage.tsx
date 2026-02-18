import { useAppStore } from '@/stores/useAppStore';
import { useTheme } from '@/hooks/useTheme';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Sun, Moon, Download, Upload, Trash2, Dumbbell, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { exportData, importData, resetAllData, settings } = useAppStore();
  const [resetText, setResetText] = useState('');
  const [showReset, setShowReset] = useState(false);

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

  return (
    <motion.div className="flex flex-col gap-4 p-4 pt-6" variants={container} initial="hidden" animate="show">
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

      {/* Data */}
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
  );
}
