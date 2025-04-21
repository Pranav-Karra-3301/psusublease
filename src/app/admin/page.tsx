'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/utils/supabase';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import CreateFacebookListingForm from '@/components/listings/CreateFacebookListingForm';

type StatsType = {
  users: number;
  listings: number;
  agencyListings: number;
  requests: number;
  agencies: number;
  facebookListings: number;
};

type User = {
  id: string;
  email: string;
  created_at: string;
  is_verified?: boolean;
};

type Agency = {
  id: string;
  name: string;
  email: string;
  is_verified: boolean;
  created_at: string;
  userid: string;
};

type Listing = {
  id: string;
  property_name?: string;
  address?: string;
  user_id: string;
  created_at: string;
};

type Request = {
  id: string;
  user_id: string;
  area_preference: string;
  created_at: string;
  is_verified: boolean;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<StatsType>({
    users: 0,
    listings: 0,
    agencyListings: 0,
    requests: 0,
    agencies: 0,
    facebookListings: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [agencyListings, setAgencyListings] = useState<any[]>([]);
  const [facebookListings, setFacebookListings] = useState<any[]>([]);

  // Verify admin status and fetch data
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        setLoading(true);
        
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/sign-in');
          return;
        }
        
        // Check if user is admin (only pranavkarra001@gmail.com is admin)
        if (user.email !== 'pranavkarra001@gmail.com') {
          router.push('/');
          return;
        }
        
        setIsAdmin(true);
        fetchDashboardData();
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/');
      }
    };
    
    checkAdmin();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const [
        { data: userData, error: userError },
        { data: listingData, error: listingError },
        { data: agencyListingData, error: agencyListingError },
        { data: requestData, error: requestError },
        { data: agencyData, error: agencyError },
        { data: facebookListingData, error: facebookListingError }
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('listings').select('*'),
        supabase.from('agency_listings').select('*, agencies(*)'),
        supabase.from('sublease_requests').select('*'),
        supabase.from('agencies').select('*'),
        supabase.from('facebook_listings').select('*')
      ]);

      if (userError) throw userError;
      if (listingError) throw listingError;
      if (agencyListingError) throw agencyListingError;
      if (requestError) throw requestError;
      if (agencyError) throw agencyError;
      if (facebookListingError) throw facebookListingError;

      setStats({
        users: userData?.length || 0,
        listings: listingData?.length || 0,
        agencyListings: agencyListingData?.length || 0,
        requests: requestData?.length || 0,
        agencies: agencyData?.length || 0,
        facebookListings: facebookListingData?.length || 0,
      });

      setUsers(userData || []);
      setListings(listingData || []);
      setAgencyListings(agencyListingData || []);
      setRequests(requestData || []);
      setAgencies(agencyData || []);
      setFacebookListings(facebookListingData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyAgency = async (agencyId: string) => {
    try {
      // Get admin session token
      const { data: sessionData } = await supabase.auth.getSession();
      const adminToken = sessionData?.session?.access_token;
      if (!adminToken) throw new Error('No admin session token');

      const res = await fetch('/api/verify-agency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyId, adminToken }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to verify agency');
      setAgencies(
        agencies.map(agency =>
          agency.id === agencyId
            ? { ...agency, is_verified: true }
            : agency
        )
      );
    } catch (error) {
      console.error('Error verifying agency:', error);
      alert('Error verifying agency: ' + (error as any).message);
    }
  };

  const verifyRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('sublease_requests')
        .update({ is_verified: true })
        .eq('id', requestId);

      if (error) throw error;
      
      // Update the local state
      setRequests(
        requests.map(request => 
          request.id === requestId 
            ? { ...request, is_verified: true } 
            : request
        )
      );
    } catch (error) {
      console.error('Error verifying request:', error);
    }
  };

  const verifyUser = async (userId: string) => {
    try {
      // Get admin session token
      const { data: sessionData } = await supabase.auth.getSession();
      const adminToken = sessionData?.session?.access_token;
      if (!adminToken) throw new Error('No admin session token');

      const res = await fetch('/api/verify-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, adminToken }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to verify user');
      setUsers(
        users.map(user =>
          user.id === userId
            ? { ...user, is_verified: true }
            : user
        )
      );
    } catch (error) {
      console.error('Error verifying user:', error);
      alert('Error verifying user: ' + (error as any).message);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const deleteListing = async (id: string, type: 'regular' | 'agency' | 'facebook') => {
    // Add confirmation dialog
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      if (type === 'regular') {
        // First delete any associated images from storage
        const { data: listing } = await supabase
          .from('listings')
          .select('images')
          .eq('id', id)
          .single();
        
        if (listing?.images) {
          for (const image of listing.images) {
            const { error: storageError } = await supabase.storage
              .from('listing-images')
              .remove([image]);
            if (storageError) console.error('Error deleting image:', storageError);
          }
        }

        // Then delete the listing
        const { error } = await supabase
          .from('listings')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        setListings(listings.filter(listing => listing.id !== id));
      } else if (type === 'agency') {
        // First get the floor plans to delete their images
        const { data: floorPlans } = await supabase
          .from('floor_plans')
          .select('images')
          .eq('agency_listing_id', id);
        
        // Delete floor plan images from storage
        if (floorPlans) {
          for (const plan of floorPlans) {
            if (plan.images) {
              for (const image of plan.images) {
                const { error: storageError } = await supabase.storage
                  .from('listing-images')
                  .remove([image]);
                if (storageError) console.error('Error deleting floor plan image:', storageError);
              }
            }
          }
        }

        // Delete associated floor plans
        const { error: floorPlansError } = await supabase
          .from('floor_plans')
          .delete()
          .eq('agency_listing_id', id);
        
        if (floorPlansError) throw floorPlansError;
        
        // Get and delete agency listing images
        const { data: agencyListing } = await supabase
          .from('agency_listings')
          .select('images')
          .eq('id', id)
          .single();
        
        if (agencyListing?.images) {
          for (const image of agencyListing.images) {
            const { error: storageError } = await supabase.storage
              .from('listing-images')
              .remove([image]);
            if (storageError) console.error('Error deleting agency listing image:', storageError);
          }
        }

        // Finally delete the agency listing
        const { error } = await supabase
          .from('agency_listings')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        setAgencyListings(agencyListings.filter(listing => listing.id !== id));
      } else if (type === 'facebook') {
        // Delete any images associated with the Facebook listing
        const { data: fbListing } = await supabase
          .from('facebook_listings')
          .select('images')
          .eq('id', id)
          .single();
        
        if (fbListing?.images) {
          for (const image of fbListing.images) {
            const { error: storageError } = await supabase.storage
              .from('listing-images')
              .remove([image]);
            if (storageError) console.error('Error deleting Facebook listing image:', storageError);
          }
        }

        // Delete the Facebook listing
        const { error } = await supabase
          .from('facebook_listings')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        setFacebookListings(facebookListings.filter(listing => listing.id !== id));
      }
      
      alert('Listing deleted successfully');
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Error deleting listing. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 mt-16 flex justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-16 mt-16">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Admin Dashboard</h1>
        
        <div className="mb-8 border-b border-border-light">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-4 ${
                activeTab === 'overview'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-text-secondary'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-4 ${
                activeTab === 'users'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-text-secondary'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('agencies')}
              className={`py-2 px-4 ${
                activeTab === 'agencies'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-text-secondary'
              }`}
            >
              Agencies
            </button>
            <button
              onClick={() => setActiveTab('listings')}
              className={`py-2 px-4 ${
                activeTab === 'listings'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-text-secondary'
              }`}
            >
              Listings
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-2 px-4 ${
                activeTab === 'requests'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-text-secondary'
              }`}
            >
              Requests
            </button>
            <button
              onClick={() => setActiveTab('facebook')}
              className={`py-2 px-4 ${
                activeTab === 'facebook'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-text-secondary'
              }`}
            >
              Facebook Listings
            </button>
          </div>
        </div>
        
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-text-secondary text-sm font-medium">Total Users</h3>
              <p className="text-3xl font-bold text-text-primary mt-2">{stats.users}</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-text-secondary text-sm font-medium">Total Listings</h3>
              <p className="text-3xl font-bold text-text-primary mt-2">
                {stats.listings + stats.agencyListings + stats.facebookListings}
              </p>
              <div className="flex items-center text-xs text-text-secondary mt-2">
                <span>{stats.listings} Individual</span>
                <span className="mx-2">•</span>
                <span>{stats.agencyListings} Agency</span>
                <span className="mx-2">•</span>
                <span>{stats.facebookListings} Facebook</span>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-text-secondary text-sm font-medium">Active Requests</h3>
              <p className="text-3xl font-bold text-text-primary mt-2">{stats.requests}</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-text-secondary text-sm font-medium">Property Agencies</h3>
              <p className="text-3xl font-bold text-text-primary mt-2">{stats.agencies}</p>
              <div className="flex items-center text-xs text-text-secondary mt-2">
                <span>
                  {agencies.filter(a => a.is_verified).length} Verified
                </span>
              </div>
            </Card>
          </div>
        )}
        
        {activeTab === 'users' && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-light">
                <thead>
                  <tr className="bg-bg-secondary">
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border-light">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.is_verified ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Verified
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {!user.is_verified && (
                          <Button
                            size="sm"
                            onClick={() => verifyUser(user.id)}
                          >
                            Verify
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
        
        {activeTab === 'agencies' && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-light">
                <thead>
                  <tr className="bg-bg-secondary">
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border-light">
                  {agencies.map((agency) => (
                    <tr key={agency.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                        {agency.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {agency.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {agency.is_verified ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Verified
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {formatDate(agency.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {!agency.is_verified && (
                          <Button 
                            size="sm" 
                            onClick={() => verifyAgency(agency.id)}
                          >
                            Verify
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
        
        {activeTab === 'listings' && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-light">
                <thead>
                  <tr className="bg-bg-secondary">
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary tracking-wider">
                      User/Agency ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border-light">
                  {listings.map((listing) => (
                    <tr key={listing.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                        <Link href={`/listings/${listing.id}`} className="hover:text-accent hover:underline">
                          {listing.property_name || 'Unnamed Property'}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {listing.address || 'No address provided'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {listing.user_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        Individual
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {formatDate(listing.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button 
                          size="sm" 
                          variant="error"
                          onClick={() => deleteListing(listing.id, 'regular')}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {agencyListings.map((listing) => (
                    <tr key={listing.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                        <Link href={`/agency-listings/${listing.id}`} className="hover:text-accent hover:underline">
                          {listing.property_name || 'Unnamed Property'}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {listing.address || 'No address provided'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {listing.agency_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        Agency
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {formatDate(listing.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button 
                          size="sm" 
                          variant="error"
                          onClick={() => deleteListing(listing.id, 'agency')}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {facebookListings.map((listing) => (
                    <tr key={listing.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                        <Link href={`/facebook-listings/${listing.id}`} className="hover:text-accent hover:underline">
                          {listing.custom_apartment || (listing.parsed_listing_data && listing.parsed_listing_data.apartment_name) || 'Facebook Listing'}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {listing.address || (listing.parsed_listing_data && listing.parsed_listing_data.address) || 'No address provided'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {listing.author_username || 'Anonymous'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        Facebook
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {formatDate(listing.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button 
                          size="sm" 
                          variant="error"
                          onClick={() => deleteListing(listing.id, 'facebook')}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
        
        {activeTab === 'requests' && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-light">
                <thead>
                  <tr className="bg-bg-secondary">
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary tracking-wider">
                      Area Preference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border-light">
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                        {request.area_preference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {request.user_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.is_verified ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Verified
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {formatDate(request.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {!request.is_verified && (
                          <Button 
                            size="sm" 
                            onClick={() => verifyRequest(request.id)}
                          >
                            Verify
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
        
        {activeTab === 'facebook' && (
          <>
            <Card className="overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-light">
                  <thead>
                    <tr className="bg-bg-secondary">
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-border-light">
                    {facebookListings.map((listing) => (
                      <tr key={listing.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                          <Link href={`/facebook-listings/${listing.id}`} className="hover:text-accent hover:underline">
                            {listing.custom_apartment || 
                             (listing.parsed_listing_data && listing.parsed_listing_data.apartment_name) || 
                             'Facebook Listing'}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {listing.address || 
                           (listing.parsed_listing_data && listing.parsed_listing_data.address) || 
                           'No address provided'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {listing.author_username || 'Anonymous'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          ${listing.offer_price || 
                            (listing.parsed_listing_data && listing.parsed_listing_data.price) || 
                            'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {formatDate(listing.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="error"
                              onClick={() => deleteListing(listing.id, 'facebook')}
                            >
                              Delete
                            </Button>
                            {listing.facebook_post_link && (
                              <a 
                                href={listing.facebook_post_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200"
                              >
                                FB Post
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {facebookListings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-text-secondary">
                          No Facebook listings found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
            <CreateFacebookListingForm />
          </>
        )}
      </div>
    </div>
  );
} 