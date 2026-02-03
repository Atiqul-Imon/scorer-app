'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isScorer: boolean;
  refreshUser: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start with true to verify token on mount

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.getProfile();
      setUser(response.data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return true; // Success
    } catch (error: any) {
      if (error?.response?.status === 401) {
        setUser(null);
        if (typeof window !== 'undefined') {
          // Only clear storage, don't redirect (let the page handle it)
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      return false; // Failed
    }
  }, []);

  useEffect(() => {
    // Initialize auth state and verify token
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            // Set user immediately for optimistic UI
            setUser(parsedUser);
            
            // Verify token is still valid by calling API
            const isValid = await refreshUser();
            if (!isValid) {
              // Token invalid, user already cleared by refreshUser
              setUser(null);
            }
          } catch (error) {
            // Invalid JSON - clear it
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } else {
          // No token or user saved
          setUser(null);
        }
      } catch (error) {
        // Ignore errors, just clear state
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const login = async (emailOrPhone: string, password: string) => {
    try {
      const response = await api.login({ emailOrPhone, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const isAuthenticated = !!user;
  const isScorer = user?.role === 'scorer' || user?.scorerProfile?.isScorer === true;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated,
        isScorer,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}



