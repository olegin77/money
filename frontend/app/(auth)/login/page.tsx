'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore(state => state.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFaCode, setTwoFaCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authApi.login({
        email,
        password,
        twoFaCode: requires2FA ? twoFaCode : undefined,
      });

      if (result.requires2FA) {
        setRequires2FA(true);
        setLoading(false);
        return;
      }

      if (result.success && result.data) {
        setUser(result.data.user);
        router.push('/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || err.response?.data?.error || 'Login failed');
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
          {requires2FA ? 'Two-factor auth' : 'Welcome back'}
        </h1>
        <p className="text-muted-foreground mb-8 text-sm">
          {requires2FA ? 'Enter the code from your authenticator app' : 'Sign in to your account'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!requires2FA ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="2fa">Authentication code</Label>
              <Input
                id="2fa"
                type="text"
                placeholder="000 000"
                maxLength={6}
                value={twoFaCode}
                onChange={e => setTwoFaCode(e.target.value.replace(/\D/g, ''))}
                required
                disabled={loading}
                autoFocus
                className="text-center font-mono text-xl tracking-widest"
              />
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : requires2FA ? 'Verify & sign in' : 'Sign in'}
          </Button>

          {requires2FA && (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setRequires2FA(false);
                setTwoFaCode('');
                setError('');
              }}
            >
              Back to login
            </Button>
          )}
        </form>

        <p className="text-muted-foreground mt-8 text-center text-sm">
          No account?{' '}
          <Link
            href="/register"
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
