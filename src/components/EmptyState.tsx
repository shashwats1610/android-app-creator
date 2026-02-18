import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-1 max-w-[240px] text-xs text-muted-foreground/70">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" className="mt-4 touch-target" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
