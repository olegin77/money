import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-xl bg-neutral-200 dark:bg-ocean-700',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
