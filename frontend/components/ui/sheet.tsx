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
    left: 'left-0 top-0 bottom-0 w-3/4',
    right: 'right-0 top-0 bottom-0 w-3/4',
    top: 'top-0 left-0 right-0 h-3/4',
    bottom: 'bottom-0 left-0 right-0 rounded-t-xl max-h-[80vh]',
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div
        className={cn(
          'bg-card border-border fixed overflow-y-auto p-6 shadow-md',
          side === 'bottom' && 'border-t',
          side === 'top' && 'border-b',
          side === 'left' && 'border-r',
          side === 'right' && 'border-l',
          sideClasses[side]
        )}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="text-muted-foreground absolute right-4 top-4 rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-5 mt-6">{children}</div>;
}

export function SheetTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-foreground text-lg font-semibold">{children}</h2>;
}

export function SheetDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground mt-1 text-sm">{children}</p>;
}
