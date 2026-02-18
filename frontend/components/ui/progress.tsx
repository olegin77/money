import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: 'success' | 'warning' | 'danger' | 'default';
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, variant = 'default', ...props }, ref) => {
    const percentage = Math.min((value / max) * 100, 100);

    const variantClasses = {
      success: 'bg-emerald-500',
      warning: 'bg-amber-500',
      danger: 'bg-red-500',
      default: 'bg-indigo-600',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800',
          className
        )}
        {...props}
      >
        <div
          className={cn('h-full rounded-full transition-all', variantClasses[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
