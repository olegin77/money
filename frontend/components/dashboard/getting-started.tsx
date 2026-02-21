'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { useT } from '@/hooks/use-t';
import { Check, FolderOpen, TrendingDown, TrendingUp, Users, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GettingStartedProps {
  hasCategories: boolean;
  hasExpenses: boolean;
  hasIncome: boolean;
  hasFriends: boolean;
}

interface Step {
  key: string;
  icon: React.ElementType;
  label: string;
  description: string;
  href: string;
  done: boolean;
  color: string;
}

export function GettingStarted({
  hasCategories,
  hasExpenses,
  hasIncome,
  hasFriends,
}: GettingStartedProps) {
  const t = useT();

  const steps: Step[] = [
    {
      key: 'categories',
      icon: FolderOpen,
      label: t('nav_categories'),
      description: t('gs_step_categories'),
      href: '/categories',
      done: hasCategories,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30',
    },
    {
      key: 'expense',
      icon: TrendingDown,
      label: t('nav_expenses'),
      description: t('gs_step_expense'),
      href: '/expenses?action=new',
      done: hasExpenses,
      color: 'text-red-500 bg-red-50 dark:bg-red-950/30',
    },
    {
      key: 'income',
      icon: TrendingUp,
      label: t('nav_income'),
      description: t('gs_step_income'),
      href: '/income?action=new',
      done: hasIncome,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      key: 'friends',
      icon: Users,
      label: t('nav_friends'),
      description: t('gs_step_friends'),
      href: '/friends',
      done: hasFriends,
      color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/30',
    },
  ];

  const completedCount = steps.filter(s => s.done).length;
  const progress = (completedCount / steps.length) * 100;

  // All done — don't show
  if (completedCount === steps.length) return null;

  return (
    <Card className="mb-6 overflow-hidden">
      <CardContent className="pt-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-foreground text-sm font-semibold">{t('gs_title')}</p>
            <p className="text-muted-foreground text-xs">
              {completedCount}/{steps.length} {t('gs_completed')}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-1">
          {steps.map(step => (
            <Link
              key={step.key}
              href={step.done ? '#' : step.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                step.done ? 'opacity-50' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  step.done ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30' : step.color
                )}
              >
                {step.done ? <Check size={16} /> : <step.icon size={16} />}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'text-sm font-medium',
                    step.done ? 'text-muted-foreground line-through' : 'text-foreground'
                  )}
                >
                  {step.label}
                </p>
                <p className="text-muted-foreground text-xs">{step.description}</p>
              </div>
              {!step.done && (
                <ChevronRight
                  size={14}
                  className="text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5"
                />
              )}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
