'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/expenses': 'Expenses',
  '/income': 'Income',
  '/categories': 'Categories',
  '/analytics': 'Analytics',
  '/friends': 'Friends',
  '/admin': 'Admin',
};

const authPaths = ['/', '/login', '/register', '/forgot-password'];

export function MobileHeader() {
  const pathname = usePathname();
  const router = useRouter();

  if (authPaths.includes(pathname)) return null;

  const title = pageTitles[pathname] ?? 'FinTrack';
  const showBack = pathname !== '/dashboard';

  return (
    <header className="bg-card border-border sticky top-0 z-40 flex h-14 items-center border-b px-4 md:hidden">
      <div className="flex flex-1 items-center gap-2">
        {showBack ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="-ml-1 h-8 w-8"
          >
            <ArrowLeft size={18} />
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600">
              <span className="text-xs font-bold text-white">F</span>
            </div>
          </div>
        )}
        <h1 className="text-base font-semibold">{title}</h1>
      </div>
    </header>
  );
}
