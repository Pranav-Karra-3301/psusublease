'use client';

import AuthForm from '@/components/auth/AuthForm';
import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') as 'signin' | 'signup' | null;
  const redirect = searchParams.get('redirect');

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Account Access</h1>
      <div className="max-w-md mx-auto">
        <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
          <AuthForm initialMode={mode || 'signin'} redirect={redirect} />
        </Suspense>
      </div>
    </div>
  );
} 