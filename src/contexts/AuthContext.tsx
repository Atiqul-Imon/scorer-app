'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isScorer: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // Start with false - don't block

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.getProfile();
      setUser(response.data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
  }, []);

  useEffect(() => {
    // Initialize auth state - completely synchronous, non-blocking
    // NO API CALLS on initial mount to prevent redirect loops
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          // DO NOT call refreshUser on mount - let pages handle it
          // This prevents API calls during initial page load/redirect
        } catch (error) {
          // Invalid JSON - clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      // Ignore errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - NO API CALLS

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



