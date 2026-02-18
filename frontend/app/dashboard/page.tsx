'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { expensesApi, ExpenseStats } from '@/lib/api/expenses';
import { incomeApi, IncomeStats } from '@/lib/api/income';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth(true);
  const [expenseStats, setExpenseStats] = useState<ExpenseStats | null>(null);
  const [incomeStats, setIncomeStats] = useState<IncomeStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      loadStats();
    }
  }, [isLoading]);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const [expenses, income] = await Promise.all([expensesApi.getStats(), incomeApi.getStats()]);
      setExpenseStats(expenses);
      setIncomeStats(income);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ResponsiveContainer>
        <div className="min-h-screen p-4 md:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <Skeleton className="h-10 w-64" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        </div>
      </ResponsiveContainer>
    );
  }

  const balance = (incomeStats?.total || 0) - (expenseStats?.total || 0);

  return (
    <ResponsiveContainer>
      <div className="min-h-screen p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Desktop Header */}
          <div className="mb-8 hidden items-center justify-between md:flex">
            <div>
              <h1 className="font-satoshi mb-2 text-4xl font-bold">
                Welcome back, {user?.username}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Here&apos;s your financial overview
              </p>
            </div>
            <div className="flex gap-3">
              {user?.isAdmin && (
                <Link href="/admin">
                  <Button variant="outline">Admin Panel</Button>
                </Link>
              )}
              <Button onClick={logout} variant="outline">
                Logout
              </Button>
            </div>
          </div>

          {/* Mobile Welcome */}
          <div className="mb-6 md:hidden">
            <p className="text-gray-600 dark:text-gray-400">Here&apos;s your financial overview</p>
          </div>

          {/* Summary Cards */}
          {statsLoading ? (
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="aurora-gradient text-white">
                <CardContent className="pt-6">
                  <p className="mb-2 text-sm opacity-90">Total Balance</p>
                  <p className="font-satoshi text-4xl font-bold tabular-nums">
                    ${balance.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Expenses</p>
                  <p className="font-satoshi text-4xl font-bold tabular-nums text-red-500">
                    ${(expenseStats?.total || 0).toFixed(2)}
                  </p>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {expenseStats?.count || 0} transactions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Income</p>
                  <p className="font-satoshi text-4xl font-bold tabular-nums text-green-500">
                    ${(incomeStats?.total || 0).toFixed(2)}
                  </p>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {incomeStats?.count || 0} transactions
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="font-satoshi">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Link href="/expenses">
                  <Button className="w-full" variant="outline">
                    Expenses
                  </Button>
                </Link>
                <Link href="/income">
                  <Button className="w-full" variant="outline">
                    Income
                  </Button>
                </Link>
                <Link href="/categories">
                  <Button className="w-full" variant="outline">
                    Categories
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button className="w-full" variant="outline">
                    Analytics
                  </Button>
                </Link>
                <Link href="/friends">
                  <Button className="w-full" variant="outline">
                    Friends
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile FAB for quick expense entry */}
      <FloatingActionButton onClick={() => router.push('/expenses')} />
    </ResponsiveContainer>
  );
}
