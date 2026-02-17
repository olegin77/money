'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth(true);

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

  return (
    <div className="min-h-screen p-8">
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

        <div className="glass rounded-3xl p-8">
          <h2 className="mb-4 text-2xl font-bold">Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Dashboard content coming soon...
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Balance</p>
              <p className="text-3xl font-bold mt-2">$0.00</p>
            </div>
            <div className="glass rounded-2xl p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">Expenses</p>
              <p className="text-3xl font-bold mt-2 text-red-500">$0.00</p>
            </div>
            <div className="glass rounded-2xl p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">Income</p>
              <p className="text-3xl font-bold mt-2 text-green-500">$0.00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
