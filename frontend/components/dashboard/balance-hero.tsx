'use client';

import { Wallet } from 'lucide-react';
import { CountUp } from '@/components/ui/count-up';
import { useT } from '@/hooks/use-t';

interface BalanceHeroProps {
  balance: number;
  savingsRate?: number;
  currency: string;
}

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: '$',
  EUR: '\u20AC',
  RUB: '\u20BD',
  GBP: '\u00A3',
};

export function BalanceHero({ balance, savingsRate, currency }: BalanceHeroProps) {
  const t = useT();
  const positive = balance >= 0;
  const symbol = CURRENCY_SYMBOL[currency] || '';

  return (
    <div
      className={[
        'relative overflow-hidden rounded-2xl p-6',
        positive
          ? 'bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-500 text-white'
          : 'bg-gradient-to-br from-red-600 via-red-500 to-rose-500 text-white',
      ].join(' ')}
    >
      {/* Shimmer overlay */}
      <div
        className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_3s_ease-in-out_infinite]"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
        }}
      />

      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/5" />

      <div className="relative z-10">
        <div className="mb-4 flex items-center gap-2 opacity-80">
          <Wallet size={16} />
          <span className="text-xs font-medium uppercase tracking-wider">{t('dash_balance')}</span>
        </div>

        <p className="font-heading text-4xl font-bold tabular-nums tracking-tight">
          <CountUp end={balance} prefix={symbol} duration={1200} />
        </p>

        {savingsRate !== undefined && (
          <p className="mt-2 text-sm opacity-70">
            {Number(savingsRate) >= 0 ? '+' : ''}
            {Number(savingsRate).toFixed(1)}% savings rate
          </p>
        )}
      </div>
    </div>
  );
}
