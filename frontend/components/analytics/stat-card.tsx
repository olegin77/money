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
    <Card className={cn('', className)}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">{title}</p>
            <p className="mb-1 text-3xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>}
            {trend && (
              <div
                className={cn(
                  'mt-2 text-xs font-medium',
                  trend.isPositive ? 'text-green-500' : 'text-red-500'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
              </div>
            )}
          </div>
          {icon && <div className="text-2xl opacity-50">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
