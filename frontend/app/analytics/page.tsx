'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/analytics/stat-card';
import { CategoryBreakdown } from '@/components/analytics/category-breakdown';
import { CashFlowChart } from '@/components/analytics/cash-flow-chart';
import { MonthlyComparison } from '@/components/analytics/monthly-comparison';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import {
  analyticsApi,
  DashboardData,
  CashFlowData,
  MonthlyComparisonData,
} from '@/lib/api/analytics';

type Period = 'week' | 'month' | 'year' | 'all';
const PERIODS: Period[] = ['week', 'month', 'year', 'all'];

export default function AnalyticsPage() {
  const { isLoading: authLoading } = useAuth(true);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [cashFlow, setCashFlow] = useState<CashFlowData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyComparisonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('month');

  useEffect(() => {
    if (!authLoading) loadAll();
  }, [authLoading, period]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [data, flow, monthly] = await Promise.all([
        analyticsApi.getDashboard({ period }),
        analyticsApi.getCashFlow({
          startDate: period !== 'all' ? undefined : '2020-01-01',
          endDate: undefined,
        }),
        analyticsApi.getMonthlyComparison(period === 'year' ? 12 : period === 'all' ? 24 : 6),
      ]);
      setDashboard(data);
      setCashFlow(flow);
      setMonthlyData(monthly);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <ResponsiveContainer>
        <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-8">
          <Skeleton className="h-8 w-36" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
          <Skeleton className="h-56 rounded-xl" />
        </div>
      </ResponsiveContainer>
    );
  }

  if (!dashboard) return null;

  const { summary, expensesByCategory, topExpenses } = dashboard;

  return (
    <ResponsiveContainer>
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="hidden md:block">
              <h1 className="text-foreground text-2xl font-bold">Analytics</h1>
              <p className="text-muted-foreground mt-0.5 text-sm">Insights into your finances</p>
            </div>
            {/* Period selector */}
            <div className="flex gap-1.5 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
              {PERIODS.map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={[
                    'rounded-md px-3 py-1 text-xs font-medium transition-all',
                    period === p
                      ? 'text-foreground shadow-xs bg-white dark:bg-zinc-700'
                      : 'text-muted-foreground hover:text-foreground',
                  ].join(' ')}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              title="Balance"
              value={`$${summary.balance.toFixed(2)}`}
              className={[
                'col-span-2 md:col-span-1',
                summary.balance >= 0
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-red-600 bg-red-600 text-white',
              ].join(' ')}
              icon="💰"
            />
            <StatCard
              title="Expenses"
              value={`$${summary.totalExpenses.toFixed(2)}`}
              subtitle={`${summary.expenseCount} tx`}
              icon="📊"
            />
            <StatCard
              title="Income"
              value={`$${summary.totalIncome.toFixed(2)}`}
              subtitle={`${summary.incomeCount} tx`}
              icon="💵"
            />
            <StatCard
              title="Savings"
              value={`${Number(summary.savingsRate).toFixed(1)}%`}
              subtitle={`Avg: $${summary.avgIncome.toFixed(2)}`}
              icon="📈"
            />
          </div>

          {/* Charts row */}
          <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <CategoryBreakdown data={expensesByCategory} />
            <CashFlowChart data={cashFlow} />
          </div>

          {/* Monthly comparison */}
          <div className="mb-4">
            <MonthlyComparison data={monthlyData} />
          </div>

          {/* Top expenses */}
          {topExpenses.length > 0 && (
            <Card>
              <CardContent className="pt-5">
                <p className="text-muted-foreground mb-4 text-xs font-medium uppercase tracking-wide">
                  Top expenses
                </p>
                <div className="space-y-2">
                  {topExpenses.map((expense, idx) => (
                    <div key={expense.id} className="flex items-center gap-3 py-2">
                      <span className="text-muted-foreground w-5 shrink-0 text-right text-xs">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate text-sm font-medium">
                          {expense.description || 'No description'}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {new Date(expense.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold tabular-nums text-red-500">
                        ${Number(expense.amount).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ResponsiveContainer>
  );
}
