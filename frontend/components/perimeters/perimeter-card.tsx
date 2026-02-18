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
    if (perimeter.budget) {
      loadBudgetStatus();
    }
  }, [perimeter.id, perimeter.budget]);

  const loadBudgetStatus = async () => {
    try {
      const status = await perimetersApi.getBudgetStatus(perimeter.id);
      setBudgetStatus(status);
    } catch (error) {
      console.error('Failed to load budget status:', error);
    }
  };

  const isOwner = !perimeter.sharedRole;

  return (
    <Card
      className="p-6 transition-shadow hover:shadow-lg"
      style={{ borderLeft: `4px solid ${perimeter.color || '#6366F1'}` }}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{perimeter.icon || '💰'}</div>
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold">
              {perimeter.name}
              {perimeter.isShared && (
                <span className="rounded-full bg-purple-500/20 px-2 py-1 text-xs text-purple-500">
                  {perimeter.sharedRole ? `Shared (${perimeter.sharedRole})` : 'Shared'}
                </span>
              )}
            </h3>
            {perimeter.description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {perimeter.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {(isOwner || perimeter.sharedRole === 'manager') && (
            <>
              <Button size="sm" variant="ghost" onClick={() => onEdit(perimeter)}>
                Edit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onShare(perimeter)}>
                Share
              </Button>
            </>
          )}
          {isOwner && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(perimeter.id)}
              className="text-red-500 hover:text-red-600"
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {perimeter.budget && budgetStatus && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Budget ({budgetStatus.period})</span>
            <span className="font-semibold">
              ${budgetStatus.spent.toFixed(2)} / ${budgetStatus.budget.toFixed(2)}
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className={`h-full transition-all ${
                budgetStatus.percentage > 90
                  ? 'bg-red-500'
                  : budgetStatus.percentage > 75
                    ? 'bg-orange-500'
                    : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(budgetStatus.percentage, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Remaining: ${budgetStatus.remaining.toFixed(2)}</span>
            <span>{budgetStatus.percentage.toFixed(1)}% used</span>
          </div>
        </div>
      )}
    </Card>
  );
}
