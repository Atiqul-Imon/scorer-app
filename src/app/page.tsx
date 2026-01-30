'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Immediate redirect - no delays, no state checks
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // Use router.replace for client-side navigation
    if (token) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  // Return minimal content - redirect happens immediately
  return null;
}



