'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditAgencyProfilePage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the actual profile page
    router.push('/agency/profile');
  }, [router]);
  
  return (
    <div className="container mx-auto px-4 py-16 mt-16 flex justify-center">
      <div className="animate-pulse">Redirecting...</div>
    </div>
  );
} 