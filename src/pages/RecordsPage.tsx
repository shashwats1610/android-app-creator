import { motion } from 'framer-motion';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function RecordsPage() {
  return (
    <motion.div className="flex flex-col gap-4 p-4 pt-6" variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <h1 className="font-display text-2xl font-bold">Records</h1>
        <p className="text-sm text-muted-foreground">Personal records & body stats</p>
      </motion.div>
      <motion.div variants={item} className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        Complete workouts to start tracking personal records.
      </motion.div>
    </motion.div>
  );
}
