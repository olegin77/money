'use client';

import { useState, useEffect } from 'react';
import { useT } from '@/hooks/use-t';
import { useAuthStore } from '@/stores/auth.store';
import { usersApi } from '@/lib/api/users';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  TrendingDown,
  TrendingUp,
  FolderOpen,
  BarChart2,
  Users,
  Check,
  ChevronRight,
  Wallet,
  ShoppingCart,
  Car,
  Home,
  Film,
  Heart,
  ShoppingBag,
  Zap,
  GraduationCap,
  Briefcase,
  Laptop,
  LineChart,
  Building,
  Gift,
  Store,
} from 'lucide-react';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'RUB', 'JPY', 'CNY', 'INR', 'BRL', 'CAD', 'AUD'];
const ONBOARDING_KEY = 'fintrack_onboarding_complete';

const TOTAL_STEPS = 5;

/** Expense category presets with icons */
const EXPENSE_PRESETS = [
  { id: 'food', icon: ShoppingCart, key: 'onb_expense_preset_food' as const },
  { id: 'transport', icon: Car, key: 'onb_expense_preset_transport' as const },
  { id: 'housing', icon: Home, key: 'onb_expense_preset_housing' as const },
  { id: 'entertainment', icon: Film, key: 'onb_expense_preset_entertainment' as const },
  { id: 'health', icon: Heart, key: 'onb_expense_preset_health' as const },
  { id: 'shopping', icon: ShoppingBag, key: 'onb_expense_preset_shopping' as const },
  { id: 'utilities', icon: Zap, key: 'onb_expense_preset_utilities' as const },
  { id: 'education', icon: GraduationCap, key: 'onb_expense_preset_education' as const },
] as const;

/** Income source presets with icons */
const INCOME_PRESETS = [
  { id: 'salary', icon: Briefcase, key: 'onb_income_preset_salary' as const },
  { id: 'freelance', icon: Laptop, key: 'onb_income_preset_freelance' as const },
  { id: 'investments', icon: LineChart, key: 'onb_income_preset_investments' as const },
  { id: 'rental', icon: Building, key: 'onb_income_preset_rental' as const },
  { id: 'gifts', icon: Gift, key: 'onb_income_preset_gifts' as const },
  { id: 'business', icon: Store, key: 'onb_income_preset_business' as const },
] as const;

export function OnboardingWizard() {
  const t = useT();
  const { user, updateUser } = useAuthStore();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [saving, setSaving] = useState(false);
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());
  const [selectedIncome, setSelectedIncome] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) {
      setVisible(true);
    }
  }, [user]);

  if (!visible) return null;

  const finish = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setVisible(false);
  };

  const saveCurrency = async () => {
    setSaving(true);
    try {
      const updated = await usersApi.updateProfile({ currency });
      updateUser(updated);
    } catch {
      // non-critical, continue
    } finally {
      setSaving(false);
      setStep(2);
    }
  };

  const toggleExpense = (id: string) => {
    setSelectedExpenses(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleIncome = (id: string) => {
    setSelectedIncome(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const features = [
    { icon: TrendingDown, label: t('onb_feat_expenses'), color: 'text-red-500' },
    { icon: TrendingUp, label: t('onb_feat_income'), color: 'text-emerald-500' },
    { icon: FolderOpen, label: t('onb_feat_categories'), color: 'text-amber-500' },
    { icon: BarChart2, label: t('onb_feat_analytics'), color: 'text-indigo-500' },
    { icon: Users, label: t('onb_feat_friends'), color: 'text-violet-500' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={t('aria_onboarding')}
    >
      <Card className="animate-in fade-in zoom-in-95 w-full max-w-md">
        <CardContent className="pt-6">
          {/* Progress */}
          <div
            className="mb-6 flex items-center gap-2"
            role="progressbar"
            aria-valuenow={step + 1}
            aria-valuemin={1}
            aria-valuemax={TOTAL_STEPS}
            aria-label={t('onb_step')
              .replace('{current}', String(step + 1))
              .replace('{total}', String(TOTAL_STEPS))}
          >
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-700'
                }`}
              />
            ))}
          </div>

          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/10">
                <Wallet className="text-indigo-600" size={28} aria-hidden="true" />
              </div>
              <h2 className="text-foreground text-xl font-bold">{t('onb_welcome')}</h2>
              <p className="text-muted-foreground mt-2 text-sm">{t('onb_welcome_sub')}</p>

              <div className="mt-8 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={finish}>
                  {t('onb_skip')}
                </Button>
                <Button className="flex-1" onClick={() => setStep(1)}>
                  {t('onb_next')} <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 1: Currency */}
          {step === 1 && (
            <div>
              <h2 className="text-foreground text-lg font-bold">{t('onb_currency_title')}</h2>
              <p className="text-muted-foreground mt-1 text-sm">{t('onb_currency_sub')}</p>

              <div className="mt-5 grid grid-cols-5 gap-2">
                {CURRENCIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    aria-pressed={currency === c}
                    aria-label={`Select currency ${c}`}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      currency === c
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-border text-foreground hover:border-indigo-400'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="mt-8 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>
                  {t('onb_back')}
                </Button>
                <Button className="flex-1" onClick={saveCurrency} disabled={saving}>
                  {saving ? '...' : t('onb_next')} {!saving && <ChevronRight size={14} />}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Add first expense — interactive preset selection */}
          {step === 2 && (
            <div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
                  <TrendingDown className="text-red-500" size={28} aria-hidden="true" />
                </div>
                <h2 className="text-foreground text-xl font-bold">{t('onb_expense_title')}</h2>
                <p className="text-muted-foreground mt-2 text-sm">{t('onb_expense_sub')}</p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                {EXPENSE_PRESETS.map(({ id, icon: Icon, key }) => {
                  const selected = selectedExpenses.has(id);
                  return (
                    <button
                      key={id}
                      onClick={() => toggleExpense(id)}
                      aria-pressed={selected}
                      className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-start text-sm font-medium transition-all ${
                        selected
                          ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400'
                          : 'border-border text-foreground hover:border-red-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      {selected ? (
                        <Check size={16} className="shrink-0 text-red-500" />
                      ) : (
                        <Icon size={16} className="text-muted-foreground shrink-0" />
                      )}
                      {t(key)}
                    </button>
                  );
                })}
              </div>

              {selectedExpenses.size > 0 && (
                <p className="text-muted-foreground mt-3 text-center text-xs">
                  {t('onb_selected_count').replace('{count}', String(selectedExpenses.size))}
                </p>
              )}

              <div className="mt-6 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  {t('onb_back')}
                </Button>
                <Button className="flex-1" onClick={() => setStep(3)}>
                  {t('onb_next')} <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Create first income source — interactive preset selection */}
          {step === 3 && (
            <div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
                  <TrendingUp className="text-emerald-500" size={28} aria-hidden="true" />
                </div>
                <h2 className="text-foreground text-xl font-bold">{t('onb_income_title')}</h2>
                <p className="text-muted-foreground mt-2 text-sm">{t('onb_income_sub')}</p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                {INCOME_PRESETS.map(({ id, icon: Icon, key }) => {
                  const selected = selectedIncome.has(id);
                  return (
                    <button
                      key={id}
                      onClick={() => toggleIncome(id)}
                      aria-pressed={selected}
                      className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-start text-sm font-medium transition-all ${
                        selected
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border-border text-foreground hover:border-emerald-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      {selected ? (
                        <Check size={16} className="shrink-0 text-emerald-500" />
                      ) : (
                        <Icon size={16} className="text-muted-foreground shrink-0" />
                      )}
                      {t(key)}
                    </button>
                  );
                })}
              </div>

              {selectedIncome.size > 0 && (
                <p className="text-muted-foreground mt-3 text-center text-xs">
                  {t('onb_selected_count').replace('{count}', String(selectedIncome.size))}
                </p>
              )}

              <div className="mt-6 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  {t('onb_back')}
                </Button>
                <Button className="flex-1" onClick={() => setStep(4)}>
                  {t('onb_next')} <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Features overview + finish */}
          {step === 4 && (
            <div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600/10">
                  <Check className="text-emerald-600" size={28} aria-hidden="true" />
                </div>
                <h2 className="text-foreground text-xl font-bold">{t('onb_features_title')}</h2>
                <p className="text-muted-foreground mt-1 text-sm">{t('onb_features_sub')}</p>
              </div>

              <div className="mt-5 space-y-2">
                {features.map(({ icon: Icon, label, color }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-lg bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/50"
                  >
                    <Icon size={16} className={color} />
                    <span className="text-foreground text-sm">{label}</span>
                  </div>
                ))}
              </div>

              <Button className="mt-8 w-full" onClick={finish}>
                {t('onb_finish')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
