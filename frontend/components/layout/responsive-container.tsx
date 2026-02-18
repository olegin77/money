'use client';

import { cn } from '@/lib/utils';
import { MobileHeader } from './mobile-header';
import { MobileNav } from './mobile-nav';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveContainer({ children, className }: ResponsiveContainerProps) {
  return (
    <>
      <MobileHeader />
      <main className={cn('pb-20 md:pb-8', className)}>{children}</main>
      <MobileNav />
    </>
  );
}
