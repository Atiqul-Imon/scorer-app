'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import { Trophy, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function PublicHeader() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/register');
    }
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <nav className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <Trophy className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg lg:text-xl font-bold text-gray-100">Scorenews Scorer</span>
              <span className="text-xs text-gray-400 hidden sm:block">Cricket Match Scoring</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/#features"
              className="text-gray-300 hover:text-gray-100 transition-colors text-sm font-medium"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="text-gray-300 hover:text-gray-100 transition-colors text-sm font-medium"
            >
              How It Works
            </Link>
            <Link
              href="/#instructions"
              className="text-gray-300 hover:text-gray-100 transition-colors text-sm font-medium"
            >
              Instructions
            </Link>
            {isAuthenticated ? (
              <Button variant="primary" onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Button variant="primary" onClick={handleGetStarted}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col gap-4">
              <Link
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-300 hover:text-gray-100 transition-colors text-sm font-medium"
              >
                Features
              </Link>
              <Link
                href="/#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-300 hover:text-gray-100 transition-colors text-sm font-medium"
              >
                How It Works
              </Link>
              <Link
                href="/#instructions"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-300 hover:text-gray-100 transition-colors text-sm font-medium"
              >
                Instructions
              </Link>
              <div className="pt-4 border-t border-gray-800 flex flex-col gap-3">
                {isAuthenticated ? (
                  <Button variant="primary" fullWidth onClick={() => {
                    router.push('/dashboard');
                    setMobileMenuOpen(false);
                  }}>
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" fullWidth>
                        Sign In
                      </Button>
                    </Link>
                    <Button variant="primary" fullWidth onClick={() => {
                      handleGetStarted();
                      setMobileMenuOpen(false);
                    }}>
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

