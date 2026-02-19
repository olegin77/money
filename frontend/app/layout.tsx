import type { Metadata, Viewport } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import { OfflineIndicator } from '@/components/layout/offline-indicator';
import { Toaster } from '@/components/ui/toaster';
import { WebSocketProvider } from '@/components/providers/websocket-provider';
import { KeyboardShortcutsProvider } from '@/components/providers/keyboard-shortcuts-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f9fafb' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

export const metadata: Metadata = {
  title: 'FinTrack — Personal Finance',
  description: 'Track expenses, manage budgets, analyze your spending.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FinTrack',
  },
  icons: { icon: '/favicon.ico', apple: '/icon-192x192.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700,800&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;var s=JSON.parse(localStorage.getItem('auth-storage')||'{}');var t=(s.state&&s.state.user&&s.state.user.themeMode)||'';if(t==='dark')d.classList.add('dark');else if(t==='light')d.classList.remove('dark');else if(window.matchMedia('(prefers-color-scheme:dark)').matches)d.classList.add('dark');}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${dmSans.variable} bg-page text-primary font-sans antialiased`}>
        {children}
        <ThemeProvider />
        <WebSocketProvider />
        <KeyboardShortcutsProvider />
        <OfflineIndicator />
        <Toaster />
      </body>
    </html>
  );
}
