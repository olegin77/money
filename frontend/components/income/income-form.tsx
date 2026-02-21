'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumPad } from '@/components/ui/num-pad';
import { useT } from '@/hooks/use-t';
import { CreateIncomeData } from '@/lib/api/income';
import { RefreshCw } from 'lucide-react';

type PresetKey =
  | 'preset_salary'
  | 'preset_freelance'
  | 'preset_rental'
  | 'preset_dividends'
  | 'preset_gift';

const INCOME_PRESETS: { key: PresetKey; emoji: string; source: string }[] = [
  { key: 'preset_salary', emoji: '💰', source: 'employer' },
  { key: 'preset_freelance', emoji: '💻', source: 'client' },
  { key: 'preset_rental', emoji: '🏠', source: 'tenant' },
  { key: 'preset_dividends', emoji: '📈', source: 'broker' },
  { key: 'preset_gift', emoji: '🎁', source: '' },
];

type RecurPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface RecurRule {
  period: RecurPeriod;
  day?: number;
}

interface IncomeFormProps {
  onSubmit: (data: CreateIncomeData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CreateIncomeData>;
}

export function IncomeForm({ onSubmit, onCancel, initialData }: IncomeFormProps) {
  const t = useT();
  const [loading, setLoading] = useState(false);

  const initialRule: RecurRule | null = initialData?.recurrenceRule
    ? (() => {
        try {
          return JSON.parse(initialData.recurrenceRule!);
        } catch {
          return null;
        }
      })()
    : null;

  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [currency, setCurrency] = useState(initialData?.currency || 'USD');
  const [description, setDescription] = useState(initialData?.description || '');
  const [source, setSource] = useState(initialData?.source || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring || false);
  const [recurPeriod, setRecurPeriod] = useState<RecurPeriod>(initialRule?.period || 'monthly');
  const [recurDay, setRecurDay] = useState<number>(initialRule?.day || new Date().getDate());

  const getProjection = (): string | null => {
    const amt = parseFloat(amount);
    if (!isRecurring || !amt || isNaN(amt)) return null;
    let multiplier = 1;
    switch (recurPeriod) {
      case 'daily':
        multiplier = 365;
        break;
      case 'weekly':
        multiplier = 52;
        break;
      case 'monthly':
        multiplier = 12;
        break;
      case 'yearly':
        multiplier = 1;
        break;
    }
    const yearly = amt * multiplier;
    return `≈ ${yearly.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${currency} ${t('form_period_per_year')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || isNaN(amt)) return;
    setLoading(true);
    try {
      const rule: RecurRule | undefined = isRecurring
        ? recurPeriod === 'monthly'
          ? { period: 'monthly', day: recurDay }
          : { period: recurPeriod }
        : undefined;
      await onSubmit({
        amount: amt,
        currency,
        description: description || undefined,
        source: source || undefined,
        date,
        isRecurring,
        recurrenceRule: rule ? JSON.stringify(rule) : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const projection = getProjection();
  const periods: RecurPeriod[] = ['daily', 'weekly', 'monthly', 'yearly'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Presets */}
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">{t('form_presets')}</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {INCOME_PRESETS.map(preset => (
            <button
              key={preset.key}
              type="button"
              onClick={() => {
                setDescription(t(preset.key));
                if (preset.source) setSource(preset.source);
                // Salary → auto-enable monthly recurring
                if (preset.key === 'preset_salary' || preset.key === 'preset_rental') {
                  setIsRecurring(true);
                  setRecurPeriod('monthly');
                }
              }}
              className={`border-border text-foreground flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400 ${
                description === t(preset.key)
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : ''
              }`}
            >
              <span>{preset.emoji}</span>
              <span>{t(preset.key)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Amount — NumPad on mobile, Input on desktop */}
      <div className="md:hidden">
        <NumPad value={amount} onChange={setAmount} />
      </div>
      <div className="hidden md:grid md:grid-cols-2 md:gap-3">
        <div className="space-y-1.5">
          <Label>{t('form_amount')} *</Label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-1.5">
          <Label>{t('form_currency')}</Label>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            disabled={loading}
            className="border-border bg-card text-foreground h-10 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option>USD</option>
            <option>EUR</option>
            <option>RUB</option>
            <option>GBP</option>
            <option>JPY</option>
          </select>
        </div>
      </div>
      {/* Currency selector on mobile (below numpad) */}
      <div className="md:hidden">
        <Label>{t('form_currency')}</Label>
        <select
          value={currency}
          onChange={e => setCurrency(e.target.value)}
          disabled={loading}
          className="border-border bg-card text-foreground mt-1.5 h-10 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option>USD</option>
          <option>EUR</option>
          <option>RUB</option>
          <option>GBP</option>
          <option>JPY</option>
        </select>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label>{t('form_description')}</Label>
        <Input
          type="text"
          placeholder={t('form_description_ph')}
          maxLength={500}
          value={description}
          onChange={e => setDescription(e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Source */}
      <div className="space-y-1.5">
        <Label>{t('form_source')}</Label>
        <Input
          type="text"
          placeholder={t('form_source_ph')}
          maxLength={100}
          value={source}
          onChange={e => setSource(e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Date */}
      <div className="space-y-1.5">
        <Label>{t('form_date')} *</Label>
        <Input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      {/* Recurring */}
      <div className="border-border space-y-3 rounded-xl border p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-foreground text-sm font-medium">{t('form_recurring')}</p>
            <p className="text-muted-foreground text-xs">{t('form_recurring_hint')}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isRecurring}
            aria-label={t('form_recurring')}
            onClick={() => setIsRecurring(!isRecurring)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isRecurring ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                isRecurring ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {isRecurring && (
          <>
            <div className="grid grid-cols-4 gap-1.5">
              {periods.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setRecurPeriod(p)}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                    recurPeriod === p
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-border text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  {t(`form_period_${p}` as Parameters<typeof t>[0])}
                </button>
              ))}
            </div>

            {recurPeriod === 'monthly' && (
              <div className="space-y-1.5">
                <Label>{t('form_recurring_day')}</Label>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  value={recurDay}
                  onChange={e => setRecurDay(parseInt(e.target.value) || 1)}
                  disabled={loading}
                />
              </div>
            )}

            {projection && (
              <div
                className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                aria-live="polite"
              >
                <RefreshCw size={13} aria-hidden="true" />
                {projection}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? t('set_saving') : t('inc_save')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          {t('form_cancel')}
        </Button>
      </div>
    </form>
  );
}
