'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SuccessCheckProps {
  show: boolean;
  onDone?: () => void;
  className?: string;
}

export function SuccessCheck({ show, onDone, className }: SuccessCheckProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDone?.();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [show, onDone]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm',
        'animate-[fade-in_0.15s_ease-out]',
        className
      )}
    >
      <div className="flex h-20 w-20 animate-[scale-bounce_0.4s_ease-out] items-center justify-center rounded-full bg-emerald-500 shadow-lg">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-10 w-10"
        >
          <path
            d="M5 13l4 4L19 7"
            className="animate-[draw-check_0.4s_ease-out_0.2s_both]"
            style={{
              strokeDasharray: 24,
              strokeDashoffset: 24,
            }}
          />
        </svg>
      </div>
    </div>
  );
}
