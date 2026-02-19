'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useT } from '@/hooks/use-t';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import { expensesApi, ExpenseStats } from '@/lib/api/expenses';
import { incomeApi, IncomeStats } from '@/lib/api/income';
import Link from 'next/link';
import {
  TrendingDown,
  TrendingUp,
  Wallet,
  BarChart2,
  FolderOpen,
  Users,
  ArrowRight,
} from 'lucide-react';
import { PageFadeIn, StaggerContainer, StaggerItem, HoverCard } from '@/components/ui/motion';
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';

export default function DashboardPage() {
  const { user, isLoading } = useAuth(true);
  const t = useT();
  const [expenseStats, setExpenseStats] = useState<ExpenseStats | null>(null);
  const [incomeStats, setIncomeStats] = useState<IncomeStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) loadStats();
  }, [isLoading]);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const [expenses, income] = await Promise.all([expensesApi.getStats(), incomeApi.getStats()]);
      setExpenseStats(expenses);
      setIncomeStats(income);
    } catch {
      /* silent */
    } finally {
      setStatsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ResponsiveContainer>
        <div className="mx-auto max-w-4xl space-y-4 p-4 md:p-8">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </ResponsiveContainer>
    );
  }

  const balance = Number(incomeStats?.total || 0) - Number(expenseStats?.total || 0);
  const balancePositive = balance >= 0;

  const quickLinks = [
    {
      href: '/expenses',
      labelKey: 'nav_expenses' as const,
      sub: t('exp_empty_sub'),
      icon: TrendingDown,
      color: 'text-red-500',
    },
    {
      href: '/income',
      labelKey: 'nav_income' as const,
      sub: t('inc_empty_sub'),
      icon: TrendingUp,
      color: 'text-emerald-500',
    },
    {
      href: '/categories',
      labelKey: 'nav_categories' as const,
      sub: t('cat_add_first'),
      icon: FolderOpen,
      color: 'text-amber-500',
    },
    {
      href: '/analytics',
      labelKey: 'nav_analytics' as const,
      sub: t('ana_title'),
      icon: BarChart2,
      color: 'text-indigo-500',
    },
    {
      href: '/friends',
      labelKey: 'nav_friends' as const,
      sub: t('fri_no_friends_sub'),
      icon: Users,
      color: 'text-violet-500',
    },
  ];

  return (
    <ResponsiveContainer>
      <OnboardingWizard />
      <PageFadeIn className="p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          {/* Desktop heading */}
          <div className="mb-8 hidden md:block">
            <h1 className="text-foreground text-2xl font-bold">{user?.username}</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">{t('dash_quick')}</p>
          </div>

          {/* Mobile heading */}
          <p className="text-muted-foreground mb-5 text-sm md:hidden">{t('dash_quick')}</p>

          {/* Summary cards */}
          {statsLoading ? (
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : (
            <StaggerContainer className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Balance */}
              <StaggerItem>
                <HoverCard>
                  <Card
                    className={
                      balancePositive
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-red-600 bg-red-600 text-white'
                    }
                  >
                    <CardContent className="pt-5">
                      <div className="mb-3 flex items-center gap-2 opacity-80">
                        <Wallet size={14} />
                        <span className="text-xs font-medium uppercase tracking-wide">
                          {t('dash_balance')}
                        </span>
                      </div>
                      <p className="text-3xl font-bold tabular-nums">
                        {balancePositive ? '' : '-'}${Math.abs(balance).toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                </HoverCard>
              </StaggerItem>

              {/* Expenses */}
              <StaggerItem>
                <HoverCard>
                  <Card>
                    <CardContent className="pt-5">
                      <div className="text-muted-foreground mb-3 flex items-center gap-2">
                        <TrendingDown size={14} />
                        <span className="text-xs font-medium uppercase tracking-wide">
                          {t('dash_expenses')}
                        </span>
                      </div>
                      <p className="text-3xl font-bold tabular-nums text-red-500">
                        ${Number(expenseStats?.total || 0).toFixed(2)}
                      </p>
                      <p className="text-muted-foreground mt-1.5 text-xs">
                        {expenseStats?.count || 0} txn
                      </p>
                    </CardContent>
                  </Card>
                </HoverCard>
              </StaggerItem>

              {/* Income */}
              <StaggerItem>
                <HoverCard>
                  <Card>
                    <CardContent className="pt-5">
                      <div className="text-muted-foreground mb-3 flex items-center gap-2">
                        <TrendingUp size={14} />
                        <span className="text-xs font-medium uppercase tracking-wide">
                          {t('dash_income')}
                        </span>
                      </div>
                      <p className="text-3xl font-bold tabular-nums text-emerald-500">
                        ${Number(incomeStats?.total || 0).toFixed(2)}
                      </p>
                      <p className="text-muted-foreground mt-1.5 text-xs">
                        {incomeStats?.count || 0} txn
                      </p>
                    </CardContent>
                  </Card>
                </HoverCard>
              </StaggerItem>
            </StaggerContainer>
          )}

          {/* Quick links */}
          <StaggerContainer staggerDelay={0.04}>
            <StaggerItem>
              <Card>
                <CardContent className="pb-2 pt-5">
                  <p className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-wide">
                    {t('dash_quick')}
                  </p>
                  <div className="divide-border divide-y">
                    {quickLinks.map(({ href, labelKey, sub, icon: Icon, color }) => (
                      <Link
                        key={href}
                        href={href}
                        className="group flex items-center gap-3 py-3 transition-opacity hover:opacity-80"
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 ${color}`}
                        >
                          <Icon size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground text-sm font-medium">{t(labelKey)}</p>
                          <p className="text-muted-foreground text-xs">{sub}</p>
                        </div>
                        <ArrowRight
                          size={14}
                          className="text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5"
                        />
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </PageFadeIn>
    </ResponsiveContainer>
  );
}
