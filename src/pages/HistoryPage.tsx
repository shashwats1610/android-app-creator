import { motion } from 'framer-motion';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function HistoryPage() {
  return (
    <motion.div className="flex flex-col gap-4 p-4 pt-6" variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <h1 className="font-display text-2xl font-bold">History</h1>
        <p className="text-sm text-muted-foreground">Your past workout sessions</p>
      </motion.div>
      <motion.div variants={item} className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        No sessions logged yet. Start a workout to see your history here.
      </motion.div>
    </motion.div>
  );
}
