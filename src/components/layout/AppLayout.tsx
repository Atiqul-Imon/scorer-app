'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from './Header';
import BottomNav from './BottomNav';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  headerActions?: ReactNode;
  onBack?: () => void;
  requireAuth?: boolean;
}

export default function AppLayout({
  children,
  title,
  subtitle,
  showBack = false,
  headerActions,
  onBack,
  requireAuth = true,
}: AppLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (requireAuth && !authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, requireAuth, router]);

  if (requireAuth && (authLoading || !isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-20 lg:pb-4 safe-bottom">
      <Header
        title={title}
        subtitle={subtitle}
        showBack={showBack}
        actions={headerActions}
        onBack={onBack}
      />
      <main className="w-full mx-auto py-4 lg:py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">{children}</main>
      <BottomNav />
    </div>
  );
}




