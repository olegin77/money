'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, TrendingDown, TrendingUp, BarChart3, FolderOpen, Users } from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Expenses', href: '/expenses', icon: TrendingDown },
  { name: 'Income', href: '/income', icon: TrendingUp },
  { name: 'Categories', href: '/categories', icon: FolderOpen },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Friends', href: '/friends', icon: Users },
];

export function MobileNav() {
  const pathname = usePathname();

  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password'
  ) {
    return null;
  }

  return (
    <nav className="glass fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 md:hidden">
      <div className="flex items-center justify-around px-2 py-3">
        {navigation.map(item => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'hover:text-primary hover:bg-primary/5 text-gray-600 dark:text-gray-400'
              )}
            >
              <Icon size={20} strokeWidth={2} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
