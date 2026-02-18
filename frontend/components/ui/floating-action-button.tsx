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
  icon = <Plus size={24} />,
  className,
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-24 right-4 z-40 md:hidden',
        'h-14 w-14 rounded-full',
        'aurora-gradient text-white shadow-lg',
        'flex items-center justify-center',
        'transition-transform active:scale-95',
        'hover:shadow-xl',
        className
      )}
    >
      {icon}
    </button>
  );
}
