'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, TrendingDown, TrendingUp, FolderOpen, BarChart2 } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Expenses', href: '/expenses', icon: TrendingDown },
  { label: 'Income', href: '/income', icon: TrendingUp },
  { label: 'Categories', href: '/categories', icon: FolderOpen },
  { label: 'Analytics', href: '/analytics', icon: BarChart2 },
];

const authPaths = ['/', '/login', '/register', '/forgot-password'];

export function MobileNav() {
  const pathname = usePathname();

  if (authPaths.includes(pathname)) return null;

  return (
    <nav className="bg-card border-border fixed bottom-0 left-0 right-0 z-50 h-16 border-t md:hidden">
      <div className="flex h-full items-stretch">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'text-muted-foreground flex flex-1 flex-col items-center justify-center gap-1 transition-colors',
                active ? 'text-indigo-600 dark:text-indigo-400' : 'hover:text-foreground'
              )}
            >
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
