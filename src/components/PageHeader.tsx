import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  rightAction?: ReactNode;
}

export function PageHeader({ title, subtitle, backTo, rightAction }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3"
    >
      {backTo && (
        <Button
          variant="ghost"
          size="icon"
          className="touch-target shrink-0"
          aria-label="Go back"
          onClick={() => navigate(backTo)}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {rightAction && <div className="shrink-0">{rightAction}</div>}
    </motion.div>
  );
}
