'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import AuthForm from '@/components/auth/AuthForm';

// Client component that uses useSearchParams
function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  useEffect(() => {
    // Only redirect if we came here directly
    // If we already have a redirect parameter, we're coming from middleware
    if (!redirect) {
      router.replace('/auth?mode=signin');
    }
  }, [router, redirect]);

  // If we have a redirect parameter, show the AuthForm directly
  if (redirect) {
    return <AuthForm initialMode="signin" redirect={redirect} />;
  }

  return (
    <div className="text-center">
      <div className="loading-animation inline-block h-8 w-8 rounded-full"></div>
      <p className="mt-4">Redirecting to sign in...</p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <SignInContent />
      </Suspense>
    </div>
  );
} 