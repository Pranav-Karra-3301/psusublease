'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import supabase from '@/utils/supabase';
import { useAuthContext } from '@/components/auth/AuthProvider';

// UI Components
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import AgencyCard from '@/components/agency/AgencyCard';
import { Agency } from '@/types/Agency';

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuthContext();

  useEffect(() => {
    async function fetchAgencies() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('agencies')
          .select('*')
          .order('name');

        if (error) {
          console.error('Error fetching agencies:', error);
          setError('Failed to load agencies. Please try again later.');
          return;
        }

        setAgencies(data || []);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAgencies();
  }, []);

  const handleRegisterClick = () => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push('/login?redirect=/agencies/register');
    } else {
      // Redirect to register page if authenticated
      router.push('/agencies/register');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Property Management Agencies</h1>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-bg-secondary rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Property Management Agencies</h1>
        <Card variant="glass" className="p-8 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Error</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Property Management Agencies</h1>
          <p className="text-text-secondary">
            Find reliable property management agencies for your housing needs.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button variant="primary" onClick={handleRegisterClick} className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Register Your Agency
          </Button>
        </div>
      </div>

      {agencies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agencies.map((agency) => (
            <AgencyCard
              key={agency.id}
              id={agency.id}
              name={agency.name}
              location={agency.location}
              logoUrl={agency.logo_url}
              description={agency.description || ''}
            />
          ))}
        </div>
      ) : (
        <Card variant="glass" className="p-8 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">No Agencies Found</h2>
          <p className="text-text-secondary mb-6">
            There are currently no registered property management agencies.
          </p>
          <Button variant="primary" onClick={handleRegisterClick}>
            Be the First to Register
          </Button>
        </Card>
      )}
    </div>
  );
} 