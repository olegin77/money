'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useT } from '@/hooks/use-t';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const t = useT();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <main className="bg-page flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
              <span className="text-base font-bold text-white">F</span>
            </div>
            <span className="text-foreground text-xl font-semibold">FinTrack</span>
          </div>
        </div>

        <h1 className="text-foreground mb-3 text-3xl font-bold tracking-tight">
          {t('landing_headline')
            .split('\n')
            .map((line, i) => (
              <span key={i}>
                {line}
                {i === 0 ? <br /> : ''}
              </span>
            ))}
        </h1>
        <p className="text-muted-foreground mb-10 text-sm leading-relaxed">{t('landing_sub')}</p>

        <div className="flex flex-col gap-3">
          <Link href="/register" className="block">
            <Button size="lg" className="w-full">
              {t('landing_cta')}
            </Button>
          </Link>
          <Link href="/login" className="block">
            <Button size="lg" variant="outline" className="w-full">
              {t('landing_signin')}
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
