'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { useListings } from '@/hooks/useListings';
import CreateListingForm from '@/components/listings/CreateListingForm';
import { useAuthContext } from '@/components/auth/AuthProvider';

function EditListingContent() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
  const [listing, setListing] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { getListing } = useListings();

  // Check for authentication first
  useEffect(() => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push('/auth');
    }
  }, [user, router]);

  // Fetch the listing to edit
  useEffect(() => {
    if (!user) return; // Don't fetch if not authenticated
    
    let isMounted = true;
    
    async function fetchListing() {
      if (!isMounted) return;
      
      setIsLoading(true);
      
      try {
        const { data, error } = await getListing(id as string);
        
        if (!isMounted) return;
        
        if (error) {
          console.error('Error fetching listing:', error);
          if (isMounted) {
            setError('Could not load the listing. Please try again later.');
          }
          return;
        }
        
        if (!data) {
          if (isMounted) {
            setError('Listing not found.');
          }
          return;
        }
        
        // Check if the listing belongs to the current user
        if (data.user_id !== user.id) {
          if (isMounted) {
            setError('You do not have permission to edit this listing.');
          }
          return;
        }
        
        if (isMounted) {
          setListing(data);
        }
      } catch (err) {
        console.error('Error in fetchListing:', err);
        if (isMounted) {
          setError('An unexpected error occurred. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    fetchListing();
    
    return () => {
      isMounted = false;
    };
  }, [id, getListing, user]);

  // Show loading state
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

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card variant="glass" className="p-8">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Error</h1>
          <p className="text-text-secondary mb-6">{error}</p>
          <Link href="/listings">
            <Button variant="primary">Return to Listings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Show 404 if listing not found
  if (!listing) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href={`/listings/${id}`} className="flex items-center text-text-secondary hover:text-text-primary transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Listing
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-text-primary mb-8">Edit Listing</h1>
      
      {/* We'll re-use the CreateListingForm component with edit mode */}
      <div className="pb-16">
        <CreateListingForm initialData={listing} isEditMode={true} />
      </div>
    </div>
  );
}

export default function EditListingPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Loading edit form...</div>}>
      <EditListingContent />
    </Suspense>
  );
} 