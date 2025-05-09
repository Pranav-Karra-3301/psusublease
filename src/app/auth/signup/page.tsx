'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// Client component that uses useSearchParams
function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  useEffect(() => {
    // Redirect to the auth page with signup mode and preserve any redirect parameter
    const redirectParam = redirect ? `&redirect=${redirect}` : '';
    router.replace(`/auth?mode=signup${redirectParam}`);
  }, [router, redirect]);

  return (
    <div className="text-center">
      <div className="loading-animation inline-block h-8 w-8 rounded-full"></div>
      <p className="mt-4">Redirecting to sign up...</p>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <SignUpContent />
      </Suspense>
    </div>
  );
} 