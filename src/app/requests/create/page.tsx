'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CreateRequestForm from '@/components/requests/CreateRequestForm';
import { useAuthContext } from '@/components/auth/AuthProvider';

export default function CreateRequestPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthContext();
  
  // Check authentication
  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login if not authenticated
      router.push('/auth');
    }
  }, [user, isLoading, router]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 w-1/3 rounded-lg bg-bg-secondary"></div>
          <div className="h-[500px] rounded-lg bg-bg-secondary"></div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/requests" className="flex items-center text-text-secondary hover:text-text-primary transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to All Requests
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-text-primary mb-8">Post a Sublease Request</h1>
      
      <div className="pb-16">
        <CreateRequestForm />
      </div>
    </div>
  );
} 