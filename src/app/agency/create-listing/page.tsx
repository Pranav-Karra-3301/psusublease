'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAgencies } from '@/hooks/useAgencies';
import CreateAgencyListingForm from '@/components/agency/CreateAgencyListingForm';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function CreateAgencyListingPage() {
  const router = useRouter();
  const { fetchMyAgency } = useAgencies();
  const [loading, setLoading] = useState(true);
  const [hasAgency, setHasAgency] = useState(false);

  useEffect(() => {
    const checkAgencyStatus = async () => {
      setLoading(true);
      const agency = await fetchMyAgency();
      setHasAgency(!!agency);
      setLoading(false);
    };

    checkAgencyStatus();
  }, [fetchMyAgency]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 mt-16 flex justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!hasAgency) {
    return (
      <div className="container mx-auto px-4 py-16 mt-16">
        <div className="max-w-3xl mx-auto text-center bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Agency Registration Required</h1>
          <p className="text-text-secondary mb-6">
            You need to register your property management agency before creating property listings.
          </p>
          <Link href="/agency/register">
            <Button size="lg">Register Your Agency</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 mt-16">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Create Official Property Listing</h1>
          <p className="text-text-secondary max-w-3xl mx-auto">
            List your properties to reach Penn State students looking for housing. Define your floor plans, amenities, and lease terms.
          </p>
        </div>
        
        <CreateAgencyListingForm />
      </div>
    </div>
  );
} 