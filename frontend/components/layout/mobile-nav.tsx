'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BarChart2, LayoutDashboard, Plus, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { useT } from '@/hooks/use-t';

const authPaths = ['/', '/login', '/register', '/forgot-password'];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useT();
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const leftItems = [
    { label: t('nav_dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { label: t('nav_expenses'), href: '/expenses', icon: TrendingDown },
  ];

  const rightItems = [
    { label: t('nav_income'), href: '/income', icon: TrendingUp },
    { label: t('nav_analytics'), href: '/analytics', icon: BarChart2 },
    { label: t('nav_friends'), href: '/friends', icon: Users },
  ];

  if (authPaths.includes(pathname)) return null;

  const handleQuickAdd = (type: 'expense' | 'income') => {
    setShowQuickAdd(false);
    router.push(`/${type === 'expense' ? 'expenses' : 'income'}?action=new`);
  };

  return (
    <>
      {/* Quick-add overlay */}
      {showQuickAdd && (
        <div className="fixed inset-0 z-[60]" onClick={() => setShowQuickAdd(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 pb-[env(safe-area-inset-bottom)]">
            <div className="animate-in slide-in-from-bottom-4 flex gap-3 duration-200">
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleQuickAdd('expense');
                }}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white px-6 py-4 shadow-lg dark:bg-zinc-800"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/30">
                  <TrendingDown size={22} className="text-red-500" />
                </div>
                <span className="text-foreground text-xs font-medium">{t('nav_expenses')}</span>
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleQuickAdd('income');
                }}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white px-6 py-4 shadow-lg dark:bg-zinc-800"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                  <TrendingUp size={22} className="text-emerald-500" />
                </div>
                <span className="text-foreground text-xs font-medium">{t('nav_income')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <nav
        aria-label="Mobile navigation"
        className="bg-card border-border fixed bottom-0 left-0 right-0 z-50 border-t pb-[env(safe-area-inset-bottom)] md:hidden"
        style={{ minHeight: '4rem' }}
      >
        <div className="relative flex h-full items-stretch">
          {/* Left items */}
          {leftItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'text-muted-foreground relative flex flex-1 flex-col items-center justify-center gap-1 transition-colors',
                  active ? 'text-indigo-600 dark:text-indigo-400' : 'hover:text-foreground'
                )}
              >
                {active && (
                  <span className="absolute -top-px left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                )}
                <Icon
                  size={20}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={active ? 'text-indigo-600 dark:text-indigo-400' : ''}
                />
                <span
                  className={cn(
                    'text-2xs font-medium',
                    active ? 'text-indigo-600 dark:text-indigo-400' : ''
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}

          {/* Center quick-add button */}
          <div className="flex flex-1 items-center justify-center">
            <button
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className={cn(
                'flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95',
                showQuickAdd && 'rotate-45 bg-zinc-600 shadow-zinc-600/30'
              )}
              aria-label="Quick add"
            >
              <Plus size={24} strokeWidth={2.5} />
            </button>
          </div>

          {/* Right items */}
          {rightItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'text-muted-foreground relative flex flex-1 flex-col items-center justify-center gap-1 transition-colors',
                  active ? 'text-indigo-600 dark:text-indigo-400' : 'hover:text-foreground'
                )}
              >
                {active && (
                  <span className="absolute -top-px left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                )}
                <Icon
                  size={20}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={active ? 'text-indigo-600 dark:text-indigo-400' : ''}
                />
                <span
                  className={cn(
                    'text-2xs font-medium',
                    active ? 'text-indigo-600 dark:text-indigo-400' : ''
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
