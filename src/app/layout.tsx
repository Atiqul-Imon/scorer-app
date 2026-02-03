import type { Metadata, Viewport } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const roboto = Roboto({ 
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'], 
  variable: '--font-roboto',
  display: 'swap', // Show fallback font immediately, swap when loaded
  preload: true, // Preload font for faster rendering
  adjustFontFallback: true, // Adjust fallback font metrics
});

export const metadata: Metadata = {
  title: 'Scorenews Scorer - Hyper-Local Cricket Match Scoring',
  description: 'Mobile-first web app for cricket scorers to create and manage local cricket matches',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Scorenews Scorer',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#111827', // Dark gray for dark theme
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={roboto.variable}>
      <body className="min-h-screen bg-gray-900">
        <ErrorBoundary>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

