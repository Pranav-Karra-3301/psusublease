'use client';

import AuthForm from '@/components/auth/AuthForm';

export default function AuthPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Account Access</h1>
      <div className="max-w-md mx-auto">
        <AuthForm />
      </div>
    </div>
  );
} 