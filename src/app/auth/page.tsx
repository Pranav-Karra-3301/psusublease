'use client';

import AuthForm from '@/components/auth/AuthForm';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Client component that uses useSearchParams
function AuthContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') as 'signin' | 'signup' | null;
  const redirect = searchParams.get('redirect');

  return (
    <AuthForm initialMode={mode || 'signin'} redirect={redirect} />
  );
}

export default function AuthPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Account Access</h1>
      <div className="max-w-md mx-auto">
        <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
          <AuthContent />
        </Suspense>
      </div>
    </div>
  );
} 