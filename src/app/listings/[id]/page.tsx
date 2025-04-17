'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import ListingDetail from '@/components/listings/ListingDetail';
import Button from '@/components/ui/Button';
import Link from 'next/link';

// Mock data (will be replaced with Supabase fetch)
const mockListings = [
  {
    id: 'BLUE-723',
    apartment: 'The Rise',
    location: 'Downtown State College',
    price: 750,
    startDate: '2023-08-01',
    endDate: '2024-07-31',
    bedrooms: 2,
    bathrooms: 2,
    description: 'Spacious 2-bedroom apartment in the heart of downtown State College. Walking distance to campus and all amenities. Fully furnished with modern appliances.',
    amenities: ['In-unit Washer/Dryer', 'Fully Furnished', 'Gym Access', 'Pool', 'High-Speed Internet', 'Parking Included'],
    hasRoommates: true,
    roommatesStaying: false,
    genderPreference: 'No Preference',
    images: ['/placeholder.jpg', '/placeholder.jpg', '/placeholder.jpg'],
    contactInfo: {
      email: 'student@psu.edu',
      phone: '814-555-1234',
      preferredContact: 'Email'
    }
  },
  {
    id: 'LION-491',
    apartment: 'The Metropolitan',
    location: 'Downtown State College',
    price: 850,
    startDate: '2023-08-01',
    endDate: '2024-07-31',
    bedrooms: 1,
    bathrooms: 1,
    description: 'Modern 1-bedroom apartment with amazing views of downtown. Luxury finishes throughout.',
    amenities: ['In-unit Washer/Dryer', 'Fully Furnished', 'Gym Access', 'Rooftop Deck'],
    hasRoommates: false,
    images: ['/placeholder.jpg', '/placeholder.jpg'],
    contactInfo: {
      email: 'grad@psu.edu',
      preferredContact: 'Email'
    }
  },
  {
    id: 'NITT-382',
    apartment: 'The Legacy',
    location: 'South State College',
    price: 700,
    startDate: '2023-08-01',
    endDate: '2024-07-31',
    bedrooms: 3,
    bathrooms: 2,
    description: 'Affordable 3-bedroom apartment perfect for students. Recently renovated with new appliances.',
    amenities: ['Fully Furnished', 'Free Parking', 'Bus Route'],
    hasRoommates: true,
    roommatesStaying: true,
    genderPreference: 'Female',
    images: ['/placeholder.jpg'],
    contactInfo: {
      phone: '814-555-5678',
      preferredContact: 'Phone'
    }
  }
];

export default function ListingPage() {
  const params = useParams();
  const { id } = params;
  const [listing, setListing] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate fetching data
  useEffect(() => {
    setIsLoading(true);
    
    // Fetch the listing data (mocked for now)
    setTimeout(() => {
      const found = mockListings.find(listing => listing.id === id);
      setListing(found || null);
      setIsLoading(false);
    }, 1000);
  }, [id]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-[400px] rounded-lg bg-bg-secondary"></div>
          <div className="h-48 rounded-lg bg-bg-secondary"></div>
          <div className="h-32 rounded-lg bg-bg-secondary"></div>
        </div>
      </div>
    );
  }
  
  // Show 404 if listing not found
  if (!listing) {
    return notFound();
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/listings" className="flex items-center text-text-secondary hover:text-text-primary transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to All Listings
        </Link>
      </div>
      
      <ListingDetail
        id={listing.id}
        apartment={listing.apartment}
        location={listing.location}
        price={listing.price}
        startDate={listing.startDate}
        endDate={listing.endDate}
        bedrooms={listing.bedrooms}
        bathrooms={listing.bathrooms}
        description={listing.description}
        amenities={listing.amenities}
        hasRoommates={listing.hasRoommates}
        roommatesStaying={listing.roommatesStaying}
        genderPreference={listing.genderPreference}
        images={listing.images}
        contactInfo={listing.contactInfo}
      />
      
      <div className="mt-12 text-center">
        <h3 className="text-xl font-semibold text-text-primary mb-4">Looking for something else?</h3>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/listings">
            <Button size="lg">Browse More Listings</Button>
          </Link>
          <Link href="/create">
            <Button variant="secondary" size="lg">Post Your Own Sublease</Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 