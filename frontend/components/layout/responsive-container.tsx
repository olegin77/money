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
      {/* Desktop sidebar */}
      <SidebarNav />

      {/* Mobile header */}
      <MobileHeader />

      {/* Main content — offset by sidebar width on desktop */}
      <main className={cn('min-h-screen pb-20 md:ml-56 md:pb-0', className)}>{children}</main>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
