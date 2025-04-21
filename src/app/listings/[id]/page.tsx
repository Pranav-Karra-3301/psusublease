'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { notFound } from 'next/navigation';
import ListingDetail from '@/components/listings/ListingDetail';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useListings } from '@/hooks/useListings';
import { useAuthContext } from '@/components/auth/AuthProvider';
import supabase from '@/utils/supabase';

// Mock data for fallback
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
    roommatesStaying: 0,
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
    roommatesStaying: 0,
    genderPreference: 'No Preference',
    images: ['/placeholder.jpg', '/placeholder.jpg'],
    contactInfo: {
      email: 'grad@psu.edu',
      phone: '',
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
    roommatesStaying: 2,
    genderPreference: 'Female',
    images: ['/placeholder.jpg'],
    contactInfo: {
      email: '',
      phone: '814-555-5678',
      preferredContact: 'Phone'
    }
  }
];

function ListingPageContent() {
  const params = useParams();
  const { id } = params;
  const { user } = useAuthContext();
  const [isOwner, setIsOwner] = useState(false);
  const [listing, setListing] = useState<{
    id: string;
    apartment: string;
    location: string;
    price: number;
    startDate: string;
    endDate: string;
    bedrooms: number;
    bathrooms: number;
    description: string;
    amenities: string[];
    hasRoommates: boolean;
    roommatesStaying: number | boolean;
    genderPreference: string;
    images: string[];
    contactInfo: { email?: string; phone?: string; preferredContact?: string };
    createdAt: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getListing } = useListings();
  const router = useRouter();
  
  // Fetch the real listing data from Supabase
  useEffect(() => {
    let isMounted = true;
    
    async function fetchListing() {
      if (!isMounted) return;
      
      setIsLoading(true);
      
      try {
        const { data, error } = await getListing(id as string);
        
        if (!isMounted) return;
        
        if (error) {
          console.error('Error fetching listing:', error);
          setListing(null);
          setIsLoading(false);
          return;
        }
        
        // Redirect to agency-listings page if this is an agency listing
        if (data && data.is_agency_listing) {
          router.replace(`/agency-listings/${id}`);
          return;
        }
        
        if (data) {
          // Check if the current user is the owner
          if (user && data.user_id === user.id) {
            setIsOwner(true);
          }
          
          // Fetch owner profile for contact info
          let contactInfo = {
            email: 'contact@psusublease.com', // Default fallback
            phone: '', 
            preferredContact: 'Email'
          };
          
          if (data.user_id) {
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('first_name, last_name, email, phone, preferred_contact')
              .eq('id', data.user_id)
              .single();
            
            if (!userError && userData) {
              contactInfo = {
                email: userData.email || contactInfo.email,
                phone: userData.phone || contactInfo.phone,
                preferredContact: userData.preferred_contact || contactInfo.preferredContact
              };
            }
          }
          
          // Transform the data to match the ListingDetail component's expected format
          const transformedListing = {
            id: data.id,
            apartment: data.apartment_id ? 
              (data.apartments?.name || 'Unknown Apartment') : 
              (data.custom_apartment || 'Custom Apartment'),
            location: data.apartments?.address || 'State College, PA',
            price: data.offer_price || 0,
            startDate: data.start_date || '',
            endDate: data.end_date || '',
            bedrooms: data.bedrooms || 0,
            bathrooms: data.bathrooms || 0,
            description: data.description || '',
            amenities: data.amenities || [],
            hasRoommates: Boolean(data.has_roommates),
            roommatesStaying: data.roommates_staying !== null ? data.roommates_staying : false,
            genderPreference: data.gender_preference || 'No Preference',
            images: data.images && data.images.length > 0 ? 
              data.images : ['/apt_defaults/default.png'],
            contactInfo: contactInfo,
            createdAt: data.created_at || ''
          };
          
          if (isMounted) {
            setListing(transformedListing);
          }
        } else if (isMounted) {
          setListing(null);
        }
      } catch (err) {
        console.error('Error in fetchListing:', err);
        if (isMounted) {
          setListing(null);
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
  }, [id, getListing, user, router]);
  
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
      <div className="mb-6 flex justify-between items-center">
        <Link href="/listings" className="flex items-center text-text-secondary hover:text-text-primary transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to All Listings
        </Link>
        
        {isOwner && (
          <Link href={`/listings/${id}/edit`}>
            <Button variant="secondary">
              Edit Listing
            </Button>
          </Link>
        )}
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
        createdAt={listing.createdAt}
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

export default function ListingPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Loading listing details...</div>}>
      <ListingPageContent />
    </Suspense>
  );
} 