'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  useEffect(() => {
    // Redirect to the auth page with signin mode and preserve any redirect parameter
    const redirectParam = redirect ? `&redirect=${redirect}` : '';
    router.replace(`/auth?mode=signin${redirectParam}`);
  }, [router, redirect]);

  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <div className="loading-animation inline-block h-8 w-8 rounded-full"></div>
      <p className="mt-4">Redirecting to sign in...</p>
    </div>
  );
} 