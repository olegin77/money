'use client';

import { type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  iconColor?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  iconColor = 'text-indigo-500',
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 text-center', className)}>
      <div className="relative mb-6">
        {/* Decorative rings */}
        <div className="absolute -inset-4 rounded-full bg-indigo-50 opacity-60 dark:bg-indigo-950/20" />
        <div className="absolute -inset-2 rounded-full bg-indigo-100/50 dark:bg-indigo-900/20" />
        <div
          className={cn(
            'relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-50 to-zinc-100 shadow-sm dark:from-zinc-800 dark:to-zinc-900',
            iconColor
          )}
        >
          <Icon size={28} strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="text-foreground mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm text-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="lg" className="gap-2 shadow-sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
