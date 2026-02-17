'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/expenses': 'Expenses',
  '/income': 'Income',
  '/categories': 'Categories',
  '/analytics': 'Analytics',
  '/friends': 'Friends',
  '/admin': 'Admin Panel',
};

export function MobileHeader() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/' || pathname === '/login' || pathname === '/register' || pathname === '/forgot-password') {
    return null;
  }

  const title = pageTitles[pathname] || 'FinTrack Pro';
  const showBack = pathname !== '/dashboard';

  return (
    <header className="sticky top-0 z-40 md:hidden glass border-b border-white/10 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8"
            >
              <ArrowLeft size={20} />
            </Button>
          )}
          <h1 className="text-lg font-bold">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bell size={20} />
          </Button>
        </div>
      </div>
    </header>
  );
}
