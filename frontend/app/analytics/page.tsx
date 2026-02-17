'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/analytics/stat-card';
import { ExpenseChart } from '@/components/analytics/expense-chart';
import { CategoryBreakdown } from '@/components/analytics/category-breakdown';
import { CashFlowChart } from '@/components/analytics/cash-flow-chart';
import { MonthlyComparison } from '@/components/analytics/monthly-comparison';
import { analyticsApi, DashboardData } from '@/lib/api/analytics';

type Period = 'week' | 'month' | 'year' | 'all';

export default function AnalyticsPage() {
  const { isLoading: authLoading } = useAuth(true);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('month');

  useEffect(() => {
    if (!authLoading) {
      loadDashboard();
    }
  }, [authLoading, period]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await analyticsApi.getDashboard({ period });
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const { summary, expensesByCategory, topExpenses } = dashboard;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Insights into your financial activity
            </p>
          </div>
          <div className="flex gap-2">
            {(['week', 'month', 'year', 'all'] as Period[]).map((p) => (
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

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Balance"
            value={`$${summary.balance.toFixed(2)}`}
            className={
              summary.balance >= 0
                ? 'aurora-gradient text-white'
                : 'bg-red-500 text-white'
            }
            icon="💰"
          />
          <StatCard
            title="Total Expenses"
            value={`$${summary.totalExpenses.toFixed(2)}`}
            subtitle={`${summary.expenseCount} transactions`}
            icon="📊"
          />
          <StatCard
            title="Total Income"
            value={`$${summary.totalIncome.toFixed(2)}`}
            subtitle={`${summary.incomeCount} transactions`}
            icon="💵"
          />
          <StatCard
            title="Savings Rate"
            value={`${summary.savingsRate.toFixed(1)}%`}
            subtitle={`Avg: $${summary.avgIncome.toFixed(2)}`}
            icon="📈"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CategoryBreakdown data={expensesByCategory} />
          <CashFlowChart
            data={[
              {
                date: dashboard.period.start,
                expenses: summary.totalExpenses,
                income: summary.totalIncome,
                balance: summary.balance,
              },
            ]}
          />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          <MonthlyComparison
            data={[
              {
                month: dashboard.period.start,
                expenses: summary.totalExpenses,
                income: summary.totalIncome,
                balance: summary.balance,
                savingsRate: summary.savingsRate.toFixed(2),
              },
            ]}
          />
        </div>

        {/* Top Expenses */}
        {topExpenses.length > 0 && (
          <div className="glass rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-4">Top Expenses</h2>
            <div className="space-y-3">
              {topExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 glass rounded-xl"
                >
                  <div>
                    <p className="font-medium">{expense.description || 'No description'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-red-500">
                    ${expense.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
