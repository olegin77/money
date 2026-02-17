'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
}

export function Sheet({ open, onOpenChange, children, side = 'bottom' }: SheetProps) {
  if (!open) return null;

  const sideClasses = {
    left: 'left-0 top-0 bottom-0 w-3/4 animate-slide-in-left',
    right: 'right-0 top-0 bottom-0 w-3/4 animate-slide-in-right',
    top: 'top-0 left-0 right-0 h-3/4',
    bottom: 'bottom-0 left-0 right-0 rounded-t-3xl',
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className={cn('fixed glass p-6 animate-scale-in', sideClasses[side])}>
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-6 mt-8">{children}</div>;
}

export function SheetTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-bold">{children}</h2>;
}

export function SheetDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-600 dark:text-gray-400 mt-2">{children}</p>;
}
