'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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

export default function AnalyticsPage() {
  const { isLoading: authLoading } = useAuth(true);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [cashFlow, setCashFlow] = useState<CashFlowData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyComparisonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('month');

  useEffect(() => {
    if (!authLoading) {
      loadAll();
    }
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
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <ResponsiveContainer>
        <div className="min-h-screen p-4 md:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <Skeleton className="h-10 w-48" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Skeleton className="h-80 rounded-2xl" />
              <Skeleton className="h-80 rounded-2xl" />
            </div>
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </ResponsiveContainer>
    );
  }

  if (!dashboard) return null;

  const { summary, expensesByCategory, topExpenses } = dashboard;

  return (
    <ResponsiveContainer>
      <div className="min-h-screen p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header - hidden on mobile (MobileHeader shows it) */}
          <div className="mb-8 hidden items-center justify-between md:flex">
            <div>
              <h1 className="font-satoshi mb-2 text-4xl font-bold">Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Insights into your financial activity
              </p>
            </div>
            <div className="flex gap-2">
              {(['week', 'month', 'year', 'all'] as Period[]).map(p => (
                <Button
                  key={p}
                  variant={period === p ? 'default' : 'outline'}
                  onClick={() => setPeriod(p)}
                  size="sm"
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Mobile period selector */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1 md:hidden">
            {(['week', 'month', 'year', 'all'] as Period[]).map(p => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'outline'}
                onClick={() => setPeriod(p)}
                size="sm"
                className="shrink-0"
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Button>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              title="Balance"
              value={`$${summary.balance.toFixed(2)}`}
              className={
                summary.balance >= 0
                  ? 'aurora-gradient col-span-2 text-white md:col-span-1'
                  : 'col-span-2 bg-red-500 text-white md:col-span-1'
              }
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

          {/* Charts Row 1 */}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CategoryBreakdown data={expensesByCategory} />
            <CashFlowChart data={cashFlow} />
          </div>

          {/* Charts Row 2 */}
          <div className="mb-6 grid grid-cols-1 gap-6">
            <MonthlyComparison data={monthlyData} />
          </div>

          {/* Top Expenses */}
          {topExpenses.length > 0 && (
            <div className="glass rounded-3xl p-6">
              <h2 className="font-satoshi mb-4 text-xl font-bold">Top Expenses</h2>
              <div className="space-y-3">
                {topExpenses.map(expense => (
                  <div
                    key={expense.id}
                    className="glass flex items-center justify-between rounded-xl p-4"
                  >
                    <div>
                      <p className="font-medium">{expense.description || 'No description'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-xl font-bold tabular-nums text-red-500">
                      ${Number(expense.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ResponsiveContainer>
  );
}
