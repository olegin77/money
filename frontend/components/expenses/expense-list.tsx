'use client';

import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedList, AnimatedListItem } from '@/components/ui/motion';
import { Expense } from '@/lib/api/expenses';
import { useT } from '@/hooks/use-t';
import { RefreshCw, Receipt } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

function recurringLabel(t: ReturnType<typeof useT>, rule?: string): string {
  if (!rule) return t('recurring_monthly');
  try {
    const r = JSON.parse(rule);
    if (r.period === 'monthly' && r.day) {
      return t('recurring_monthly_day').replace('{day}', String(r.day));
    }
    const key = `recurring_${r.period}` as Parameters<typeof t>[0];
    return t(key);
  } catch {
    return t('recurring_monthly');
  }
}

export function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  const t = useT();

  if (expenses.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title={t('exp_empty')}
        description={t('exp_empty_sub')}
        iconColor="text-red-400"
      />
    );
  }

  return (
    <Card>
      <AnimatedList className="divide-border divide-y">
        {expenses.map(expense => (
          <AnimatedListItem
            key={expense.id}
            layoutId={expense.id}
            className="flex items-center gap-3 px-5 py-3.5"
          >
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex items-baseline gap-2">
                <span className="text-sm font-semibold tabular-nums text-red-500">
                  −{parseFloat(String(expense.amount)).toFixed(2)}
                </span>
                <span className="text-muted-foreground text-xs">{expense.currency}</span>
                {expense.isRecurring && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                    <RefreshCw size={10} aria-hidden="true" />
                    {recurringLabel(t, expense.recurrenceRule)}
                  </span>
                )}
              </div>
              {expense.description && (
                <p className="text-foreground truncate text-sm">{expense.description}</p>
              )}
              <div className="text-muted-foreground mt-0.5 flex gap-3 text-xs">
                <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
                {expense.paymentMethod && <span>{expense.paymentMethod}</span>}
                {expense.location && <span>{expense.location}</span>}
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(expense)}
                aria-label={`Edit expense: ${expense.description || expense.amount}`}
                className="h-8 px-2.5 text-xs"
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(expense.id)}
                aria-label={`Delete expense: ${expense.description || expense.amount}`}
                className="h-8 px-2.5 text-xs text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
              >
                Delete
              </Button>
            </div>
          </AnimatedListItem>
        ))}
      </AnimatedList>
    </Card>
  );
}
