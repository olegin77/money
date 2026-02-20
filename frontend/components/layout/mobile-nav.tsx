'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BarChart2,
  FolderOpen,
  LayoutDashboard,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useT } from '@/hooks/use-t';

const authPaths = ['/', '/login', '/register', '/forgot-password'];

export function MobileNav() {
  const pathname = usePathname();
  const t = useT();

  const navItems = [
    { label: t('nav_dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { label: t('nav_expenses'), href: '/expenses', icon: TrendingDown },
    { label: t('nav_income'), href: '/income', icon: TrendingUp },
    { label: t('nav_categories'), href: '/categories', icon: FolderOpen },
    { label: t('nav_analytics'), href: '/analytics', icon: BarChart2 },
    { label: t('nav_friends'), href: '/friends', icon: Users },
  ];

  if (authPaths.includes(pathname)) return null;

  return (
    <nav
      aria-label="Mobile navigation"
      className="bg-card border-border fixed bottom-0 left-0 right-0 z-50 border-t pb-[env(safe-area-inset-bottom)] md:hidden"
      style={{ minHeight: '4rem' }}
    >
      <div className="flex h-full items-stretch">
        {navItems.map(({ label, href, icon: Icon }) => {
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
  );
}
