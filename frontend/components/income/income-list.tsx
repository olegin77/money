'use client';

import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Income } from '@/lib/api/income';

interface IncomeListProps {
  incomes: Income[];
  onEdit: (income: Income) => void;
  onDelete: (id: string) => void;
}

export function IncomeList({ incomes, onEdit, onDelete }: IncomeListProps) {
  if (incomes.length === 0) {
    return (
      <Card className="py-12 text-center">
        <div className="mb-4 text-5xl">💵</div>
        <p className="text-gray-600 dark:text-gray-400">No income records yet</p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
          Add your first income to get started
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {incomes.map(income => (
        <Card key={income.id} className="flex items-center justify-between">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-3">
              <span className="text-2xl font-bold text-green-500">
                +${income.amount.toFixed(2)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{income.currency}</span>
            </div>
            {income.description && (
              <p className="mb-1 text-sm text-gray-700 dark:text-gray-300">{income.description}</p>
            )}
            <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>📅 {format(new Date(income.date), 'MMM dd, yyyy')}</span>
              {income.source && <span>🏢 {income.source}</span>}
            </div>
          </div>
          <div className="ml-4 flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => onEdit(income)}>
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(income.id)}
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
