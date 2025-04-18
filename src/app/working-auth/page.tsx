'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WorkingAuthPage() {
  const router = useRouter();
  
  useEffect(() => {
    // This immediately redirects to the signin page as a test
    setTimeout(() => {
      router.push('/auth/signin');
    }, 2000);
  }, [router]);
  
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      <p className="mb-4">Redirecting to sign in page in 2 seconds...</p>
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
    </div>
  );
} 