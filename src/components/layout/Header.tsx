'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ArrowLeft, Bell, User, LogOut, Plus, Search } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  actions?: React.ReactNode;
  onBack?: () => void;
}

export default function Header({
  title,
  subtitle,
  showBack = false,
  actions,
  onBack,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 safe-top shadow-sm">
        <div className="container-mobile">
          {/* Main Header */}
          <div className="flex items-center justify-between py-3">
            {/* Left Section */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {showBack && (
                <button
                  onClick={handleBack}
                  className="p-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors touch-target"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex-1 min-w-0">
                {title && (
                  <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-600 truncate">{subtitle}</p>
                )}
                {!title && !subtitle && (
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">Scorenews Scorer</h1>
                    <p className="text-xs text-gray-500">
                      {user?.scorerProfile?.scorerId || 'Scorer App'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-2">
              {actions}
              
              {/* Quick Create Match Button - Show on mobile too */}
              {pathname !== '/matches/create' && (
                <Link href="/matches/create">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex items-center gap-1.5 touch-target"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">New</span>
                  </Button>
                </Link>
              )}

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors touch-target"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="font-semibold text-gray-900 text-sm">{user?.name}</p>
                        <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                        {user?.scorerProfile && (
                          <div className="mt-2 flex items-center gap-2">
                            <Badge
                              variant={
                                user.scorerProfile.verificationStatus === 'verified'
                                  ? 'success'
                                  : user.scorerProfile.verificationStatus === 'pending'
                                  ? 'info'
                                  : 'default'
                              }
                            >
                              {user.scorerProfile.verificationStatus}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setShowMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Navigation Tabs (for main pages) */}
          {(pathname === '/dashboard' || pathname === '/matches' || pathname === '/profile') && (
            <div className="flex items-center gap-1 border-t border-gray-100 pt-2 pb-1 overflow-x-auto hide-scrollbar">
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors touch-target ${
                  isActive('/dashboard')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/matches"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors touch-target ${
                  isActive('/matches')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Matches
              </Link>
              <Link
                href="/profile"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors touch-target ${
                  isActive('/profile')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Profile
              </Link>
            </div>
          )}
        </div>
      </header>
    </>
  );
}

