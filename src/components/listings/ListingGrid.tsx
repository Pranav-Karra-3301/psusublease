'use client';

import ListingCard from './ListingCard';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface Listing {
  id: string;
  apartment: string;
  location: string;
  price: number;
  startDate: string;
  endDate: string;
  bedrooms: number;
  bathrooms: number;
  image?: string;
  isAgencyListing: boolean;
  is_facebook_listing: boolean;
}

interface ListingGridProps {
  listings: Listing[];
  isLoading?: boolean;
}

export default function ListingGrid({ listings, isLoading = false }: ListingGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div 
            key={index} 
            className="loading-animation bg-white border border-gray-200 rounded-lg h-96"
          ></div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-16 h-16 text-gray-400 mb-4">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
        <p className="text-gray-600 text-center max-w-md mb-6">
          There are no subleases available at the moment. Be the first to create a listing!
        </p>
        <Link href="/create">
          <Button>Post a Listing</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          id={listing.id}
          apartment={listing.apartment}
          location={listing.location}
          price={listing.price}
          startDate={listing.startDate}
          endDate={listing.endDate}
          bedrooms={listing.bedrooms}
          bathrooms={listing.bathrooms}
          image={listing.image}
          isAgencyListing={listing.isAgencyListing}
          isFacebookListing={listing.is_facebook_listing}
        />
      ))}
    </div>
  );
} 