'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api/auth';
import { toast } from '@/hooks/use-toast';
import { useT } from '@/hooks/use-t';
import { CheckCircle } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useT();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-foreground mb-2 text-2xl font-bold">Invalid link</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          This password reset link is invalid or has expired.
        </p>
        <Link href="/forgot-password">
          <Button className="w-full">Request new link</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth_passwords_no_match'));
      return;
    }

    if (password.length < 8) {
      setError(t('auth_password_too_short'));
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      toast.success('Password reset successful');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(msg || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
          <CheckCircle size={22} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-foreground mb-2 text-2xl font-bold">Password reset!</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          Your password has been updated. Redirecting to login...
        </p>
        <Link href="/login">
          <Button className="w-full">Go to login</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-foreground mb-1 text-2xl font-bold tracking-tight">Set new password</h1>
      <p className="text-muted-foreground mb-8 text-sm">Enter your new password below</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">{t('auth_field_password')}</Label>
          <Input
            id="password"
            type="password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
            autoFocus
            minLength={8}
          />
          <p className="text-muted-foreground text-xs">{t('auth_field_password_hint')}</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">{t('auth_field_confirm')}</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset password'}
        </Button>
      </form>

      <p className="text-muted-foreground mt-8 text-center text-sm">
        <Link
          href="/login"
          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Back to sign in
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
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

        <Suspense
          fallback={<div className="text-muted-foreground text-center text-sm">Loading...</div>}
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
