'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  TrendingDown,
  TrendingUp,
  FolderOpen,
  BarChart2,
  Users,
  LogOut,
  Settings,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/lib/api/auth';
import { useT } from '@/hooks/use-t';
import { NotificationBell } from '@/components/notifications/notification-bell';

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const t = useT();

  const navItems = [
    { label: t('nav_dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { label: t('nav_expenses'), href: '/expenses', icon: TrendingDown },
    { label: t('nav_income'), href: '/income', icon: TrendingUp },
    { label: t('nav_categories'), href: '/categories', icon: FolderOpen },
    { label: t('nav_analytics'), href: '/analytics', icon: BarChart2 },
    { label: t('nav_friends'), href: '/friends', icon: Users },
    { label: t('nav_settings'), href: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    logout();
    router.push('/login');
  };

  return (
    <aside
      role="navigation"
      aria-label="Main navigation"
      className="border-border bg-card fixed left-0 top-0 z-30 hidden h-full w-56 flex-col border-r md:flex"
    >
      {/* Logo */}
      <div className="border-border flex h-14 shrink-0 items-center border-b px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
            <span className="text-xs font-bold text-white">F</span>
          </div>
          <span className="text-foreground text-sm font-semibold">FinTrack</span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn('nav-item w-full', active && 'active')}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
              <span>{label}</span>
            </Link>
          );
        })}

        {user?.isAdmin && (
          <Link
            href="/admin"
            className={cn('nav-item mt-1 w-full', pathname === '/admin' && 'active')}
          >
            <Shield size={16} strokeWidth={1.8} />
            <span>{t('nav_admin')}</span>
          </Link>
        )}
      </nav>

      {/* User + Logout */}
      <div className="border-border shrink-0 space-y-1 border-t px-3 py-4">
        {user && (
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                  {user.username?.[0]?.toUpperCase() ?? 'U'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-foreground truncate text-xs font-medium">{user.username}</p>
                <p className="text-2xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <NotificationBell />
          </div>
        )}
        <button
          onClick={handleLogout}
          aria-label={t('nav_signout')}
          className="nav-item text-muted-foreground w-full hover:text-red-500"
        >
          <LogOut size={16} strokeWidth={1.8} />
          <span>{t('nav_signout')}</span>
        </button>
      </div>
    </aside>
  );
}
