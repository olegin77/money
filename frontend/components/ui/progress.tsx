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
      success: 'bg-gradient-to-r from-green-400 to-green-500',
      warning: 'bg-gradient-to-r from-orange-400 to-orange-500',
      danger: 'bg-gradient-to-r from-red-400 to-red-500',
      default: 'aurora-gradient',
    };

    return (
      <div ref={ref} className={cn('progress-bar', className)} {...props}>
        <div
          className={cn('progress-fill', variantClasses[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
