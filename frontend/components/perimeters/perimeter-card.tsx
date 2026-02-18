'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Perimeter, BudgetStatus, perimetersApi } from '@/lib/api/perimeters';

interface PerimeterCardProps {
  perimeter: Perimeter;
  onEdit: (perimeter: Perimeter) => void;
  onDelete: (id: string) => void;
  onShare: (perimeter: Perimeter) => void;
}

export function PerimeterCard({ perimeter, onEdit, onDelete, onShare }: PerimeterCardProps) {
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);

  useEffect(() => {
    if (perimeter.budget) loadBudgetStatus();
  }, [perimeter.id, perimeter.budget]);

  const loadBudgetStatus = async () => {
    try {
      const status = await perimetersApi.getBudgetStatus(perimeter.id);
      setBudgetStatus(status);
    } catch {
      /* silent */
    }
  };

  const isOwner = !perimeter.sharedRole;
  const color = perimeter.color || '#4f46e5';

  return (
    <Card className="overflow-hidden">
      <div className="h-1 w-full" style={{ backgroundColor: color }} />
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="shrink-0 text-xl leading-none">{perimeter.icon || '📁'}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-foreground truncate text-sm font-semibold">{perimeter.name}</h3>
                {perimeter.isShared && (
                  <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                    {perimeter.sharedRole ?? 'shared'}
                  </span>
                )}
              </div>
              {perimeter.description && (
                <p className="text-muted-foreground mt-0.5 truncate text-xs">
                  {perimeter.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 gap-1">
            {(isOwner || perimeter.sharedRole === 'manager') && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(perimeter)}
                  className="h-7 px-2 text-xs"
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onShare(perimeter)}
                  className="h-7 px-2 text-xs"
                >
                  Share
                </Button>
              </>
            )}
            {isOwner && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(perimeter.id)}
                className="h-7 px-2 text-xs text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
              >
                Del
              </Button>
            )}
          </div>
        </div>

        {perimeter.budget && budgetStatus && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Budget · {budgetStatus.period}</span>
              <span className="text-foreground font-medium tabular-nums">
                ${Number(budgetStatus.spent).toFixed(2)} / ${Number(budgetStatus.budget).toFixed(2)}
              </span>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className={`h-full rounded-full transition-all ${
                  budgetStatus.percentage > 90
                    ? 'bg-red-500'
                    : budgetStatus.percentage > 75
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(budgetStatus.percentage, 100)}%` }}
              />
            </div>

            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <span>${Number(budgetStatus.remaining).toFixed(2)} remaining</span>
              <span>{Number(budgetStatus.percentage).toFixed(1)}% used</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
