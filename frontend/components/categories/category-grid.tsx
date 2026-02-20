'use client';

import Link from 'next/link';
import { Perimeter } from '@/lib/api/perimeters';
import { cn } from '@/lib/utils';
import { FolderOpen } from 'lucide-react';

interface CategoryGridProps {
  perimeters: Perimeter[];
  onEdit?: (perimeter: Perimeter) => void;
}

const STAGGER_DELAY_MS = 50;

export function CategoryGrid({ perimeters, onEdit }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:gap-4">
      {perimeters.map((perimeter, idx) => (
        <Link
          key={perimeter.id}
          href={`/categories/${perimeter.id}`}
          className={cn(
            'group relative flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all',
            'border-border bg-card hover:border-indigo-400 hover:shadow-sm',
            'animate-[slide-up_0.3s_ease-out_both]'
          )}
          style={{ animationDelay: `${idx * STAGGER_DELAY_MS}ms` }}
          onContextMenu={e => {
            if (onEdit) {
              e.preventDefault();
              onEdit(perimeter);
            }
          }}
        >
          {/* Color dot or icon */}
          <div
            className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl text-lg"
            style={{
              backgroundColor: perimeter.color ? `${perimeter.color}20` : 'hsl(var(--bg-card))',
            }}
          >
            {perimeter.icon ? (
              <span className="text-xl">{perimeter.icon}</span>
            ) : (
              <FolderOpen
                size={18}
                style={{ color: perimeter.color || 'hsl(var(--text-muted))' }}
              />
            )}
          </div>

          <p className="text-foreground line-clamp-2 text-xs font-medium leading-tight">
            {perimeter.name}
          </p>

          {/* Budget indicator */}
          {perimeter.budget && (
            <div className="mt-1.5 h-1 w-8 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div className="h-full rounded-full bg-indigo-500" style={{ width: '0%' }} />
            </div>
          )}

          {/* Shared badge */}
          {perimeter.isShared && (
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-violet-500" />
          )}
        </Link>
      ))}
    </div>
  );
}
