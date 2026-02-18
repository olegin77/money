'use client';

import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Income } from '@/lib/api/income';
import { TrendingUp } from 'lucide-react';

interface IncomeListProps {
  incomes: Income[];
  onEdit: (income: Income) => void;
  onDelete: (id: string) => void;
}

export function IncomeList({ incomes, onEdit, onDelete }: IncomeListProps) {
  if (incomes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
          <TrendingUp size={20} className="text-muted-foreground" />
        </div>
        <p className="text-foreground mb-1 text-base font-semibold">No income records yet</p>
        <p className="text-muted-foreground text-sm">Add your first income to get started</p>
      </div>
    );
  }

  return (
    <Card>
      <div className="divide-border divide-y">
        {incomes.map(income => (
          <div key={income.id} className="flex items-center gap-3 px-5 py-3.5">
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex items-baseline gap-2">
                <span className="text-sm font-semibold tabular-nums text-emerald-500">
                  +${income.amount.toFixed(2)}
                </span>
                <span className="text-muted-foreground text-xs">{income.currency}</span>
              </div>
              {income.description && (
                <p className="text-foreground truncate text-sm">{income.description}</p>
              )}
              <div className="text-muted-foreground mt-0.5 flex gap-3 text-xs">
                <span>{format(new Date(income.date), 'MMM d, yyyy')}</span>
                {income.source && <span>{income.source}</span>}
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(income)}
                className="h-8 px-2.5 text-xs"
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(income.id)}
                className="h-8 px-2.5 text-xs text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
