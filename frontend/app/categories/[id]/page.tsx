'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useT } from '@/hooks/use-t';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import { PageFadeIn } from '@/components/ui/motion';
import { perimetersApi, Perimeter, BudgetStatus } from '@/lib/api/perimeters';
import { expensesApi, Expense } from '@/lib/api/expenses';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, TrendingDown } from 'lucide-react';

export default function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isLoading: authLoading } = useAuth(true);
  const t = useT();
  const [category, setCategory] = useState<Perimeter | null>(null);
  const [budget, setBudget] = useState<BudgetStatus | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && id) loadData();
  }, [authLoading, id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cat, expData] = await Promise.all([
        perimetersApi.findOne(id),
        expensesApi.findAll({ page: 1, limit: 50, categoryId: id }),
      ]);
      setCategory(cat);
      setExpenses(expData.items);
      if (cat.budget) {
        try {
          const b = await perimetersApi.getBudgetStatus(id);
          setBudget(b);
        } catch {
          /* budget endpoint might not exist */
        }
      }
    } catch {
      toast.error(t('toast_error_load'));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <ResponsiveContainer>
        <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </ResponsiveContainer>
    );
  }

  if (!category) {
    return (
      <ResponsiveContainer>
        <div className="flex flex-col items-center justify-center p-16">
          <p className="text-muted-foreground">Category not found</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/categories')}>
            Back to categories
          </Button>
        </div>
      </ResponsiveContainer>
    );
  }

  const budgetPct = budget ? Math.min(budget.percentage, 100) : 0;

  return (
    <ResponsiveContainer>
      <PageFadeIn className="p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/categories')}
              className="text-muted-foreground hover:text-foreground mb-3 flex items-center gap-1 text-sm transition-colors"
            >
              <ArrowLeft size={14} />
              {t('cat_title')}
            </button>
            <div className="flex items-center gap-3">
              {category.icon && <span className="text-3xl">{category.icon}</span>}
              <div>
                <h1 className="text-foreground text-2xl font-bold">{category.name}</h1>
                {category.description && (
                  <p className="text-muted-foreground mt-0.5 text-sm">{category.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Budget progress */}
          {budget && category.budget && (
            <Card className="mb-6">
              <CardContent className="pt-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    Budget
                  </p>
                  <p className="text-foreground text-sm font-semibold tabular-nums">
                    ${Number(budget.spent).toFixed(2)} / ${Number(category.budget).toFixed(2)}
                  </p>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      budgetPct >= 100
                        ? 'bg-red-500'
                        : budgetPct >= 80
                          ? 'bg-amber-500'
                          : 'bg-indigo-500'
                    }`}
                    style={{ width: `${budgetPct}%` }}
                  />
                </div>
                <p className="text-muted-foreground mt-1.5 text-xs">
                  {budgetPct.toFixed(0)}% used &middot; ${Number(budget.remaining).toFixed(2)}{' '}
                  remaining
                </p>
              </CardContent>
            </Card>
          )}

          {/* Expenses feed */}
          <Card>
            <CardContent className="pt-5">
              <p className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-wide">
                {t('nav_expenses')} ({expenses.length})
              </p>
              {expenses.length === 0 ? (
                <div className="text-muted-foreground py-8 text-center text-sm">
                  {t('exp_empty')}
                </div>
              ) : (
                <div className="divide-border divide-y">
                  {expenses.map(expense => (
                    <div key={expense.id} className="flex items-center justify-between py-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <TrendingDown size={12} className="shrink-0 text-red-400" />
                          <p className="text-foreground truncate text-sm">
                            {expense.description || t('nav_expenses')}
                          </p>
                        </div>
                        <p className="text-muted-foreground mt-0.5 text-xs">{expense.date}</p>
                      </div>
                      <span className="shrink-0 text-sm font-medium tabular-nums text-red-500">
                        -${Number(expense.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageFadeIn>
    </ResponsiveContainer>
  );
}
