'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import supabase from '@/utils/supabase';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { formatCurrency, formatDate } from '@/utils/formatters';

// UI Components
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import FloorPlanCard from '@/components/agency/FloorPlanCard';
import { AgencyListingWithDetails } from '@/types/Agency';

export default function AgencyListingPage() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const { user } = useAuthContext();
  const [listing, setListing] = useState<AgencyListingWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [userIsOwner, setUserIsOwner] = useState(false);

  useEffect(() => {
    async function fetchListing() {
      try {
        setIsLoading(true);
        
        // Fetch the listing with joined agency data and floor plans
        const { data, error } = await supabase
          .from('agency_listings')
          .select(`
            *,
            agency:agencies(*),
            floor_plans(*)
          `)
          .eq('id', id as string)
          .single();
        
        if (error) {
          console.error("Error fetching listing:", error);
          setError("Failed to load listing");
          return;
        }

        if (!data) {
          setError("Listing not found");
          return;
        }

        // Set the listing data
        setListing(data as unknown as AgencyListingWithDetails);
        
        // Set default selected image
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        }
        
        // Check if current user is the owner of the listing
        if (user && data.agency && data.agency.user_id === user.id) {
          setUserIsOwner(true);
        }
      } catch (err) {
        console.error("Error:", err);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchListing();
  }, [id, user]);

  // Handle image selection
  const handleImageClick = (image: string) => {
    setSelectedImage(image);
  };

  // Toggle contact info visibility
  const toggleContactInfo = () => {
    setShowContactInfo(!showContactInfo);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-10 bg-bg-secondary rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="h-96 bg-bg-secondary rounded-lg mb-4"></div>
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 w-24 flex-shrink-0 bg-bg-secondary rounded-md"></div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-8 bg-bg-secondary rounded w-3/4"></div>
              <div className="h-6 bg-bg-secondary rounded w-1/2"></div>
              <div className="h-32 bg-bg-secondary rounded"></div>
              <div className="h-10 bg-bg-secondary rounded-lg"></div>
            </div>
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
          <Link href="/listings">
            <Button variant="primary">Back to Listings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // No listing state (should be caught by error state, but just in case)
  if (!listing) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card variant="glass" className="p-8 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Listing Not Found</h2>
          <p className="text-text-secondary mb-6">The listing you are looking for does not exist or has been removed.</p>
          <Link href="/listings">
            <Button variant="primary">Back to Listings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/listings" className="flex items-center text-text-secondary hover:text-text-primary transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Listings
        </Link>
      </div>

      {/* Listing header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{listing.property_name}</h1>
          <p className="text-text-secondary mt-1">{listing.address}</p>
        </div>
        
        {userIsOwner && (
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Link href={`/agency-listings/${id}/edit`}>
              <Button variant="secondary" className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Listing
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column: Images */}
        <div className="md:col-span-2">
          {/* Main image */}
          {selectedImage ? (
            <div className="relative h-80 sm:h-96 md:h-[500px] w-full overflow-hidden rounded-lg mb-4">
              <Image
                src={selectedImage}
                alt={listing.property_name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-80 sm:h-96 md:h-[500px] w-full bg-bg-secondary rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-16 h-16 text-text-tertiary">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Image thumbnails */}
          {listing.images && listing.images.length > 0 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {listing.images.map((image, index) => (
                <div
                  key={index}
                  className={`relative h-24 w-24 flex-shrink-0 rounded-md overflow-hidden cursor-pointer transition-all ${
                    selectedImage === image ? 'ring-2 ring-accent' : 'hover:opacity-80'
                  }`}
                  onClick={() => handleImageClick(image)}
                >
                  <Image
                    src={image}
                    alt={`Property view ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <Card variant="glass" className="p-6 mt-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Description</h2>
            <p className="text-text-secondary whitespace-pre-line">
              {listing.description || "No description provided."}
            </p>
          </Card>

          {/* Amenities & Utilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {/* Amenities */}
            <Card variant="glass" className="p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Amenities</h2>
              {listing.amenities && listing.amenities.length > 0 ? (
                <ul className="list-disc list-inside text-text-secondary">
                  {listing.amenities.map((amenity, index) => (
                    <li key={index} className="mb-2">{amenity}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-text-secondary">No amenities listed.</p>
              )}
            </Card>

            {/* Utilities */}
            <Card variant="glass" className="p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Utilities Included</h2>
              {listing.utilities_included && listing.utilities_included.length > 0 ? (
                <ul className="list-disc list-inside text-text-secondary">
                  {listing.utilities_included.map((utility, index) => (
                    <li key={index} className="mb-2">{utility}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-text-secondary">No utilities included.</p>
              )}
            </Card>
          </div>
        </div>

        {/* Right column: Details & Contact */}
        <div className="space-y-8">
          {/* Agency Info */}
          <Card variant="glass" className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Offered By</h2>
            <div className="flex items-center mb-4">
              {listing.agency && listing.agency.logo_url ? (
                <div className="relative h-16 w-16 rounded-lg overflow-hidden mr-4 border border-border-light">
                  <Image
                    src={listing.agency.logo_url}
                    alt={listing.agency.name}
                    fill
                    sizes="(max-width: 768px) 80px, 64px"
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="h-16 w-16 bg-bg-secondary rounded-lg flex items-center justify-center mr-4 border border-border-light">
                  <span className="text-2xl font-bold text-text-secondary/50">
                    {listing.agency?.name.charAt(0) || 'A'}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-text-primary">
                  {listing.agency ? listing.agency.name : "Agency"}
                </h3>
                {listing.agency && listing.agency.website && (
                  <a 
                    href={listing.agency.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:underline"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            </div>
            <Button
              variant="primary"
              className="w-full"
              onClick={toggleContactInfo}
            >
              {showContactInfo ? 'Hide Contact Info' : 'Show Contact Info'}
            </Button>
            
            {showContactInfo && (
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                {listing.contact_email && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-2 text-text-tertiary">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href={`mailto:${listing.contact_email}`} className="text-text-secondary hover:text-accent">
                      {listing.contact_email}
                    </a>
                  </div>
                )}
                {listing.contact_phone && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-2 text-text-tertiary">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href={`tel:${listing.contact_phone}`} className="text-text-secondary hover:text-accent">
                      {listing.contact_phone}
                    </a>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Lease Details */}
          <Card variant="glass" className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Lease Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Available From</span>
                <span className="font-medium text-text-primary">
                  {listing.start_date ? formatDate(new Date(listing.start_date)) : 'Not specified'}
                </span>
              </div>
              
              {listing.end_date && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Available Until</span>
                  <span className="font-medium text-text-primary">
                    {formatDate(new Date(listing.end_date))}
                  </span>
                </div>
              )}
              
              {listing.lease_terms && (
                <div className="pt-3 border-t border-border">
                  <p className="text-text-secondary whitespace-pre-line">
                    <span className="font-medium block mb-1">Lease Terms:</span>
                    {listing.lease_terms}
                  </p>
                </div>
              )}
              
              {listing.application_deadline && (
                <div className="flex justify-between pt-3 border-t border-border">
                  <span className="text-text-secondary">Application Deadline</span>
                  <span className="font-medium text-text-primary">
                    {formatDate(new Date(listing.application_deadline))}
                  </span>
                </div>
              )}
            </div>
            
            {listing.application_link && (
              <div className="mt-6">
                <a 
                  href={listing.application_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="accent" className="w-full">
                    Apply Now
                  </Button>
                </a>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Floor Plans Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-text-primary mb-6">Available Floor Plans</h2>
        
        {listing.floor_plans && listing.floor_plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listing.floor_plans.map((plan, index) => (
              <FloorPlanCard key={index} floorPlan={plan} />
            ))}
          </div>
        ) : (
          <Card variant="glass" className="p-8 text-center">
            <p className="text-text-secondary">No floor plans are currently available for this property.</p>
          </Card>
        )}
      </div>
    </div>
  );
} 