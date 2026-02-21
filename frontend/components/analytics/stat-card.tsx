'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, subtitle, trend, icon, className }: StatCardProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground mb-2 text-[10px] font-medium uppercase tracking-wide opacity-80 sm:text-xs">
              {title}
            </p>
            <p className="text-lg font-bold tabular-nums sm:text-2xl">{value}</p>
            {subtitle && (
              <p className="text-muted-foreground mt-1 text-xs opacity-70">{subtitle}</p>
            )}
            {trend && (
              <div
                className={cn(
                  'mt-1.5 text-xs font-medium',
                  trend.isPositive ? 'text-emerald-500' : 'text-red-500'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
              </div>
            )}
          </div>
          {icon && <span className="ml-2 shrink-0 text-xl opacity-40">{icon}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
