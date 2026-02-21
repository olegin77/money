'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Delete } from 'lucide-react';

interface NumPadProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'] as const;

export function NumPad({ value, onChange, onSubmit }: NumPadProps) {
  const handleKey = useCallback(
    (key: string) => {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }

      if (key === 'del') {
        onChange(value.slice(0, -1));
        return;
      }

      if (key === '.') {
        if (value.includes('.')) return;
        onChange(value + '.');
        return;
      }

      // Limit decimal places to 2
      const parts = value.split('.');
      if (parts[1] && parts[1].length >= 2) return;

      // Limit total length
      if (value.replace('.', '').length >= 10) return;

      onChange(value + key);
    },
    [value, onChange]
  );

  return (
    <div className="space-y-3">
      {/* Display */}
      <div className="flex items-baseline justify-center py-2">
        <span className="text-muted-foreground mr-1 text-2xl">$</span>
        <span className="font-heading text-foreground min-h-[48px] text-4xl font-bold tabular-nums">
          {value || '0'}
        </span>
      </div>

      {/* Keypad grid */}
      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Number pad">
        {KEYS.map(key => (
          <motion.button
            key={key}
            type="button"
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
            onClick={() => handleKey(key)}
            aria-label={key === 'del' ? 'Delete' : key === '.' ? 'Decimal point' : key}
            className="text-foreground bg-card border-border flex h-14 items-center justify-center rounded-xl border text-xl font-semibold transition-colors active:bg-indigo-50 dark:active:bg-indigo-950/30"
          >
            {key === 'del' ? (
              <Delete size={22} className="text-muted-foreground" aria-hidden="true" />
            ) : (
              key
            )}
          </motion.button>
        ))}
      </div>

      {onSubmit && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onSubmit}
          disabled={!value || value === '0' || value === '.'}
          className="gradient-hero flex h-14 w-full items-center justify-center rounded-xl text-lg font-semibold text-white disabled:opacity-40"
        >
          Continue
        </motion.button>
      )}
    </div>
  );
}
