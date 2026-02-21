'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/auth.store';
import { useT } from '@/hooks/use-t';

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore(state => state.setUser);
  const t = useT();

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth_passwords_no_match'));
      return;
    }

    if (formData.password.length < 8) {
      setError(t('auth_password_too_short'));
      return;
    }

    setLoading(true);

    try {
      const result = await authApi.register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName || undefined,
      });

      if (result.success && result.data) {
        setUser(result.data.user);
        router.push('/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(
        Array.isArray(msg) ? msg[0] : msg || err.response?.data?.error || 'Registration failed'
      );
      setLoading(false);
    }
  };

  return (
    <div className="bg-page flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <span className="text-xs font-bold text-white">F</span>
          </div>
          <span className="text-foreground font-semibold">FinTrack</span>
        </div>

        <h1 className="text-foreground mb-1 text-2xl font-bold tracking-tight">
          {t('auth_register_title')}
        </h1>
        <p className="text-muted-foreground mb-8 text-sm">{t('auth_register_sub')}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">{t('auth_field_email')}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t('auth_field_email_ph')}
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="username">{t('auth_field_username')}</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_]+"
            />
            <p className="text-muted-foreground text-xs">{t('auth_field_username_hint')}</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fullName">
              {t('auth_field_fullname')}{' '}
              <span className="text-muted-foreground font-normal">
                {t('auth_field_fullname_opt')}
              </span>
            </Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">{t('auth_field_password')}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={8}
            />
            <p className="text-muted-foreground text-xs">{t('auth_field_password_hint')}</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">{t('auth_field_confirm')}</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
            >
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('auth_btn_register_loading') : t('auth_btn_register')}
          </Button>
        </form>

        <p className="text-muted-foreground mt-8 text-center text-sm">
          {t('auth_have_account')}{' '}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {t('auth_signin_link')}
          </Link>
        </p>
      </div>
    </div>
  );
}
