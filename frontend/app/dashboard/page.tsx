'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { expensesApi, ExpenseStats } from '@/lib/api/expenses';
import { incomeApi, IncomeStats } from '@/lib/api/income';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth(true);
  const [expenseStats, setExpenseStats] = useState<ExpenseStats | null>(null);
  const [incomeStats, setIncomeStats] = useState<IncomeStats | null>(null);

  useEffect(() => {
    if (!isLoading) {
      loadStats();
    }
  }, [isLoading]);

  const loadStats = async () => {
    try {
      const [expenses, income] = await Promise.all([
        expensesApi.getStats(),
        incomeApi.getStats(),
      ]);
      setExpenseStats(expenses);
      setIncomeStats(income);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const balance = (incomeStats?.total || 0) - (expenseStats?.total || 0);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.username}!</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's your financial overview
            </p>
          </div>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="aurora-gradient text-white">
            <CardContent className="pt-6">
              <p className="text-sm opacity-90 mb-2">Total Balance</p>
              <p className="text-4xl font-bold">
                ${balance.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Expenses</p>
              <p className="text-4xl font-bold text-red-500">
                ${(expenseStats?.total || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {expenseStats?.count || 0} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Income</p>
              <p className="text-4xl font-bold text-green-500">
                ${(incomeStats?.total || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {incomeStats?.count || 0} transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/expenses">
                <Button className="w-full" variant="outline">
                  📊 View Expenses
                </Button>
              </Link>
              <Link href="/income">
                <Button className="w-full" variant="outline">
                  💰 View Income
                </Button>
              </Link>
              <Link href="/categories">
                <Button className="w-full" variant="outline">
                  📁 Categories
                </Button>
              </Link>
              <Link href="/analytics">
                <Button className="w-full" variant="outline">
                  📈 Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
