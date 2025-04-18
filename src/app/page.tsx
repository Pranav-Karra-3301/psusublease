'use client';

import { useState, useEffect } from 'react';
import { useListings } from '@/hooks/useListings';
import { useSubleaseRequests } from '@/hooks/useSubleaseRequests';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

// Simple wrapper component with hover animation
const AnimatedContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="h-full w-full hover-lift">{children}</div>;
};

export default function Home() {
  const [listings, setListings] = useState<{ id: string; [key: string]: any }[]>([]);
  const [requests, setRequests] = useState<{ id: string; [key: string]: any }[]>([]);
  const [loading, setLoading] = useState(true);
  const { getListings } = useListings();
  const { getRequests } = useSubleaseRequests();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch actual current listings
        console.log('Fetching listings...');
        const { data: fetchedListings, error: listingsError } = await getListings();
        console.log('Listings fetched:', fetchedListings, 'Error:', listingsError);
        
        if (fetchedListings) {
          setListings(fetchedListings.slice(0, 3)); // Only get top 3
        }
        
        // Fetch actual current requests
        console.log('Fetching requests...');
        const { data: fetchedRequests, error: requestsError } = await getRequests();
        console.log('Requests fetched:', fetchedRequests, 'Error:', requestsError);
        
        if (fetchedRequests) {
          setRequests(fetchedRequests.slice(0, 3)); // Only get top 3
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getListings, getRequests]);

  return (
    <div className="flex-1 bg-white">
      {/* Hero section - clean, minimalist design inspired by Outlier */}
      <section className="py-24 md:py-36 border-b border-border-light bg-bg-secondary">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-16">
            {/* Left: Text and CTA */}
            <div className="max-w-3xl flex-1">
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
                Find Your Perfect <br/><span className="text-primary">PSU Sublease</span>
              </h1>
              <p className="text-xl text-gray-700 mb-10 max-w-2xl leading-relaxed">
                Connect directly with Penn State students to find or post subleases without the middleman.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/listings">
                  <Button size="lg" className="py-4 px-8 rounded-md border border-transparent shadow-sm">
                    Browse Listings
                  </Button>
                </Link>
                <Link href="/create">
                  <Button size="lg" variant="secondary" className="py-4 px-8 rounded-md border border-gray-200 shadow-sm">
                    Post Sublease
                  </Button>
                </Link>
              </div>
            </div>
            {/* Right: Preview Image */}
            <div className="flex-1 w-full md:w-auto flex items-center justify-center">
              <Image
                src="/preview.png"
                alt="Preview"
                width={600}
                height={400}
                className="w-full h-auto object-cover rounded-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer Banner */}
      <div className="bg-primary/5 border-y border-primary/10 py-4">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <p className="text-gray-700">
            <span className="font-medium">PSU Subleases is an aggregator only.</span> We do not process or handle any financial transactions between users.
          </p>
        </div>
      </div>

      {/* Featured images section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <h2 className="text-2xl font-semibold text-center mb-10 text-gray-900">
            Connect with the PSU Community
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedContainer>
              <div className="rounded-lg overflow-hidden border border-border-light shadow-sm bg-white flex items-center justify-center min-h-[300px]">
                <img 
                  src="/2.png" 
                  alt="PSU Campus"
                  className="w-full h-auto object-cover"
                  style={{ display: 'block' }}
                />
              </div>
            </AnimatedContainer>
            <AnimatedContainer>
              <div className="rounded-lg overflow-hidden border border-border-light shadow-sm bg-white flex items-center justify-center min-h-[300px]">
                <img 
                  src="/3.png" 
                  alt="Student Housing"
                  className="w-full h-auto object-cover"
                  style={{ display: 'block' }}
                />
              </div>
            </AnimatedContainer>
            <AnimatedContainer>
              <div className="rounded-lg overflow-hidden border border-border-light shadow-sm bg-white flex items-center justify-center min-h-[300px]">
                <img 
                  src="/4.png" 
                  alt="College Life"
                  className="w-full h-auto object-cover"
                  style={{ display: 'block' }}
                />
              </div>
            </AnimatedContainer>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-bg-secondary border-t border-border-light">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold mb-4">How PSU Subleases Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform connects Penn State students looking for housing with those who have spaces to sublease.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-3">Create a Listing</h3>
              <p className="text-gray-600">Post your apartment or room for sublease with photos and details.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-3">Find Housing</h3>
              <p className="text-gray-600">Browse available subleases or post your specific housing requirements.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-3">Connect Directly</h3>
              <p className="text-gray-600">Message potential subleasers or tenants to arrange viewings and negotiate terms.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Current Listings Section */}
      <section className="py-24 bg-white border-t border-border-light">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900">
              Current Listings
            </h2>
            <Link href="/listings" className="text-primary hover:text-secondary font-medium flex items-center">
              View all listings
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="loading-animation bg-white border border-border-light rounded-lg h-72"></div>
              ))}
            </div>
          ) : listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {listings.map((listing) => (
                <AnimatedContainer key={listing.id || `listing-${Math.random()}`}>
                  <Card padding="none" className="overflow-hidden">
                    {listing.images && listing.images.length > 0 ? (
                      <div className="h-52 relative">
                        <div className="absolute top-0 right-0 bg-primary text-white text-xs px-2 py-1 rounded-bl m-2 z-10">
                          Available
                        </div>
                        <Image 
                          src={listing.images[0]} 
                          alt={listing.custom_apartment || 'Apartment Image'}
                          width={400}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-52 bg-gray-100 flex items-center justify-center border-b border-border-light">
                        <span className="text-gray-400">No image available</span>
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {listing.custom_apartment || 'Apartment Sublease'}
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm mb-3">
                        <span>{listing.bedrooms} bed</span>
                        <span className="mx-1">•</span>
                        <span>{listing.bathrooms} bath</span>
                        {listing.area_preference && (
                          <>
                            <span className="mx-1">•</span>
                            <span>{listing.area_preference}</span>
                          </>
                        )}
                      </div>
                      <div className="text-primary font-semibold mb-4">${listing.offer_price}/mo</div>
                      <Link href={`/listings/${listing.id}`}>
                        <Button variant="primary" fullWidth className="text-sm">View Details</Button>
                      </Link>
                    </div>
                  </Card>
                </AnimatedContainer>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12 bg-white border-primary/10">
              <p className="text-gray-600 mb-4">No listings available at the moment.</p>
              <p className="text-gray-500 mb-6">Be the first to create a listing and find a subleaser!</p>
              <Link href="/create" className="inline-block">
                <Button>Post a Listing</Button>
              </Link>
            </Card>
          )}
        </div>
      </section>

      {/* Sublease Requests Section */}
      <section className="py-24 bg-bg-secondary border-t border-border-light">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900">
              Current Requests
            </h2>
            <Link href="/requests" className="text-primary hover:text-secondary font-medium flex items-center">
              View all requests
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="loading-animation bg-white border border-border-light rounded-lg h-64"></div>
              ))}
            </div>
          ) : requests && requests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {requests.map((request) => (
                <AnimatedContainer key={request.id || `request-${Math.random()}`}>
                  <Card variant="highlight" className="h-full">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Looking in {request.area_preference}
                      </h3>
                      <div className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                        Request
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5 mb-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Budget</p>
                        <p className="font-medium">${request.budget_min} - ${request.budget_max}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Dates</p>
                        <p className="font-medium">{new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Bedrooms</p>
                        <p className="font-medium">{request.bedrooms || 'Any'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Bathrooms</p>
                        <p className="font-medium">{request.bathrooms || 'Any'}</p>
                      </div>
                    </div>
                    <Link href={`/requests/${request.id}`}>
                      <Button variant="secondary" fullWidth className="text-sm">View Details</Button>
                    </Link>
                  </Card>
                </AnimatedContainer>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12 bg-white border-primary/10">
              <p className="text-gray-600 mb-4">No sublease requests available at the moment.</p>
              <p className="text-gray-500 mb-6">Looking for a sublease? Create a request to let others know what you're looking for!</p>
              <Link href="/requests/create" className="mt-4 inline-block">
                <Button>Post a Request</Button>
              </Link>
            </Card>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white border-t border-border-light">
        <div className="container mx-auto px-6 max-w-7xl">
          <h2 className="text-3xl font-semibold text-center text-gray-900 mb-16">
            Benefits of PSU Subleases
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <AnimatedContainer>
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">No Middleman Fees</h3>
                <p className="text-gray-600">We don't process payments or charge fees — connect directly with other students.</p>
              </div>
            </AnimatedContainer>
            
            <AnimatedContainer>
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Penn State Community</h3>
                <p className="text-gray-600">Platform exclusively for Penn State students, ensuring safe and reliable connections.</p>
              </div>
            </AnimatedContainer>
            
            <AnimatedContainer>
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Flexible Terms</h3>
                <p className="text-gray-600">Find short-term or long-term subleases that fit your specific schedule and needs.</p>
              </div>
            </AnimatedContainer>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <div className="flex items-center justify-center mb-8">
            <Image 
              src="/lion.png" 
              alt="Penn State Lion" 
              width={60} 
              height={60}
              className="mr-4"
            />
            <h2 className="text-3xl font-bold">Join the PSU Subleases Community</h2>
          </div>
          
          <p className="text-lg text-white/80 mb-4 max-w-2xl mx-auto">
            Whether you're looking for a sublease or have a space to offer, connect with fellow Penn State students today.
          </p>
          <p className="text-sm text-white/60 mb-10 max-w-2xl mx-auto">
            Remember: PSU Subleases is an aggregator platform that does not handle any financial transactions between users.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/listings">
              <Button size="lg" className="py-4 px-8 rounded-md bg-white text-primary border-none">
                Browse Listings
              </Button>
            </Link>
            <Link href="/requests">
              <Button size="lg" variant="outline" className="py-4 px-8 rounded-md bg-transparent border-2 border-white hover:bg-white/10 text-white">
                View Requests
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}