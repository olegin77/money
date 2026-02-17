'use client';

import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Expense } from '@/lib/api/expenses';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <Card className="text-center py-12">
        <div className="text-5xl mb-4">💰</div>
        <p className="text-gray-600 dark:text-gray-400">No expenses yet</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          Create your first expense to get started
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <Card key={expense.id} className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl font-bold text-red-500">
                -${expense.amount.toFixed(2)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {expense.currency}
              </span>
            </div>
            {expense.description && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                {expense.description}
              </p>
            )}
            <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>📅 {format(new Date(expense.date), 'MMM dd, yyyy')}</span>
              {expense.paymentMethod && <span>💳 {expense.paymentMethod}</span>}
              {expense.location && <span>📍 {expense.location}</span>}
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(expense)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(expense.id)}
              className="text-red-500 hover:text-red-600"
            >
              Delete
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
