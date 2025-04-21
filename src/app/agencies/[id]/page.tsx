'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import supabase from '@/utils/supabase';
import { useAuthContext } from '@/components/auth/AuthProvider';

// UI Components
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ListingCard from '@/components/listings/ListingCard';
import { AgencyWithDetails } from '@/types/Agency';

export default function AgencyPage() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const { user } = useAuthContext();
  const [agency, setAgency] = useState<AgencyWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    async function fetchAgency() {
      try {
        setIsLoading(true);
        
        // Fetch the agency with joined listings
        const { data, error } = await supabase
          .from('agencies')
          .select(`
            *,
            agency_listings(*)
          `)
          .eq('id', id as string)
          .single();
        
        if (error) {
          console.error("Error fetching agency:", error);
          setError("Failed to load agency information");
          return;
        }

        if (!data) {
          setError("Agency not found");
          return;
        }

        setAgency(data as unknown as AgencyWithDetails);
        
        // Check if current user is the owner of the agency
        if (user && data.user_id === user.id) {
          setIsOwner(true);
        }
      } catch (err) {
        console.error("Error:", err);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAgency();
  }, [id, user]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="flex items-center mb-8">
            <div className="h-24 w-24 bg-bg-secondary rounded-full mr-6"></div>
            <div>
              <div className="h-8 w-64 bg-bg-secondary rounded mb-2"></div>
              <div className="h-4 w-40 bg-bg-secondary rounded"></div>
            </div>
          </div>
          <div className="h-40 bg-bg-secondary rounded mb-8"></div>
          <div className="h-10 bg-bg-secondary rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
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
        <Card variant="glass" className="p-8 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Error</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <Link href="/agencies">
            <Button variant="primary">View All Agencies</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // No agency state (should be caught by error state, but just in case)
  if (!agency) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card variant="glass" className="p-8 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Agency Not Found</h2>
          <p className="text-text-secondary mb-6">The agency you are looking for does not exist or has been removed.</p>
          <Link href="/agencies">
            <Button variant="primary">View All Agencies</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/agencies" className="flex items-center text-text-secondary hover:text-text-primary transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Agencies
        </Link>
      </div>

      {/* Agency header */}
      <div className="flex flex-col md:flex-row items-start md:items-center mb-8">
        {/* Logo */}
        <div className="mr-6 mb-4 md:mb-0">
          {agency.logo_url ? (
            <div className="relative h-24 w-24 rounded-full overflow-hidden border border-border">
              <Image
                src={agency.logo_url}
                alt={agency.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-24 w-24 rounded-full bg-bg-secondary flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12 text-text-tertiary">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Agency name and info */}
        <div className="flex-grow">
          <h1 className="text-3xl font-bold text-text-primary">{agency.name}</h1>
          <p className="text-text-secondary">{agency.location || "Location not specified"}</p>
          
          {agency.website && (
            <a 
              href={agency.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline mt-2 inline-block"
            >
              Visit Website
            </a>
          )}
        </div>
        
        {/* Admin actions */}
        {isOwner && (
          <div className="mt-4 md:mt-0">
            <Link href={`/agencies/${id}/edit`}>
              <Button variant="secondary" className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Agency
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Agency details card */}
      <Card variant="glass" className="p-6 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-3">About {agency.name}</h2>
            <p className="text-text-secondary whitespace-pre-line">
              {agency.description || "No description provided."}
            </p>
          </div>
          
          {/* Contact information */}
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-3">Contact Information</h2>
            <div className="space-y-3">
              {agency.email && (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-3 text-text-tertiary">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${agency.email}`} className="text-text-secondary hover:text-accent">
                    {agency.email}
                  </a>
                </div>
              )}
              {agency.phone && (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-3 text-text-tertiary">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${agency.phone}`} className="text-text-secondary hover:text-accent">
                    {agency.phone}
                  </a>
                </div>
              )}
              {agency.address && (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-3 text-text-tertiary">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-text-secondary">{agency.address}</span>
                </div>
              )}
              {agency.contact_person && (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-3 text-text-tertiary">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-text-secondary">{agency.contact_person}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Listings section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Available Listings</h2>
          {isOwner && (
            <Link href="/agency-listings/new">
              <Button variant="primary" className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Listing
              </Button>
            </Link>
          )}
        </div>
        
        {agency.agency_listings && agency.agency_listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agency.agency_listings.map((listing) => (
              <ListingCard 
                key={listing.id}
                id={listing.id}
                title={listing.property_name}
                location={listing.address}
                price={listing.min_price}
                imageUrl={listing.images && listing.images.length > 0 ? listing.images[0] : undefined}
                beds={listing.bedrooms}
                baths={listing.bathrooms}
                startDate={listing.start_date}
                endDate={listing.end_date}
                href={`/agency-listings/${listing.id}`}
              />
            ))}
          </div>
        ) : (
          <Card variant="glass" className="p-8 text-center">
            <p className="text-text-secondary mb-6">This agency has no active listings at the moment.</p>
            {isOwner && (
              <Link href="/agency-listings/new">
                <Button variant="primary">Add Your First Listing</Button>
              </Link>
            )}
          </Card>
        )}
      </div>
    </div>
  );
} 