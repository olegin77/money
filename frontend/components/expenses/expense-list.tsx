'use client';

import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Expense } from '@/lib/api/expenses';
import { TrendingDown } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
          <TrendingDown size={20} className="text-muted-foreground" />
        </div>
        <p className="text-foreground mb-1 text-base font-semibold">No expenses yet</p>
        <p className="text-muted-foreground text-sm">Add your first expense to get started</p>
      </div>
    );
  }

  return (
    <Card>
      <div className="divide-border divide-y">
        {expenses.map(expense => (
          <div key={expense.id} className="flex items-center gap-3 px-5 py-3.5">
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex items-baseline gap-2">
                <span className="text-sm font-semibold tabular-nums text-red-500">
                  −${expense.amount.toFixed(2)}
                </span>
                <span className="text-muted-foreground text-xs">{expense.currency}</span>
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
                className="h-8 px-2.5 text-xs"
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(expense.id)}
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
