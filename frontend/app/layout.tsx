import type { Metadata } from 'next';
import { DM_Sans, Inter } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { OfflineIndicator } from '@/components/layout/offline-indicator';

// DM Sans for body text
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// Satoshi fallback to Inter (Satoshi is paid font, using Inter as free alternative)
const satoshi = Inter({
  subsets: ['latin'],
  variable: '--font-satoshi',
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FinTrack Pro - Data Serenity Finance Management',
  description: 'Modern finance management application with Data Serenity design - Track expenses, manage budgets, analyze spending with beautiful charts',
  manifest: '/manifest.json',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F9FAFB' },
    { media: '(prefers-color-scheme: dark)', color: '#141D2B' },
  ],
  viewport: 'minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FinTrack Pro',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192x192.png',
  },
  openGraph: {
    type: 'website',
    title: 'FinTrack Pro - Data Serenity Finance',
    description: 'Modern finance management with beautiful design',
    siteName: 'FinTrack Pro',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${dmSans.variable} ${satoshi.variable} font-sans antialiased`}>
        <div className="texture-noise min-h-screen">
          {children}
          <OfflineIndicator />
        </div>
      </body>
    </html>
  );
}
