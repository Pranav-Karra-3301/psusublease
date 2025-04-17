'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuthContext } from '@/components/auth/AuthProvider';
import supabase from '@/utils/supabase';

export default function Home() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching listings:', error);
          return;
        }
        
        setListings(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, []);

  return (
    <div className="flex flex-col min-h-screen pt-16">
      {/* Hero section with minimalist design */}
      <section className="py-12 bg-bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-text-primary mb-4">
              PSU Sublease
            </h1>
            <p className="text-xl text-text-secondary mb-6">
              Find and post subleases at Penn State University
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/listings">
                <Button>Browse All Listings</Button>
              </Link>
              <Link href="/create">
                <Button variant="secondary">Post Your Sublease</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Current listings */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Current Listings
          </h2>
          
          {loading ? (
            <div className="text-center py-8">
              <p>Loading listings...</p>
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden flex flex-col">
                  <div className="h-48 bg-bg-secondary relative -mx-6 -mt-6 mb-4">
                    {listing.image_url ? (
                      <img 
                        src={listing.image_url} 
                        alt={listing.apartment_name || 'Apartment'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-bg-secondary text-text-secondary">
                        No Image
                      </div>
                    )}
                    {listing.id && (
                      <div className="absolute top-2 right-2 bg-accent text-white px-2 py-1 rounded text-sm">
                        ID: {listing.id.slice(0, 8)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary">{listing.apartment_name || 'Apartment'}</h3>
                  <p className="text-text-secondary text-sm mb-2">{listing.location || 'State College'}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-accent text-xl font-bold">${listing.price || 0}/mo</span>
                    <span className="text-text-secondary text-sm">
                      {listing.start_date && new Date(listing.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 
                      {listing.end_date && new Date(listing.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-text-secondary mb-4">
                    <span>{listing.bedrooms || 0} {(listing.bedrooms === 1) ? 'Bed' : 'Beds'}</span>
                    <span>•</span>
                    <span>{listing.bathrooms || 0} {(listing.bathrooms === 1) ? 'Bath' : 'Baths'}</span>
                  </div>
                  <div className="mt-auto">
                    <Link href={`/listings/${listing.id}`}>
                      <Button variant="primary" fullWidth>View Details</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-bg-secondary rounded-lg p-8">
              <h3 className="text-xl font-semibold text-text-primary mb-2">No Listings Currently</h3>
              <p className="text-text-secondary mb-6">
                {user ? 'Be the first to post a sublease!' : 'Sign in to post your lease!'}
              </p>
              {user ? (
                <Link href="/create">
                  <Button>Post Your Sublease</Button>
                </Link>
              ) : (
                <Link href="/auth">
                  <Button>Sign In</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
