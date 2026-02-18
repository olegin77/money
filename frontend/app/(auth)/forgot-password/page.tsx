'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api/auth';
import { Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authApi.forgotPassword(email);
    } catch {
      /* always show success to prevent email enumeration */
    } finally {
      setSubmitted(true);
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

        {submitted ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
              <Mail size={22} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-foreground mb-2 text-2xl font-bold">Check your email</h1>
            <p className="text-muted-foreground mb-8 text-sm">
              If an account with <strong>{email}</strong> exists, we've sent a password reset link.
            </p>
            <Link href="/login">
              <Button className="w-full">Back to sign in</Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-foreground mb-1 text-2xl font-bold tracking-tight">
              Reset password
            </h1>
            <p className="text-muted-foreground mb-8 text-sm">
              Enter your email and we&apos;ll send you a reset link
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
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
        )}
      </div>
    </div>
  );
}
