'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, TrendingUp, Plus, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: Calendar,
      exact: true,
    },
    {
      href: '/matches',
      label: 'Matches',
      icon: TrendingUp,
      exact: false,
    },
    {
      href: '/matches/create',
      label: 'Create',
      icon: Plus,
      exact: false,
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: Award,
      exact: false,
    },
  ];

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  // Don't show on login/register pages
  if (pathname === '/login' || pathname === '/register' || pathname === '/') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 safe-bottom z-40 shadow-lg lg:hidden">
      <div className="container-mobile">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors touch-target min-w-[60px]',
                  active
                    ? 'text-primary-400'
                    : 'text-gray-400 hover:text-gray-200'
                )}
              >
                <Icon className={cn('w-5 h-5', active && 'text-primary-600')} />
                <span className={cn('text-xs font-medium', active && 'text-primary-600 font-semibold')}>
                  {item.label}
                </span>
                {active && (
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary-600 rounded-t-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

