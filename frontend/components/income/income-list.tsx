'use client';

import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Income } from '@/lib/api/income';
import { useT } from '@/hooks/use-t';
import { RefreshCw, TrendingUp } from 'lucide-react';

interface IncomeListProps {
  incomes: Income[];
  onEdit: (income: Income) => void;
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

export function IncomeList({ incomes, onEdit, onDelete }: IncomeListProps) {
  const t = useT();

  if (incomes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
          <TrendingUp size={20} className="text-muted-foreground" />
        </div>
        <p className="text-foreground mb-1 text-base font-semibold">{t('inc_empty')}</p>
        <p className="text-muted-foreground text-sm">{t('inc_empty_sub')}</p>
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
                  +{parseFloat(String(income.amount)).toFixed(2)}
                </span>
                <span className="text-muted-foreground text-xs">{income.currency}</span>
                {income.isRecurring && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                    <RefreshCw size={10} />
                    {recurringLabel(t, income.recurrenceRule)}
                  </span>
                )}
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
