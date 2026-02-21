'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth.store';
import { useT } from '@/hooks/use-t';
import { toast } from '@/hooks/use-toast';
import { usersApi } from '@/lib/api/users';
import { authApi } from '@/lib/api/auth';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Bell, Download, Globe, Keyboard, Shield, User } from 'lucide-react';
import { PageFadeIn } from '@/components/ui/motion';
import { ShortcutsHelpDialog } from '@/components/ui/shortcuts-help-dialog';

export default function SettingsPage() {
  useAuth();
  const t = useT();
  const { user, updateUser } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [currency, setCurrency] = useState(user?.currency ?? 'USD');
  const [saving, setSaving] = useState(false);

  const [exporting, setExporting] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // 2FA
  const [show2faSetup, setShow2faSetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [twoFaCode, setTwoFaCode] = useState('');
  const [twoFaLoading, setTwoFaLoading] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await usersApi.updateProfile({ fullName: fullName || undefined, currency });
      updateUser(updated);
      toast.success(t('toast_profile_saved'));
    } catch {
      toast.error(t('toast_error'));
    } finally {
      setSaving(false);
    }
  };

  const handleLanguage = async (lang: 'en' | 'ru' | 'ar') => {
    try {
      const updated = await usersApi.updateProfile({ language: lang });
      updateUser(updated);
      toast.success(t('toast_language_changed'));
    } catch {
      toast.error(t('toast_error'));
    }
  };

  const handleTheme = async (theme: 'light' | 'dark') => {
    try {
      const updated = await usersApi.updateProfile({ themeMode: theme });
      updateUser(updated);
      toast.success(t('toast_theme_changed'));
    } catch {
      toast.error(t('toast_error'));
    }
  };

  const handle2faEnable = async () => {
    setTwoFaLoading(true);
    try {
      const data = await authApi.generate2FA();
      setQrCode(data.qrCode);
      setShow2faSetup(true);
    } catch {
      toast.error(t('toast_error'));
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handle2faConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFaLoading(true);
    try {
      await authApi.enable2FA(twoFaCode);
      updateUser({ twoFaEnabled: true });
      setShow2faSetup(false);
      setQrCode('');
      setTwoFaCode('');
      toast.success(t('toast_2fa_enabled'));
    } catch {
      toast.error('Invalid code. Try again.');
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handle2faDisable = async () => {
    if (!twoFaCode) return;
    setTwoFaLoading(true);
    try {
      await authApi.disable2FA(twoFaCode);
      updateUser({ twoFaEnabled: false });
      setTwoFaCode('');
      toast.success(t('toast_2fa_disabled'));
    } catch {
      toast.error('Invalid code.');
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handleNotifyToggle = async (key: 'notifyEmail' | 'notifyPush' | 'notifyBudgetAlerts') => {
    try {
      const updated = await usersApi.updateProfile({ [key]: !user?.[key] });
      updateUser(updated);
    } catch {
      toast.error(t('toast_error'));
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await usersApi.exportData();
    } catch {
      toast.error(t('toast_error'));
    } finally {
      setExporting(false);
    }
  };

  const currentLang = user?.language ?? 'en';
  const currentTheme = user?.themeMode ?? 'dark';

  return (
    <ResponsiveContainer>
      <PageFadeIn className="mx-auto max-w-lg space-y-5 px-4 py-6 md:px-6 md:py-8">
        <h1 className="text-foreground text-xl font-bold tracking-tight">{t('set_title')}</h1>

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={14} aria-hidden="true" />
              {t('set_profile')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1.5">
                <Label>{t('set_full_name')}</Label>
                <Input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="John Doe"
                  disabled={saving}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t('set_currency')}</Label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  disabled={saving}
                  className="border-border bg-card text-foreground h-10 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="RUB">RUB — Russian Ruble</option>
                  <option value="GBP">GBP — British Pound</option>
                  <option value="JPY">JPY — Japanese Yen</option>
                </select>
              </div>
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? t('set_saving') : t('set_save')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe size={14} aria-hidden="true" />
              {t('set_language')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  {
                    code: 'en' as const,
                    flag: '\uD83C\uDDEC\uD83C\uDDE7',
                    key: 'set_lang_en' as const,
                  },
                  {
                    code: 'ru' as const,
                    flag: '\uD83C\uDDF7\uD83C\uDDFA',
                    key: 'set_lang_ru' as const,
                  },
                  {
                    code: 'ar' as const,
                    flag: '\uD83C\uDDF8\uD83C\uDDE6',
                    key: 'set_lang_ar' as const,
                  },
                ] as const
              ).map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguage(lang.code)}
                  aria-pressed={currentLang === lang.code}
                  aria-label={t(lang.key)}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                    currentLang === lang.code
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-border text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  {lang.flag} {t(lang.key)}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle>{t('set_theme')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {(['light', 'dark'] as const).map(theme => (
                <button
                  key={theme}
                  onClick={() => handleTheme(theme)}
                  aria-pressed={currentTheme === theme}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                    currentTheme === theme
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-border text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  {theme === 'light' ? `☀️ ${t('set_theme_light')}` : `🌙 ${t('set_theme_dark')}`}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 2FA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={14} aria-hidden="true" />
              {t('set_security')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground text-sm font-medium">{t('set_2fa')}</p>
                <p className="text-muted-foreground text-xs">
                  {user?.twoFaEnabled ? t('set_2fa_enabled') : t('set_2fa_disabled')}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  user?.twoFaEnabled
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                    : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
                }`}
              >
                {user?.twoFaEnabled ? t('set_2fa_enabled') : t('set_2fa_disabled')}
              </span>
            </div>

            {!user?.twoFaEnabled && !show2faSetup && (
              <Button variant="outline" onClick={handle2faEnable} disabled={twoFaLoading}>
                {t('set_2fa_enable')}
              </Button>
            )}

            {show2faSetup && (
              <div className="space-y-3">
                <p className="text-muted-foreground text-xs">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):
                </p>
                {qrCode && (
                  <Image
                    src={qrCode}
                    alt="2FA QR Code"
                    width={160}
                    height={160}
                    className="mx-auto rounded-lg"
                    unoptimized
                  />
                )}
                <form onSubmit={handle2faConfirm} className="flex gap-2">
                  <Input
                    placeholder="000000"
                    value={twoFaCode}
                    onChange={e => setTwoFaCode(e.target.value)}
                    maxLength={6}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={twoFaLoading || twoFaCode.length < 6}>
                    {t('auth_btn_2fa')}
                  </Button>
                </form>
              </div>
            )}

            {user?.twoFaEnabled && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs">
                  Enter a code from your authenticator app to disable 2FA:
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="000000"
                    value={twoFaCode}
                    onChange={e => setTwoFaCode(e.target.value)}
                    maxLength={6}
                    className="flex-1"
                  />
                  <Button
                    variant="danger"
                    onClick={handle2faDisable}
                    disabled={twoFaLoading || twoFaCode.length < 6}
                  >
                    {t('set_2fa_disable')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell size={14} aria-hidden="true" />
              {t('set_notifications')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(
              [
                { key: 'notifyEmail', label: t('set_notify_email') },
                { key: 'notifyPush', label: t('set_notify_push') },
                { key: 'notifyBudgetAlerts', label: t('set_notify_budget') },
              ] as const
            ).map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-foreground text-sm">{item.label}</span>
                <button
                  aria-label={`Toggle ${item.label}`}
                  role="switch"
                  aria-checked={!!user?.[item.key]}
                  onClick={() => handleNotifyToggle(item.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    user?.[item.key] ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                      user?.[item.key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Keyboard size={14} aria-hidden="true" />
              {t('kb_title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3 text-sm">{t('kb_description')}</p>
            <Button variant="outline" onClick={() => setShortcutsOpen(true)}>
              {t('kb_show_shortcuts')}
            </Button>
          </CardContent>
        </Card>
        <ShortcutsHelpDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

        {/* Data Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download size={14} aria-hidden="true" />
              {t('set_data')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3 text-sm">{t('set_export_sub')}</p>
            <Button variant="outline" onClick={handleExport} disabled={exporting}>
              <Download size={14} aria-hidden="true" />
              {exporting ? t('set_exporting') : t('set_export')}
            </Button>
          </CardContent>
        </Card>

        {/* Account info */}
        <Card>
          <CardContent className="pt-5">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="text-foreground font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Username</span>
                <span className="text-foreground font-medium">@{user?.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member since</span>
                <span className="text-foreground font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageFadeIn>
    </ResponsiveContainer>
  );
}
