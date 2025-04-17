'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useAuthContext } from '@/components/auth/AuthProvider';
import supabase from '@/utils/supabase';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState('listings');
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    preferredContact: 'email',
  });
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [apartments, setApartments] = useState<any[]>([]);
  
  // Fetch user profile data and listings
  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    
    async function fetchUserData() {
      setProfileLoading(true);
      
      try {
        if (!user) {
          console.error('No user found');
          return;
        }
        
        // Get user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          // If no profile found, create a default one
          if (profileError.code === 'PGRST116') {
            // Create a default profile
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                first_name: '',
                last_name: '',
                phone: '',
                email: user.email,
                preferred_contact: 'email'
              });
            
            if (insertError) {
              console.error('Error creating profile:', insertError);
            } else {
              // Set default user data
              setUserData({
                id: user.id || '',
                name: '',
                email: user.email || '',
                phone: '',
                preferredContact: 'email',
              });
            }
          } else {
            console.error('Error fetching profile:', profileError);
          }
        } else if (profileData) {
          setUserData({
            id: user.id || '',
            name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
            email: user.email || '',
            phone: profileData.phone || '',
            preferredContact: profileData.preferred_contact || 'email',
          });
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setProfileLoading(false);
      }
    }
    
    async function fetchUserListings() {
      setLoading(true);
      
      try {
        if (!user) {
          console.error('No user found');
          return;
        }
        
        // Get user listings
        const { data: listingsData, error: listingsError } = await supabase
          .from('listings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (listingsError) {
          console.error('Error fetching listings:', listingsError);
        } else {
          setListings(listingsData || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    
    async function fetchApartments() {
      const { data: apartmentsData, error: apartmentsError } = await supabase
        .from('apartments')
        .select('*');
      
      if (apartmentsError) {
        console.error('Error fetching apartments:', apartmentsError);
      } else {
        setApartments(apartmentsData || []);
      }
    }
    
    fetchUserData();
    fetchUserListings();
    fetchApartments();
  }, [user, router]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };
  
  const handleSaveProfile = async () => {
    setProfileLoading(true);
    setMessage(null);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userData.id,
          first_name: userData.name.split(' ')[0] || '',
          last_name: userData.name.split(' ').slice(1).join(' ') || '',
          phone: userData.phone,
          preferred_contact: userData.preferredContact,
        });
      
      if (error) throw error;
      
      setMessage({
        text: 'Profile updated successfully!',
        type: 'success'
      });
      setEditMode(false);
    } catch (error: any) {
      setMessage({
        text: error.message || 'Failed to update profile',
        type: 'error'
      });
    } finally {
      setProfileLoading(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    
    if (!user) {
      setMessage({
        text: 'You must be logged in to delete your account',
        type: 'error'
      });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      // Delete all user data using our secure function
      const { error: deleteError } = await (supabase as any)
        .rpc('delete_user_data', { user_id: user.id });
      
      if (deleteError) {
        console.error('Error deleting user data:', deleteError);
        throw new Error(`Failed to delete account: ${deleteError.message}`);
      }
      
      // Delete any uploaded images from storage
      try {
        // Use our custom function to delete user's files by path
        const { error: deleteFilesError } = await (supabase as any)
          .rpc('delete_storage_object_by_path', { 
            path_prefix: `${user.id}/`, 
            bucket_id: 'listing-images' 
          });
          
        if (deleteFilesError) {
          console.error('Error deleting files:', deleteFilesError);
          // Continue with profile deletion
        }
      } catch (storageErr) {
        console.error('Storage delete error:', storageErr);
        // Continue with sign out
      }
      
      // Sign the user out
      await supabase.auth.signOut();
      
      // Show success message and redirect
      setMessage({
        text: 'Your account data has been deleted. You have been signed out.',
        type: 'success'
      });
      
      // Redirect to home page after a delay
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error: any) {
      console.error('Account deletion error:', error);
      setMessage({
        text: error.message || 'Failed to delete account. Please try again or contact support.',
        type: 'error'
      });
      setConfirmDelete(false);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteListing = async (listingId: string) => {
    setLoading(true);
    setMessage(null);
    
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);
      
      if (error) throw error;
      
      // Update listings
      setListings(listings.filter(listing => listing.id !== listingId));
      
      setMessage({
        text: 'Listing deleted successfully!',
        type: 'success'
      });
    } catch (error: any) {
      setMessage({
        text: error.message || 'Failed to delete listing',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      setMessage({
        text: 'Failed to sign out. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-text-primary mb-4">Sign In Required</h1>
          <p className="text-text-secondary mb-6">
            You need to be signed in to view your profile.
          </p>
          <Link href="/auth">
            <Button>Go to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Render profile info section
  const renderProfileInfo = () => {
    if (editMode) {
      return (
        <div className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={userData.name}
            onChange={handleInputChange}
          />
          
          <div>
            <label className="block mb-2 text-sm font-medium text-text-primary">Email Address</label>
            <p className="bg-bg-secondary px-3 py-2 rounded-md">{userData.email}</p>
          </div>
          
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={userData.phone}
            onChange={handleInputChange}
          />
          
          <Select
            label="Preferred Contact Method"
            name="preferredContact"
            value={userData.preferredContact}
            onChange={handleInputChange}
            options={[
              { value: 'email', label: 'Email' },
              { value: 'phone', label: 'Phone' },
              { value: 'text', label: 'Text Message' },
            ]}
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="secondary"
              onClick={() => setEditMode(false)}
              disabled={profileLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveProfile}
              disabled={profileLoading}
            >
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-text-secondary text-sm">Full Name</h3>
          <p className="text-text-primary">{userData.name || 'Not set'}</p>
        </div>
        
        <div>
          <h3 className="text-text-secondary text-sm">Email Address</h3>
          <p className="text-text-primary">{userData.email}</p>
        </div>
        
        <div>
          <h3 className="text-text-secondary text-sm">Phone Number</h3>
          <p className="text-text-primary">{userData.phone || 'Not set'}</p>
        </div>
        
        <div>
          <h3 className="text-text-secondary text-sm">Preferred Contact Method</h3>
          <p className="text-text-primary capitalize">{userData.preferredContact}</p>
        </div>
        
        <div className="pt-4">
          <Button 
            variant="primary"
            onClick={() => setEditMode(true)}
            disabled={profileLoading}
          >
            Edit Profile
          </Button>
        </div>
      </div>
    );
  };
  
  // Render my listings section
  const renderMyListings = () => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <p>Loading listings...</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-8">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-text-primary">Your Listings</h3>
            <Link href="/create">
              <Button variant="primary" size="sm">
                Create New Listing
              </Button>
            </Link>
          </div>
          
          {listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {listings.map((listing) => (
                <Card key={listing.id} className="relative overflow-hidden p-4">
                  <button 
                    onClick={() => handleDeleteListing(listing.id)}
                    className="absolute top-2 right-2 bg-error/10 text-error p-1 rounded-full hover:bg-error/20 transition-colors"
                    title="Delete listing"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  
                  <div className="h-40 bg-bg-secondary mb-4 rounded-md overflow-hidden">
                    {listing.images && listing.images[0] ? (
                      <img 
                        src={listing.images[0]} 
                        alt={listing.custom_apartment || 'Apartment'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-secondary">
                        No Image
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    {listing.custom_apartment || 
                     (listing.apartment_id && apartments.find(a => a.id === listing.apartment_id)?.name) ||
                     'Apartment'}
                  </h3>
                  <p className="text-text-secondary text-sm mb-2">
                    {listing.apartment_id && apartments.find(a => a.id === listing.apartment_id)?.address}
                  </p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-accent font-bold">${listing.offer_price}/mo</span>
                    <span className="text-text-secondary text-sm">
                      {new Date(listing.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 
                      {new Date(listing.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  
                  <div className="flex gap-3 text-sm text-text-secondary mb-4">
                    <span>{listing.bedrooms} {listing.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
                    <span>•</span>
                    <span>{listing.bathrooms} {listing.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link href={`/listings/${listing.id}`} className="flex-1">
                      <Button variant="secondary" fullWidth size="sm">View</Button>
                    </Link>
                    <Link href={`/listings/edit/${listing.id}`} className="flex-1">
                      <Button variant="primary" fullWidth size="sm">Edit</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12 text-text-secondary mx-auto mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-text-primary mb-2">No Listings Yet</h3>
              <p className="text-text-secondary mb-6">
                You haven't created any sublease listings yet. Create one now to find a subletter.
              </p>
              <Link href="/create">
                <Button>Create Your First Listing</Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    );
  };
  
  // Render account settings
  const renderAccountSettings = () => {
    return (
      <div className="space-y-8">
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-text-primary mb-4">Account Settings</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-text-primary mb-2">Password</h4>
              <p className="text-text-secondary mb-3">Change your account password</p>
              <Button variant="secondary" size="sm">
                Reset Password
              </Button>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-text-primary mb-2">Sign Out</h4>
              <p className="text-text-secondary mb-3">Sign out of your account</p>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleLogout}
                disabled={loading}
              >
                {loading ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-error mb-2">Delete Account</h4>
              <p className="text-text-secondary mb-3">
                Permanently delete your account and all your listings. This action cannot be undone.
              </p>
              
              {confirmDelete ? (
                <div className="space-y-3">
                  <p className="text-error font-medium">Are you sure? This cannot be undone.</p>
                  <div className="flex space-x-3">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setConfirmDelete(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={handleDeleteAccount}
                      disabled={loading}
                    >
                      {loading ? 'Deleting...' : 'Yes, Delete Account'}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="danger"
                  onClick={handleDeleteAccount}
                  fullWidth
                  className="mt-6"
                >
                  {confirmDelete ? "Yes, I&apos;m sure, delete my account" : "Delete Account"}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Your Profile</h1>
        <p className="text-text-secondary mb-8">Manage your account, listings, and preferences</p>
        
        {message && (
          <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}
        
        <div className="flex border-b border-border-light mb-6">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'listings' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-text-primary'}`}
            onClick={() => setActiveTab('listings')}
          >
            My Listings
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-text-primary'}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Info
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'settings' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-text-primary'}`}
            onClick={() => setActiveTab('settings')}
          >
            Account Settings
          </button>
        </div>
        
        <div className="mb-8">
          {activeTab === 'listings' && renderMyListings()}
          {activeTab === 'profile' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-6">Profile Information</h2>
              {profileLoading ? (
                <div className="text-center py-4">
                  <p>Loading profile data...</p>
                </div>
              ) : (
                renderProfileInfo()
              )}
            </Card>
          )}
          {activeTab === 'settings' && renderAccountSettings()}
        </div>
      </div>
    </div>
  );
} 