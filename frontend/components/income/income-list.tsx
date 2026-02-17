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
      <Card className="text-center py-12">
        <div className="text-5xl mb-4">💵</div>
        <p className="text-gray-600 dark:text-gray-400">No income records yet</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          Add your first income to get started
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {incomes.map((income) => (
        <Card key={income.id} className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl font-bold text-green-500">
                +${income.amount.toFixed(2)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {income.currency}
              </span>
            </div>
            {income.description && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                {income.description}
              </p>
            )}
            <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>📅 {format(new Date(income.date), 'MMM dd, yyyy')}</span>
              {income.source && <span>🏢 {income.source}</span>}
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(income)}
            >
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
