'use client';

import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function FloatingActionButton({
  onClick,
  icon = <Plus size={22} />,
  className,
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Add new"
      className={cn(
        'fixed bottom-20 right-4 z-40 md:hidden',
        'h-13 w-13 rounded-full',
        'bg-indigo-600 text-white shadow-md',
        'flex items-center justify-center',
        'transition-transform hover:bg-indigo-700 active:scale-95',
        className
      )}
      style={{ width: '52px', height: '52px' }}
    >
      {icon}
    </button>
  );
}
