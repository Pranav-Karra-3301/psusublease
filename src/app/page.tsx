'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuthContext } from '@/components/auth/AuthProvider';
import supabase from '@/utils/supabase';
import { motion, AnimatePresence, useInView } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: 'easeOut'
    }
  })
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: 'easeOut'
    }
  })
};

// Helper component for scroll animations
const ScrollAnimation = ({ 
  children, 
  delay = 0, 
  className = "" 
}: { 
  children: React.ReactNode; 
  delay?: number; 
  className?: string; 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.7, delay: delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export default function Home() {
  const [listings, setListings] = useState<{
    id: string;
    apartment_name?: string;
    location?: string;
    price?: number;
    start_date?: string;
    end_date?: string;
    bedrooms?: number;
    bathrooms?: number;
    image_url?: string;
    created_at?: string;
    user_id?: string;
    contact_email?: string;
    contact_phone?: string;
    contact_name?: string;
    images?: string[] | null;
    custom_apartment?: string;
    offer_price?: number;
    apartment_id?: string;
  }[]>([]);
  
  const [requests, setRequests] = useState<{
    id: string;
    area_preference?: string;
    budget_min?: number;
    budget_max?: number;
    start_date?: string;
    end_date?: string;
    bedrooms?: number | null;
    bathrooms?: number | null;
    user_id?: string;
    created_at?: string;
    contact_email?: string;
    contact_phone?: string;
    preferred_apartments?: string[] | null;
    distance_to_campus?: number | null;
    contact_name?: string;
  }[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      try {
        let { data, error } = await supabase
          .from('listings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6);
        
        if (error) {
          console.error('Error fetching listings:', error);
          return;
        }
        
        // Log raw data for debugging
        console.log('Raw listing data:', data);
        
        // Fetch user profiles for each listing
        if (data && data.length > 0) {
          const enhancedListings = await Promise.all(
            data.map(async (listing) => {
              const cleanedListing = Object.fromEntries(
                Object.entries(listing).map(([key, value]) => [key, value === null ? undefined : value])
              );
              
              if (listing.user_id) {
                const { data: userData } = await supabase
                  .from('profiles')
                  .select('first_name, last_name, email, phone')
                  .eq('id', listing.user_id)
                  .single();
                
                return {
                  ...cleanedListing,
                  id: listing.id,
                  contact_email: userData?.email || undefined,
                  contact_phone: userData?.phone || undefined,
                  contact_name: userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || undefined : undefined
                };
              }
              return {
                ...cleanedListing,
                id: listing.id
              };
            })
          );
          
          console.log('Enhanced listings:', enhancedListings);
          setListings(enhancedListings);
        } else {
          setListings([]);
        }
      } catch (error) {
        console.error('Error:', error);
        setListings([]);
      } finally {
        setLoading(false);
      }
    }

    async function fetchRequests() {
      setRequestsLoading(true);
      try {
        const { data, error } = await supabase
          .from('sublease_requests')
          .select('*')
          .eq('is_verified', true)
          .order('created_at', { ascending: false })
          .limit(6);
        
        if (error) {
          console.error('Error fetching requests:', error);
          return;
        }
        
        // Fetch user profiles for each request
        if (data && data.length > 0) {
          const enhancedRequests = await Promise.all(
            data.map(async (request) => {
              const cleanedRequest = Object.fromEntries(
                Object.entries(request).map(([key, value]) => [key, value === null ? undefined : value])
              );
              
              if (request.user_id) {
                const { data: userData } = await supabase
                  .from('profiles')
                  .select('first_name, last_name, email, phone')
                  .eq('id', request.user_id)
                  .single();
                
                return {
                  ...cleanedRequest,
                  id: request.id,
                  contact_email: userData?.email || undefined,
                  contact_phone: userData?.phone || undefined,
                  contact_name: userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || undefined : undefined
                };
              }
              return {
                ...cleanedRequest,
                id: request.id
              };
            })
          );
          
          setRequests(enhancedRequests);
        } else {
          setRequests([]);
        }
      } catch (error) {
        console.error('Error:', error);
        setRequests([]);
      } finally {
        setRequestsLoading(false);
      }
    }

    fetchListings();
    fetchRequests();
  }, []);

  useEffect(() => {
    if (listings.length > 0) {
      console.log('Listing data sample:', listings[0]);
    }
  }, [listings]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <motion.div
      className="flex flex-col min-h-screen pt-16 bg-white"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      {/* Hero section with just the preview image and working buttons */}
      <motion.section
        className="py-12 bg-white relative overflow-hidden"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        custom={0}
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.img 
            src="/preview.png" 
            alt="Old Main Building at Penn State" 
            className="w-full rounded-lg mb-8"
            initial={{ opacity: 0, scale: 0.98, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          />
          <motion.div
            className="flex flex-wrap justify-center gap-4"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            <motion.div className="flex gap-3" variants={fadeInUp} custom={1}>
              <Link href="/listings">
                <motion.div variants={fadeInUp} custom={2}>
                  <Button className="shadow-lg rounded-xl px-6 py-3 text-base font-semibold bg-primary text-white hover:bg-primary/90 hover:-translate-y-1 transition-all duration-200">Browse Listings</Button>
                </motion.div>
              </Link>
              <Link href="/requests">
                <motion.div variants={fadeInUp} custom={3}>
                  <Button className="shadow-lg rounded-xl px-6 py-3 text-base font-semibold bg-primary text-white hover:bg-primary/90 hover:-translate-y-1 transition-all duration-200">Browse Requests</Button>
                </motion.div>
              </Link>
            </motion.div>
            <motion.div className="flex gap-3" variants={fadeInUp} custom={2}>
              <Link href="/create">
                <motion.div variants={fadeInUp} custom={4}>
                  <Button className="shadow-lg rounded-xl px-6 py-3 text-base font-semibold bg-primary text-white hover:bg-primary/90 hover:-translate-y-1 transition-all duration-200">Post Sublease</Button>
                </motion.div>
              </Link>
              <Link href="/requests/create">
                <motion.div variants={fadeInUp} custom={5}>
                  <Button className="shadow-lg rounded-xl px-6 py-3 text-base font-semibold bg-primary text-white hover:bg-primary/90 hover:-translate-y-1 transition-all duration-200">Post Request</Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
      
      <ScrollAnimation delay={0.1}>
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 w-full">
              {[
                {
                  href: "/create",
                  src: "/2.png",
                  alt: "Step 2: Post Sublease",
                  aria: "Post Sublease"
                },
                {
                  href: "/listings",
                  src: "/3.png",
                  alt: "Step 3: Browse Listings",
                  aria: "Browse Listings"
                },
                {
                  href: "/requests/create",
                  src: "/4.png",
                  alt: "Step 4: Create Request",
                  aria: "Create Request"
                }
              ].map((item, i) => (
                <ScrollAnimation key={item.href} delay={0.1 + i * 0.1} className="flex-1 min-w-0">
                  <motion.a
                    href={item.href}
                    className="group transition-transform duration-200 block"
                    tabIndex={0}
                    aria-label={item.aria}
                    whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(0,0,0,0.10)" }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <motion.img
                      src={item.src}
                      alt={item.alt}
                      className="w-full h-auto object-contain rounded-lg shadow transition-transform duration-200 group-hover:scale-105 group-hover:shadow-xl group-active:scale-95"
                      style={{ aspectRatio: '1/1', cursor: 'pointer' }}
                    />
                  </motion.a>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>
      </ScrollAnimation>

      {/* How it works section */}
      <ScrollAnimation delay={0.1}>
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-text-primary mb-8 text-center">
              How PSU Sublease Works
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  ),
                  title: "Browse Listings",
                  desc: "Search through available subleases near Penn State. Filter by price, location, and more.",
                  bg: "bg-primary/10"
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-accent">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  ),
                  title: "Post Your Sublease",
                  desc: "List your apartment for others to see. Include details, photos, and your terms.",
                  bg: "bg-accent/10"
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                  ),
                  title: "Request a Sublease",
                  desc: "Looking for something specific? Post a detailed request with your requirements and budget.",
                  bg: "bg-primary/10"
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  ),
                  title: "Connect Directly",
                  desc: "Message users directly when you find a listing or request that matches your needs. Log in to view contact information.",
                  bg: "bg-primary/10"
                }
              ].map((item, i) => (
                <ScrollAnimation key={item.title} delay={0.1 + i * 0.1}>
                  <Card className="text-center p-6">
                    <div className={`mb-4 mx-auto ${item.bg} w-16 h-16 flex items-center justify-center rounded-full`}>
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">{item.title}</h3>
                    <p className="text-text-secondary">{item.desc}</p>
                  </Card>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>
      </ScrollAnimation>

      {/* Current listings */}
      <ScrollAnimation delay={0.1}>
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              Current Listings
            </h2>
            
            <AnimatePresence>
            {loading ? (
              <motion.div
                className="text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p>Loading listings...</p>
              </motion.div>
            ) : listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing, i) => {
                  let imageUrl = listing.image_url;
                  if (!imageUrl && listing.images) {
                    if (Array.isArray(listing.images) && listing.images.length > 0) {
                      imageUrl = listing.images[0];
                    } else if (typeof listing.images === 'string') {
                      try {
                        const parsedImages = JSON.parse(listing.images);
                        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                          imageUrl = parsedImages[0];
                        }
                      } catch (e) {
                        imageUrl = listing.images;
                      }
                    }
                  }

                  const apartmentName = listing.apartment_name || 
                                      listing.custom_apartment || 
                                      (listing.apartment_id ? 'Apartment ' + listing.apartment_id : 'Apartment');

                  return (
                    <ScrollAnimation key={listing.id} delay={0.05 * i}>
                      <Card className="overflow-hidden flex flex-col h-full">
                        <div className="h-48 bg-white relative -mx-6 -mt-6 mb-4">
                          {imageUrl ? (
                            <motion.img 
                              src={imageUrl} 
                              alt={apartmentName} 
                              className="w-full h-full object-cover"
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.5, delay: 0.1 }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white text-text-secondary">
                              No Image
                            </div>
                          )}
                          {listing.id && (
                            <motion.div
                              className="absolute top-2 right-2 bg-accent text-white px-2 py-1 rounded text-sm"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.2 }}
                            >
                              ID: {listing.id.slice(0, 8)}
                            </motion.div>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-text-primary">
                          {apartmentName}
                        </h3>
                        <p className="text-text-secondary text-sm mb-2">{listing.location || 'State College'}</p>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-accent text-xl font-bold">${listing.price || listing.offer_price || 0}/mo</span>
                          <span className="text-text-secondary text-sm">
                            {formatDate(listing.start_date)} - {formatDate(listing.end_date)}
                          </span>
                        </div>
                        <div className="flex gap-4 text-sm text-text-secondary mb-4">
                          <span>{listing.bedrooms || 0} {(listing.bedrooms === 1) ? 'Bed' : 'Beds'}</span>
                          <span>•</span>
                          <span>{listing.bathrooms || 0} {(listing.bathrooms === 1) ? 'Bath' : 'Baths'}</span>
                        </div>
                        {user && (
                          <div className="mb-4 text-sm">
                            <p className="text-text-secondary">
                              <strong>Contact:</strong> {listing.contact_name || 'Anonymous'}<br />
                              {listing.contact_email && <>{listing.contact_email}<br /></>}
                              {listing.contact_phone && <>{listing.contact_phone}</>}
                            </p>
                          </div>
                        )}
                        <div className="mt-auto">
                          <Link href={`/listings/${listing.id}`}>
                            <Button variant="primary" fullWidth>View Details</Button>
                          </Link>
                        </div>
                      </Card>
                    </ScrollAnimation>
                  );
                })}
              </div>
            ) : (
              <motion.div
                className="text-center py-8 bg-white rounded-lg p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
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
              </motion.div>
            )}
            </AnimatePresence>
            
            {listings.length > 0 && (
              <ScrollAnimation delay={0.2}>
                <div className="mt-8 text-center">
                  <Link href="/listings">
                    <Button variant="secondary">View All Listings</Button>
                  </Link>
                </div>
              </ScrollAnimation>
            )}
          </div>
        </section>
      </ScrollAnimation>
      
      {/* Current requests */}
      <ScrollAnimation delay={0.1}>
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              Current Requests
            </h2>
            
            <AnimatePresence>
            {requestsLoading ? (
              <motion.div
                className="text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p>Loading requests...</p>
              </motion.div>
            ) : requests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.map((request, i) => (
                  <ScrollAnimation key={request.id} delay={0.05 * i}>
                    <Card variant="glass" className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-text-primary">{request.area_preference}</h3>
                        <span className="text-sm text-text-secondary font-mono">{request.id.substring(0, 8)}...</span>
                      </div>
                      
                      <div className="mb-4">
                        <span className="text-accent text-lg font-bold">${request.budget_min} - ${request.budget_max}</span>
                        <span className="text-text-secondary text-sm ml-2">per month</span>
                      </div>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center text-text-secondary text-sm">
                          <span className="flex-1">Duration</span>
                          <span>{formatDate(request.start_date)} - {formatDate(request.end_date)}</span>
                        </div>
                        
                        {(request.bedrooms || request.bathrooms) && (
                          <div className="flex items-center text-text-secondary text-sm">
                            <span className="flex-1">Space</span>
                            <span>
                              {request.bedrooms && `${request.bedrooms} ${request.bedrooms === 1 ? 'Bed' : 'Beds'}`}
                              {request.bedrooms && request.bathrooms && ' • '}
                              {request.bathrooms && `${request.bathrooms} ${request.bathrooms === 1 ? 'Bath' : 'Baths'}`}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {user && (
                        <div className="mb-4 text-sm">
                          <p className="text-text-secondary">
                            <strong>Contact:</strong> {request.contact_name || 'Anonymous'}<br />
                            {request.contact_email && <>{request.contact_email}<br /></>}
                            {request.contact_phone && <>{request.contact_phone}</>}
                          </p>
                        </div>
                      )}
                      
                      <div className="mt-auto pt-4 border-t border-border-light">
                        {user ? (
                          <Link href={`/requests/${request.id}`}>
                            <Button variant="primary" fullWidth>View Details</Button>
                          </Link>
                        ) : (
                          <Link href="/auth">
                            <Button variant="primary" fullWidth>Sign in to Contact</Button>
                          </Link>
                        )}
                      </div>
                    </Card>
                  </ScrollAnimation>
                ))}
              </div>
            ) : (
              <motion.div
                className="text-center py-8 bg-white rounded-lg p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <h3 className="text-xl font-semibold text-text-primary mb-2">No Requests Currently</h3>
                <p className="text-text-secondary mb-6">
                  {user ? 'Be the first to post a request!' : 'Sign in to post your request!'}
                </p>
                {user ? (
                  <Link href="/requests/create">
                    <Button>Post Your Request</Button>
                  </Link>
                ) : (
                  <Link href="/auth">
                    <Button>Sign In</Button>
                  </Link>
                )}
              </motion.div>
            )}
            </AnimatePresence>
            
            {requests.length > 0 && (
              <ScrollAnimation delay={0.2}>
                <div className="mt-8 text-center">
                  <Link href="/requests">
                    <Button variant="secondary">View All Requests</Button>
                  </Link>
                </div>
              </ScrollAnimation>
            )}
          </div>
        </section>
      </ScrollAnimation>
    </motion.div>
  );
}