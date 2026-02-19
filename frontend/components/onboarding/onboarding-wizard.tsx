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
} from 'lucide-react';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'RUB', 'JPY', 'CNY', 'INR', 'BRL', 'CAD', 'AUD'];
const ONBOARDING_KEY = 'fintrack_onboarding_complete';

export function OnboardingWizard() {
  const t = useT();
  const { user, updateUser } = useAuthStore();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [saving, setSaving] = useState(false);

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

  const features = [
    { icon: TrendingDown, label: t('onb_feat_expenses'), color: 'text-red-500' },
    { icon: TrendingUp, label: t('onb_feat_income'), color: 'text-emerald-500' },
    { icon: FolderOpen, label: t('onb_feat_categories'), color: 'text-amber-500' },
    { icon: BarChart2, label: t('onb_feat_analytics'), color: 'text-indigo-500' },
    { icon: Users, label: t('onb_feat_friends'), color: 'text-violet-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <Card className="animate-in fade-in zoom-in-95 w-full max-w-md">
        <CardContent className="pt-6">
          {/* Progress */}
          <div className="mb-6 flex items-center gap-2">
            {[0, 1, 2].map(i => (
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
                <Wallet className="text-indigo-600" size={28} />
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

          {/* Step 2: Features overview + finish */}
          {step === 2 && (
            <div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600/10">
                  <Check className="text-emerald-600" size={28} />
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
