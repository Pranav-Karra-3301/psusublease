'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAgencies } from '@/hooks/useAgencies';
import { useAuthContext } from '@/components/auth/AuthProvider';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { Agency, AgencyListingWithFloorPlans } from '@/types/Agency';
import Image from 'next/image';

export default function AgencyDashboardPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { fetchMyAgency, fetchAgencyListings } = useAgencies();
  const [loading, setLoading] = useState(true);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [listings, setListings] = useState<AgencyListingWithFloorPlans[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAgencyData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get the current user's agency
        const agencyData = await fetchMyAgency();
        if (!agencyData) {
          router.push('/agency/register');
          return;
        }
        
        setAgency(agencyData);
        
        // Fetch agency listings
        const listingsData = await fetchAgencyListings(agencyData.id);
        setListings(listingsData);
      } catch (err: any) {
        console.error('Error loading agency data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAgencyData();
  }, [fetchMyAgency, fetchAgencyListings, router]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 mt-16 flex justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 mt-16">
        <div className="max-w-3xl mx-auto text-center bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Error</h1>
          <p className="text-red-500 mb-6">{error}</p>
          <Button onClick={() => router.push('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="container mx-auto px-4 py-16 mt-16">
        <div className="max-w-3xl mx-auto text-center bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Agency Registration Required</h1>
          <p className="text-text-secondary mb-6">
            You need to register your property management agency before accessing the dashboard.
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
      <div className="max-w-6xl mx-auto">
        {/* Dashboard Header with Logo */}
        <div className="mb-8 pb-6 border-b border-border-light flex items-center">
          {agency.logo_url ? (
            <div className="relative h-16 w-16 mr-4 overflow-hidden">
              <Image 
                src={agency.logo_url} 
                alt={agency.name} 
                fill
                sizes="64px"
                className="object-contain rounded-lg border border-border-light"
                priority
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-lg bg-bg-secondary border border-border-light flex items-center justify-center mr-4">
              <span className="text-3xl font-bold text-text-secondary/50">
                {agency.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{agency.name} Dashboard</h1>
            <p className="text-text-secondary">
              Manage your properties and listings
            </p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
          <div className="md:w-1/3">
            <Card className="p-6 h-full">
              <div className="flex flex-col items-center mb-6">
                {agency.logo_url ? (
                  <div className="relative w-32 h-32 mb-4 overflow-hidden">
                    <Image 
                      src={agency.logo_url} 
                      alt={agency.name} 
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain rounded-lg border border-border-light"
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-bg-secondary border border-border-light flex items-center justify-center mb-4">
                    <span className="text-4xl font-bold text-text-secondary/50">
                      {agency.name.charAt(0)}
                    </span>
                  </div>
                )}
                <h1 className="text-2xl font-bold text-text-primary text-center">{agency.name}</h1>
                <p className="text-text-secondary text-center">
                  {agency.is_verified ? (
                    <span className="inline-flex items-center text-green-600">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                      </svg>
                      Verified Agency
                    </span>
                  ) : (
                    <span className="text-yellow-600">Verification Pending</span>
                  )}
                </p>
              </div>
              
              <div className="space-y-4 mt-6">
                <div>
                  <h3 className="text-sm text-text-secondary font-medium">Contact Information</h3>
                  <div className="mt-1">
                    <p className="text-text-primary">{agency.email}</p>
                    <p className="text-text-primary">{agency.phone}</p>
                    {agency.contact_person && (
                      <p className="text-text-primary">
                        <span className="font-medium">Contact:</span> {agency.contact_person}
                      </p>
                    )}
                  </div>
                </div>
                
                {agency.website && (
                  <div>
                    <h3 className="text-sm text-text-secondary font-medium">Website</h3>
                    <a 
                      href={agency.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      {agency.website.replace(/^https?:\/\/(www\.)?/, '')}
                    </a>
                  </div>
                )}
                
                {agency.google_maps_link && (
                  <div>
                    <h3 className="text-sm text-text-secondary font-medium">Google Maps</h3>
                    <a 
                      href={agency.google_maps_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      View on Google Maps
                    </a>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm text-text-secondary font-medium">Member Since</h3>
                  <p className="text-text-primary">{formatDate(agency.created_at)}</p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-border-light">
                <Link href="/agency/profile">
                  <Button variant="secondary" className="w-full">
                    Edit Agency Profile
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
          
          <div className="md:w-2/3">
            <Card className="p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-text-primary">Your Listings</h2>
                <Link href="/agency/create-listing">
                  <Button>
                    + Add New Listing
                  </Button>
                </Link>
              </div>
              
              {listings.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-border-light rounded-lg">
                  <p className="text-text-secondary mb-4">You don't have any active listings yet.</p>
                  <Link href="/agency/create-listing">
                    <Button>Create Your First Listing</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {listings.map((listing) => (
                    <div key={listing.id} className="border border-border-light rounded-lg p-4 hover:border-accent transition-all duration-200">
                      <div className="flex flex-col sm:flex-row justify-between">
                        <div className="flex">
                          {agency.logo_url && (
                            <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-border-light mr-3 hidden sm:block">
                              <Image
                                src={agency.logo_url}
                                alt={agency.name}
                                fill
                                className="object-contain"
                              />
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium text-text-primary">{listing.property_name}</h3>
                            <p className="text-text-secondary text-sm">{listing.address}</p>
                            
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-bg-secondary text-text-primary">
                                {listing.floor_plans?.length || 0} Floor Plans
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-bg-secondary text-text-primary">
                                {new Date(listing.start_date) <= new Date() && new Date(listing.end_date) >= new Date()
                                  ? 'Available Now'
                                  : new Date(listing.start_date) > new Date()
                                    ? `Available ${formatDate(listing.start_date)}`
                                    : 'Not Available'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex mt-3 sm:mt-0">
                          <Link href={`/agency-listings/${listing.id}`}>
                            <Button variant="secondary" size="sm" className="mr-2">
                              View
                            </Button>
                          </Link>
                          <Link href={`/agency/create-listing?edit=${listing.id}`}>
                            <Button variant="secondary" size="sm" className="mr-2">
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-bold text-text-primary mb-4">Quick Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/agency/create-listing">
                  <div className="border border-border-light rounded-lg p-4 hover:border-accent transition duration-200">
                    <h3 className="font-medium text-text-primary">Create Listing</h3>
                    <p className="text-text-secondary text-sm">Add a new property listing with floor plans</p>
                  </div>
                </Link>
                
                <Link href="/listings">
                  <div className="border border-border-light rounded-lg p-4 hover:border-accent transition duration-200">
                    <h3 className="font-medium text-text-primary">Browse All Listings</h3>
                    <p className="text-text-secondary text-sm">See what's available on the platform</p>
                  </div>
                </Link>
                
                <Link href="/agency/profile">
                  <div className="border border-border-light rounded-lg p-4 hover:border-accent transition duration-200">
                    <h3 className="font-medium text-text-primary">Update Profile</h3>
                    <p className="text-text-secondary text-sm">Update your agency information</p>
                  </div>
                </Link>
                
                <Link href="/requests">
                  <div className="border border-border-light rounded-lg p-4 hover:border-accent transition duration-200">
                    <h3 className="font-medium text-text-primary">View Lease Requests</h3>
                    <p className="text-text-secondary text-sm">Browse what students are looking for</p>
                  </div>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}