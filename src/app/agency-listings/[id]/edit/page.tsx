'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import supabase from '@/utils/supabase';
import { Database } from '@/types/database.types';
import { AgencyListingWithFloorPlans, FloorPlan } from '@/types/Agency';
import { useAuthContext } from '@/components/auth/AuthProvider';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import Select from '@/components/ui/Select';

function EditAgencyListingContent() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [listing, setListing] = useState<AgencyListingWithFloorPlans | null>(null);
  
  // Form state
  const [listingData, setListingData] = useState({
    property_name: '',
    address: '',
    description: '',
    amenities: [] as string[],
    utilities_included: [] as string[],
    lease_terms: '',
    start_date: '',
    end_date: '',
    application_link: '',
    application_deadline: '',
    contact_email: '',
    contact_phone: '',
    is_active: true,
  });
  
  // New amenity and utility input states
  const [newAmenity, setNewAmenity] = useState('');
  const [newUtility, setNewUtility] = useState('');
  
  // Floor plans state
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [deletedFloorPlanIds, setDeletedFloorPlanIds] = useState<string[]>([]);
  
  // Images state
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToUpload, setImagesToUpload] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  
  // Check authentication and fetch the listing
  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    
    let isMounted = true;
    
    async function fetchListingAndCheckAuth() {
      if (!isMounted) return;
      
      setIsLoading(true);
      
      try {
        // First check if the user owns this agency listing
        const { data: agency, error: agencyError } = await supabase
          .from('agencies')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (agencyError) {
          setError('You do not have an agency registered.');
          setIsLoading(false);
          return;
        }
        
        // Query the listing with agency and floor plans data
        const { data, error } = await supabase
          .from('agency_listings')
          .select(`
            *,
            agency:agencies(*),
            floor_plans(*)
          `)
          .eq('id', id as string)
          .single();
        
        if (error) throw error;
        if (!data) return notFound();
        
        // Check if this user owns the agency that owns this listing
        if (data.agency_id !== agency.id) {
          setError('You do not have permission to edit this listing.');
          setIsLoading(false);
          return;
        }
        
        // User is authorized to edit
        setIsAuthorized(true);
        
        // Set the listing data
        if (isMounted) {
          const listingWithFloorPlans = data as unknown as AgencyListingWithFloorPlans;
          setListing(listingWithFloorPlans);
          
          // Initialize form state with listing data
          setListingData({
            property_name: listingWithFloorPlans.property_name || '',
            address: listingWithFloorPlans.address || '',
            description: listingWithFloorPlans.description || '',
            amenities: listingWithFloorPlans.amenities || [],
            utilities_included: listingWithFloorPlans.utilities_included || [],
            lease_terms: listingWithFloorPlans.lease_terms || '',
            start_date: listingWithFloorPlans.start_date ? new Date(listingWithFloorPlans.start_date).toISOString().split('T')[0] : '',
            end_date: listingWithFloorPlans.end_date ? new Date(listingWithFloorPlans.end_date).toISOString().split('T')[0] : '',
            application_link: listingWithFloorPlans.application_link || '',
            application_deadline: listingWithFloorPlans.application_deadline ? new Date(listingWithFloorPlans.application_deadline).toISOString().split('T')[0] : '',
            contact_email: listingWithFloorPlans.contact_email || '',
            contact_phone: listingWithFloorPlans.contact_phone || '',
            is_active: listingWithFloorPlans.is_active,
          });
          
          // Initialize floor plans
          if (listingWithFloorPlans.floor_plans && listingWithFloorPlans.floor_plans.length > 0) {
            setFloorPlans(listingWithFloorPlans.floor_plans as unknown as FloorPlan[]);
          }
          
          // Initialize images
          if (listingWithFloorPlans.images) {
            setExistingImages(listingWithFloorPlans.images);
          }
        }
      } catch (err) {
        console.error('Error fetching agency listing:', err);
        setError('Failed to load listing. Please try again later.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    fetchListingAndCheckAuth();
    
    return () => {
      isMounted = false;
    };
  }, [id, user, router]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setListingData(prev => ({ ...prev, [name]: checked }));
    } else {
      setListingData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle amenities
  const addAmenity = () => {
    if (newAmenity.trim() === '') return;
    
    if (!listingData.amenities.includes(newAmenity.trim())) {
      setListingData(prev => ({ 
        ...prev, 
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
    }
    
    setNewAmenity('');
  };
  
  const removeAmenity = (index: number) => {
    setListingData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };
  
  // Handle utilities
  const addUtility = () => {
    if (newUtility.trim() === '') return;
    
    if (!listingData.utilities_included.includes(newUtility.trim())) {
      setListingData(prev => ({
        ...prev,
        utilities_included: [...prev.utilities_included, newUtility.trim()]
      }));
    }
    
    setNewUtility('');
  };
  
  const removeUtility = (index: number) => {
    setListingData(prev => ({
      ...prev,
      utilities_included: prev.utilities_included.filter((_, i) => i !== index)
    }));
  };
  
  // Handle images
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    setImagesToUpload(prev => [...prev, ...newFiles]);
  };
  
  const removeUploadedImage = (index: number) => {
    setImagesToUpload(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeExistingImage = (url: string) => {
    setExistingImages(prev => prev.filter(image => image !== url));
    setImagesToDelete(prev => [...prev, url]);
  };
  
  // Handle floor plans
  const addFloorPlan = () => {
    const newFloorPlan: FloorPlan = {
      id: `new-${Date.now()}`,
      agency_listing_id: id as string,
      name: '',
      bedrooms: 1,
      bathrooms: 1,
      square_feet: null,
      price: 0,
      availability: 1,
      description: '',
      images: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setFloorPlans(prev => [...prev, newFloorPlan]);
  };
  
  const removeFloorPlan = (index: number) => {
    const floorPlan = floorPlans[index];
    
    // If it's an existing floor plan, add to delete list
    if (!floorPlan.id.toString().startsWith('new-')) {
      setDeletedFloorPlanIds(prev => [...prev, floorPlan.id.toString()]);
    }
    
    setFloorPlans(prev => prev.filter((_, i) => i !== index));
  };
  
  const updateFloorPlan = (index: number, field: string, value: any) => {
    setFloorPlans(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !listing) return;
    
    // Validation
    if (!listingData.property_name.trim()) {
      setError('Property name is required');
      return;
    }
    
    if (!listingData.address.trim()) {
      setError('Address is required');
      return;
    }
    
    if (!listingData.start_date) {
      setError('Start date is required');
      return;
    }
    
    // Additional validation for floor plans
    for (let i = 0; i < floorPlans.length; i++) {
      const plan = floorPlans[i];
      if (!plan.name.trim()) {
        setError(`Floor plan #${i + 1} name is required`);
        return;
      }
      if (plan.price <= 0) {
        setError(`Floor plan #${i + 1} price must be greater than 0`);
        return;
      }
    }
    
    setIsSaving(true);
    setError('');
    
    try {
      // 1. Upload new images if any
      let newImageUrls: string[] = [];
      
      if (imagesToUpload.length > 0) {
        for (const image of imagesToUpload) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${listing.agency_id}-property-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(fileName, image);
          
          if (uploadError) throw uploadError;
          
          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('property-images')
            .getPublicUrl(fileName);
          
          newImageUrls.push(publicUrl);
        }
      }
      
      // 2. Update the listing
      const updatedListing = {
        property_name: listingData.property_name,
        address: listingData.address,
        description: listingData.description || null,
        amenities: listingData.amenities.length > 0 ? listingData.amenities : null,
        utilities_included: listingData.utilities_included.length > 0 ? listingData.utilities_included : null,
        lease_terms: listingData.lease_terms || null,
        start_date: listingData.start_date,
        end_date: listingData.end_date || null,
        application_link: listingData.application_link || null,
        application_deadline: listingData.application_deadline || null,
        contact_email: listingData.contact_email || null,
        contact_phone: listingData.contact_phone || null,
        is_active: listingData.is_active,
        images: [...existingImages, ...newImageUrls],
        updated_at: new Date().toISOString(),
      };
      
      const { error: updateListingError } = await supabase
        .from('agency_listings')
        .update(updatedListing)
        .eq('id', id);
      
      if (updateListingError) throw updateListingError;
      
      // 3. Delete floor plans that were removed
      if (deletedFloorPlanIds.length > 0) {
        const { error: deleteFloorPlansError } = await supabase
          .from('floor_plans')
          .delete()
          .in('id', deletedFloorPlanIds);
        
        if (deleteFloorPlansError) throw deleteFloorPlansError;
      }
      
      // 4. Update or insert floor plans
      for (const plan of floorPlans) {
        // Check if it's a new floor plan (ID starts with 'new-')
        const isNew = plan.id.toString().startsWith('new-');
        
        const floorPlanData = {
          agency_listing_id: id,
          name: plan.name,
          bedrooms: plan.bedrooms,
          bathrooms: plan.bathrooms,
          square_feet: plan.square_feet,
          price: plan.price,
          availability: plan.availability,
          description: plan.description || null,
          images: plan.images,
          updated_at: new Date().toISOString(),
        };
        
        if (isNew) {
          // Insert new floor plan
          const { error: insertFloorPlanError } = await supabase
            .from('floor_plans')
            .insert({
              ...floorPlanData,
              created_at: new Date().toISOString(),
            });
          
          if (insertFloorPlanError) throw insertFloorPlanError;
        } else {
          // Update existing floor plan
          const { error: updateFloorPlanError } = await supabase
            .from('floor_plans')
            .update(floorPlanData)
            .eq('id', plan.id);
          
          if (updateFloorPlanError) throw updateFloorPlanError;
        }
      }
      
      // 5. Delete any images from storage that were removed
      // In a real implementation, you'd also want to remove the actual files from storage
      
      setSuccess(true);
      
      // Redirect back to listing page after a short delay
      setTimeout(() => {
        router.push(`/agency-listings/${id}`);
      }, 2000);
    } catch (err: any) {
      console.error('Error updating listing:', err);
      setError(err.message || 'Failed to update listing');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 w-1/3 rounded-lg bg-bg-secondary"></div>
          <div className="h-[500px] rounded-lg bg-bg-secondary"></div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error && !isAuthorized) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card variant="glass" className="p-8">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Error</h1>
          <p className="text-text-secondary mb-6">{error}</p>
          <Link href="/agency/dashboard">
            <Button variant="primary">Return to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }
  
  // Show 404 if listing not found
  if (!listing) {
    return notFound();
  }
  
  // Show success message
  if (success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card variant="glass" className="p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-16 h-16 text-accent mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h1 className="text-2xl font-bold text-text-primary mb-4">Listing Updated Successfully</h1>
          <p className="text-text-secondary mb-6">Your property listing has been updated.</p>
          <div className="flex justify-center space-x-4">
            <Link href={`/agency-listings/${id}`}>
              <Button variant="primary">View Listing</Button>
            </Link>
            <Link href="/agency/dashboard">
              <Button variant="secondary">Return to Dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href={`/agency-listings/${id}`} className="flex items-center text-text-secondary hover:text-text-primary transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Listing
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-text-primary mb-8">Edit Property Listing</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg text-error">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Property Details Section */}
        <Card variant="glass" className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Property Details</h2>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="property_name">Property Name*</Label>
              <Input
                id="property_name"
                name="property_name"
                value={listingData.property_name}
                onChange={handleInputChange}
                placeholder="Enter property name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="address">Address*</Label>
              <Input
                id="address"
                name="address"
                value={listingData.address}
                onChange={handleInputChange}
                placeholder="Enter full address"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={listingData.description}
                onChange={handleInputChange}
                placeholder="Describe your property"
                rows={5}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={listingData.is_active}
                onChange={handleInputChange}
                className="h-5 w-5 text-accent rounded border-gray-300 focus:ring-accent"
              />
              <Label htmlFor="is_active" className="mb-0">Active Listing</Label>
            </div>
          </div>
        </Card>
        
        {/* Images Section */}
        <Card variant="glass" className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Property Images</h2>
          
          {/* Existing images */}
          {existingImages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-text-primary mb-2">Current Images</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {existingImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video w-full rounded-lg bg-bg-secondary overflow-hidden">
                      <img src={url} alt={`Property ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExistingImage(url)}
                      className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-error hover:bg-white transition-colors"
                      aria-label="Remove image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* New images to upload */}
          {imagesToUpload.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-text-primary mb-2">New Images</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imagesToUpload.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video w-full rounded-lg bg-bg-secondary overflow-hidden">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`Upload preview ${index + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeUploadedImage(index)}
                      className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-error hover:bg-white transition-colors"
                      aria-label="Remove image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Image upload */}
          <div className="border-2 border-dashed border-border-light rounded-lg p-6 text-center">
            <label htmlFor="image-upload" className="cursor-pointer block">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12 mx-auto text-text-secondary mb-2">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-text-secondary">Click to upload property images</span>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </Card>
        
        {/* Lease Details Section */}
        <Card variant="glass" className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Lease Details</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="start_date">Available From*</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={listingData.start_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="end_date">Lease End Date</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={listingData.end_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="lease_terms">Lease Terms</Label>
              <textarea
                id="lease_terms"
                name="lease_terms"
                value={listingData.lease_terms}
                onChange={handleInputChange}
                placeholder="Describe lease terms, policy information, etc."
                rows={4}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="application_link">Application Link</Label>
                <Input
                  id="application_link"
                  name="application_link"
                  type="url"
                  value={listingData.application_link}
                  onChange={handleInputChange}
                  placeholder="https://example.com/apply"
                />
              </div>
              
              <div>
                <Label htmlFor="application_deadline">Application Deadline</Label>
                <Input
                  id="application_deadline"
                  name="application_deadline"
                  type="date"
                  value={listingData.application_deadline}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </Card>
        
        {/* Contact Information */}
        <Card variant="glass" className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Contact Information</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  value={listingData.contact_email}
                  onChange={handleInputChange}
                  placeholder="contact@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  name="contact_phone"
                  type="tel"
                  value={listingData.contact_phone}
                  onChange={handleInputChange}
                  placeholder="(555) 555-5555"
                />
              </div>
            </div>
          </div>
        </Card>
        
        {/* Amenities Section */}
        <Card variant="glass" className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Amenities</h2>
          
          <div className="mb-6">
            <div className="flex items-end gap-2 mb-4">
              <div className="flex-grow">
                <Input
                  id="new-amenity"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="Add an amenity"
                />
              </div>
              <Button
                type="button"
                onClick={addAmenity}
                variant="secondary"
              >
                Add
              </Button>
            </div>
            
            {listingData.amenities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {listingData.amenities.map((amenity, index) => (
                  <div 
                    key={index}
                    className="bg-bg-secondary rounded-lg px-3 py-1 text-sm flex items-center"
                  >
                    <span>{amenity}</span>
                    <button
                      type="button"
                      onClick={() => removeAmenity(index)}
                      className="ml-2 text-text-secondary hover:text-error transition-colors"
                      aria-label="Remove amenity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary text-sm">No amenities added</p>
            )}
          </div>
        </Card>
        
        {/* Utilities Included Section */}
        <Card variant="glass" className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Utilities Included</h2>
          
          <div className="mb-6">
            <div className="flex items-end gap-2 mb-4">
              <div className="flex-grow">
                <Input
                  id="new-utility"
                  value={newUtility}
                  onChange={(e) => setNewUtility(e.target.value)}
                  placeholder="Add a utility"
                />
              </div>
              <Button
                type="button"
                onClick={addUtility}
                variant="secondary"
              >
                Add
              </Button>
            </div>
            
            {listingData.utilities_included.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {listingData.utilities_included.map((utility, index) => (
                  <div 
                    key={index}
                    className="bg-bg-secondary rounded-lg px-3 py-1 text-sm flex items-center"
                  >
                    <span>{utility}</span>
                    <button
                      type="button"
                      onClick={() => removeUtility(index)}
                      className="ml-2 text-text-secondary hover:text-error transition-colors"
                      aria-label="Remove utility"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary text-sm">No utilities added</p>
            )}
          </div>
        </Card>
        
        {/* Floor Plans Section */}
        <Card variant="glass" className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-text-primary">Floor Plans</h2>
            <Button
              type="button"
              onClick={addFloorPlan}
              variant="secondary"
            >
              Add Floor Plan
            </Button>
          </div>
          
          {floorPlans.length > 0 ? (
            <div className="space-y-8">
              {floorPlans.map((plan, index) => (
                <div key={index} className="border border-border-light rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-text-primary">Floor Plan #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeFloorPlan(index)}
                      className="text-error hover:text-error/80 transition-colors"
                      aria-label="Remove floor plan"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor={`floor-plan-name-${index}`}>Floor Plan Name*</Label>
                      <Input
                        id={`floor-plan-name-${index}`}
                        value={plan.name}
                        onChange={(e) => updateFloorPlan(index, 'name', e.target.value)}
                        placeholder="e.g. Studio, 1-Bedroom Deluxe"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`floor-plan-price-${index}`}>Monthly Rent (USD)*</Label>
                      <Input
                        id={`floor-plan-price-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={plan.price}
                        onChange={(e) => updateFloorPlan(index, 'price', parseFloat(e.target.value))}
                        placeholder="e.g. 1200"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label htmlFor={`floor-plan-bedrooms-${index}`}>Bedrooms*</Label>
                      <Input
                        id={`floor-plan-bedrooms-${index}`}
                        type="number"
                        min="0"
                        value={plan.bedrooms}
                        onChange={(e) => updateFloorPlan(index, 'bedrooms', parseInt(e.target.value))}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`floor-plan-bathrooms-${index}`}>Bathrooms*</Label>
                      <Input
                        id={`floor-plan-bathrooms-${index}`}
                        type="number"
                        min="0"
                        step="0.5"
                        value={plan.bathrooms}
                        onChange={(e) => updateFloorPlan(index, 'bathrooms', parseFloat(e.target.value))}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`floor-plan-sqft-${index}`}>Square Feet</Label>
                      <Input
                        id={`floor-plan-sqft-${index}`}
                        type="number"
                        min="0"
                        value={plan.square_feet || ''}
                        onChange={(e) => updateFloorPlan(
                          index, 
                          'square_feet', 
                          e.target.value ? parseInt(e.target.value) : null
                        )}
                        placeholder="e.g. 750"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor={`floor-plan-availability-${index}`}>Units Available</Label>
                      <Input
                        id={`floor-plan-availability-${index}`}
                        type="number"
                        min="0"
                        value={plan.availability || ''}
                        onChange={(e) => updateFloorPlan(
                          index, 
                          'availability', 
                          e.target.value ? parseInt(e.target.value) : null
                        )}
                        placeholder="e.g. 3"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`floor-plan-description-${index}`}>Description</Label>
                    <textarea
                      id={`floor-plan-description-${index}`}
                      value={plan.description || ''}
                      onChange={(e) => updateFloorPlan(index, 'description', e.target.value)}
                      placeholder="Describe this floor plan"
                      rows={3}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-center py-8">No floor plans added yet. Add your first floor plan to provide pricing and layout information.</p>
          )}
        </Card>
        
        {/* Submit Section */}
        <div className="flex justify-between items-center">
          <Link href={`/agency-listings/${id}`}>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
          
          <Button
            type="submit"
            isLoading={isSaving}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function EditAgencyListingPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Loading edit form...</div>}>
      <EditAgencyListingContent />
    </Suspense>
  );
} 