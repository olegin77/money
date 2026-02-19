'use client';

import { cn } from '@/lib/utils';
import { SidebarNav } from './sidebar-nav';
import { MobileHeader } from './mobile-header';
import { MobileNav } from './mobile-nav';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveContainer({ children, className }: ResponsiveContainerProps) {
  return (
    <div className="bg-page min-h-screen">
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <SidebarNav />

      {/* Mobile header */}
      <MobileHeader />

      {/* Main content — offset by sidebar width on desktop */}
      <main
        id="main-content"
        role="main"
        className={cn('min-h-screen pb-20 md:ml-56 md:pb-0', className)}
      >
        {children}
      </main>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
