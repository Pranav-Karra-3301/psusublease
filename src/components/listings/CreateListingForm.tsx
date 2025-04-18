'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import supabase from '@/utils/supabase';
import ApartmentSearchInput from '@/components/ui/ApartmentSearchInput';
import { useApartments } from '@/hooks/useApartments';
import { useListings } from '@/hooks/useListings';
import { Label } from '@/components/ui/Label';
import { SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';

// Default apartments for fallback
const defaultApartments = [
  { id: 'custom', name: 'My apartment is not listed', address: '', website: '', defaultImage: '/apt_defaults/default.png' }
];

// Amenities options
const amenityOptions = [
  'In-unit Washer/Dryer',
  'Fully Furnished',
  'Gym Access',
  'Pool',
  'High-Speed Internet',
  'Parking Included',
  'Cable TV Included',
  'Utilities Included',
  'Pet Friendly',
  'Balcony/Patio',
  'Air Conditioning',
  'Dishwasher',
  'Security System',
  'Study Room',
  'Bus Route',
];

// Define the component props to include initialData and isEditMode
interface CreateListingFormProps {
  initialData?: any;
  isEditMode?: boolean;
}

export default function CreateListingForm({ initialData, isEditMode = false }: CreateListingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [apartments, setApartments] = useState(defaultApartments);
  const { getApartments } = useApartments();
  const { createListing, updateListing } = useListings();
  
  // Enable custom apartment only mode as a fallback for reliable operation
  const [customApartmentOnly, setCustomApartmentOnly] = useState(true);

  // Check for autofill query parameter only once on component mount
  useEffect(() => {
    // Only run this effect once during initial component mount
    const params = new URLSearchParams(window.location.search);
    const shouldAutofill = params.get('autofill') === 'true';
    
    // If autofill=true is in the URL and we're not in edit mode, set step to 0 (autofill step)
    if (shouldAutofill && !isEditMode) {
      setStep(0);
    } else if (isEditMode) {
      // Skip the autofill step in edit mode
      setStep(1);
    }
    // Only run this effect once on component mount, not on URL changes
  }, [isEditMode]);

  // Debug the initialData
  useEffect(() => {
    if (initialData && isEditMode) {
      console.log('Edit mode with initialData:', initialData);
    }
  }, [initialData, isEditMode]);

  // Fetch apartments from database
  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const { data, error } = await getApartments();
        if (error) {
          console.error('Error fetching apartments:', error);
          // Fallback to default apartments on error
          setApartments(defaultApartments);
          return;
        }
        
        if (data && data.length > 0) {
          // Transform data to include defaultImage and ensure type compatibility
          const transformedData = data.map(apt => ({
            id: apt.id,  // Use the actual database ID
            name: apt.name || 'Unknown',  // Ensure name exists
            address: apt.address || '',  // Ensure address exists
            website: apt.website || '',  // Ensure website exists
            defaultImage: '/apt_defaults/default.png'
          }));
          setApartments(transformedData);
        } else {
          // Fallback to default apartments if no data returned
          setApartments(defaultApartments);
        }
      } catch (err) {
        console.error('Error in fetchApartments:', err);
        // Fallback to default apartments on any error
        setApartments(defaultApartments);
      }
    };

    fetchApartments();
  }, [getApartments]);

  // Form state - initialize with initialData if provided
  const [listingData, setListingData] = useState({
    apartmentId: initialData ? (initialData.apartment_id || 'custom') : 'custom',
    customApartment: initialData ? (initialData.custom_apartment || '') : '',
    floorPlan: initialData ? (initialData.floor_plan || '') : '',
    bedrooms: initialData ? initialData.bedrooms.toString() : '1',
    bathrooms: initialData ? initialData.bathrooms.toString() : '1',
    privateRoom: initialData ? !!initialData.private_bathroom : false,
    currentRent: initialData ? initialData.current_rent.toString() : '',
    offerPrice: initialData ? initialData.offer_price.toString() : '',
    negotiable: initialData ? initialData.negotiable : false,
    startDate: initialData ? initialData.start_date : '',
    endDate: initialData ? initialData.end_date : '',
    description: initialData ? (initialData.description || '') : '',
    amenities: initialData ? (initialData.amenities || []) : [] as string[],
    hasRoommates: initialData ? initialData.has_roommates : false,
    roommatesStaying: initialData ? initialData.roommates_staying : false,
    genderPreference: initialData ? (initialData.gender_preference || '') : '',
    images: [] as File[],
  });

  // Add autofill-specific states
  const [autofillText, setAutofillText] = useState('');
  const [autofillImage, setAutofillImage] = useState<File | null>(null);
  const [autofillPreview, setAutofillPreview] = useState<string | null>(null);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [autofillError, setAutofillError] = useState<string | null>(null);

  // Add a state for error messages
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [confirmed, setConfirmed] = useState<boolean>(false);

  // Add a state to track existing images in edit mode
  const [existingImages, setExistingImages] = useState<string[]>(
    initialData && initialData.images ? initialData.images : []
  );

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      setListingData({
        ...listingData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setListingData({
        ...listingData,
        [name]: value,
      });
    }
  };

  // Handle amenity selection
  const handleAmenityToggle = (amenity: string) => {
    setListingData({
      ...listingData,
      amenities: listingData.amenities.includes(amenity)
        ? listingData.amenities.filter((a: string) => a !== amenity)
        : [...listingData.amenities, amenity],
    });
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      setListingData({
        ...listingData,
        images: [...listingData.images, ...fileArray],
      });
    }
  };

  // Remove uploaded image
  const removeImage = (index: number) => {
    setListingData({
      ...listingData,
      images: listingData.images.filter((_, i) => i !== index),
    });
  };

  // Handle autofill text input
  const handleAutofillTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAutofillText(e.target.value);
  };

  // Handle autofill image upload
  const handleAutofillImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAutofillImage(file);
      setAutofillPreview(URL.createObjectURL(file));
    }
  };

  // Remove autofill image
  const removeAutofillImage = () => {
    if (autofillPreview) {
      URL.revokeObjectURL(autofillPreview);
    }
    setAutofillImage(null);
    setAutofillPreview(null);
  };

  // Submit autofill data to API and update form
  const handleAutofill = async () => {
    // Validate input
    if (!autofillText && !autofillImage) {
      setAutofillError('Please provide either a message or upload a screenshot');
      return;
    }

    setIsAutofilling(true);
    setAutofillError(null);

    try {
      // Create form data
      const formData = new FormData();
      if (autofillText) {
        formData.append('text', autofillText);
      }
      if (autofillImage) {
        formData.append('image', autofillImage);
      }

      // Call the API
      const response = await fetch('/api/autofill-listing', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process autofill request');
      }

      const data = await response.json();

      // Update form data with AI-generated values
      setListingData(prevData => {
        // Only update fields that have values in the response
        const newData = { ...prevData };
        
        // Update fields if they exist in the response
        if (data.apartmentId) newData.apartmentId = data.apartmentId;
        if (data.customApartment) newData.customApartment = data.customApartment;
        if (data.floorPlan) newData.floorPlan = data.floorPlan;
        if (data.bedrooms) newData.bedrooms = data.bedrooms.toString();
        if (data.bathrooms) newData.bathrooms = data.bathrooms.toString();
        if (data.privateRoom !== undefined) newData.privateRoom = data.privateRoom;
        if (data.currentRent) newData.currentRent = data.currentRent.toString();
        if (data.offerPrice) newData.offerPrice = data.offerPrice.toString();
        if (data.negotiable !== undefined) newData.negotiable = data.negotiable;
        if (data.startDate) newData.startDate = data.startDate;
        if (data.endDate) newData.endDate = data.endDate;
        if (data.description) newData.description = data.description;
        if (data.amenities && data.amenities.length > 0) newData.amenities = data.amenities;
        if (data.hasRoommates !== undefined) newData.hasRoommates = data.hasRoommates;
        if (data.roommatesStaying !== undefined) newData.roommatesStaying = data.roommatesStaying;
        if (data.genderPreference) newData.genderPreference = data.genderPreference;
        
        return newData;
      });

      // Move to next step
      nextStep();
    } catch (error) {
      console.error('Autofill error:', error);
      setAutofillError('Failed to process your information. Please try again or fill in the form manually.');
    } finally {
      setIsAutofilling(false);
    }
  };

  // Skip autofill
  const skipAutofill = () => {
    // Skip the autofill step and go directly to the apartment details step
    setStep(1);
    setAutofillText('');
    setAutofillImage(null);
    setAutofillPreview(null);
  };

  // Move to next step
  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  // Move to previous step
  const prevStep = () => {
    if (step > 0) {
      // If we're in edit mode, don't go back to autofill step
      if (isEditMode && step === 1) {
        return;
      }
      setStep(step - 1);
    }
  };

  // Submit the form - modified to handle both create and edit operations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Get the authenticated user
      let user;
      try {
        const { data, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw new Error('Authentication error: ' + userError.message);
        }
        
        user = data.user;
        if (!user) {
          throw new Error('You must be signed in to create a listing');
        }
      } catch (authError) {
        console.error('Authentication error:', authError);
        setError('Authentication failed. Please sign in again and retry.');
        setIsLoading(false);
        return;
      }
      
      // Validate required fields
      if (!listingData.apartmentId) {
        throw new Error('Please select an apartment');
      }
      
      if (listingData.apartmentId === 'custom' && !listingData.customApartment) {
        throw new Error('Please enter an apartment name');
      }
      
      if (!listingData.startDate || !listingData.endDate) {
        throw new Error('Please enter lease start and end dates');
      }
      
      // Validate numeric fields
      const currentRent = parseFloat(listingData.currentRent);
      if (isNaN(currentRent) || currentRent <= 0) {
        throw new Error('Please enter a valid current rent amount');
      }
      
      const offerPrice = parseFloat(listingData.offerPrice);
      if (isNaN(offerPrice) || offerPrice <= 0) {
        throw new Error('Please enter a valid offer price');
      }
      
      // Prepare the listing data to exactly match the database schema
      const listingToUpload: any = {
        user_id: user.id,
        apartment_id: null, // No apartment reference - always using custom
        custom_apartment: listingData.customApartment,
        floor_plan: listingData.floorPlan || 'Standard', // Default value since it's required
        bedrooms: parseInt(listingData.bedrooms),
        bathrooms: parseFloat(listingData.bathrooms),
        current_rent: currentRent,
        offer_price: offerPrice,
        negotiable: listingData.negotiable,
        start_date: listingData.startDate,
        end_date: listingData.endDate,
        description: listingData.description || '',
        amenities: listingData.amenities.length > 0 ? listingData.amenities : null,
        has_roommates: listingData.hasRoommates,
        roommates_staying: listingData.hasRoommates ? listingData.roommatesStaying : null,
        gender_preference: listingData.hasRoommates && listingData.genderPreference ? listingData.genderPreference : null,
        updated_at: new Date().toISOString(),
      };

      // If not in edit mode, add created_at field
      if (!isEditMode) {
        listingToUpload.created_at = new Date().toISOString();
      }

      // Double-check for any null/undefined values that might cause issues
      Object.keys(listingToUpload).forEach(key => {
        if (listingToUpload[key] === undefined) {
          listingToUpload[key] = null;
        }
      });
      
      // Initialize images with existing images in edit mode
      const finalImages = [...existingImages];
      
      // Upload new images if present
      if (listingData.images.length > 0) {
        try {
          const imageUrls = [];
          
          for (const image of listingData.images) {
            // Generate a unique file name
            const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${image.name.split('.').pop()}`;
            
            // Upload the image to storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('listing-images')
              .upload(fileName, image);
            
            if (uploadError) {
              console.error('Error uploading image:', uploadError);
              continue; // Skip this image if upload fails
            }
            
            // Get the public URL
            const { data: urlData } = await supabase.storage
              .from('listing-images')
              .getPublicUrl(fileName);
            
            if (urlData && urlData.publicUrl) {
              imageUrls.push(urlData.publicUrl);
            }
          }
          
          // Combine new images with existing ones
          finalImages.push(...imageUrls);
        } catch (imageError) {
          console.error('Error processing images:', imageError);
        }
      }
      
      // Add images to the listing data
      listingToUpload.images = finalImages.length > 0 ? finalImages : [];
      
      // Insert or update the listing in the database
      try {
        let result;
        
        if (isEditMode && initialData) {
          // Update existing listing
          const { data: updateData, error: updateError } = await updateListing(
            initialData.id,
            listingToUpload
          );
          
          if (updateError) {
            throw new Error(`Error updating listing: ${updateError}`);
          }
          
          result = updateData;
        } else {
          // Insert new listing using the createListing function from the hook
          console.log('Submitting listing data:', listingToUpload);
          const { data: insertData, error: insertError } = await createListing(listingToUpload);
          
          if (insertError) {
            console.error('Detailed error info:', insertError);
            throw new Error(`Error creating listing: ${insertError}`);
          }
          
          result = insertData;
        }
        
        setSuccess(true);
        
        // Redirect after a short delay
        setTimeout(() => {
          if (isEditMode) {
            router.push(`/listings/${initialData.id}`);
          } else {
            router.push('/profile');
          }
        }, 2000);
      } catch (dbError: any) {
        console.error('Database operation error:', dbError);
        setError(dbError.message || 'Failed to save listing. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
      console.error('Form submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove existing image in edit mode
  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  // Render the basic info step
  const renderBasicInfoStep = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="apartment_building">Apartment Building</Label>
            <Input
              id="apartment_building"
              name="customApartment"
              value={listingData.customApartment}
              onChange={handleInputChange}
              placeholder="e.g. Campus Commons"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="floorPlan">Floor Plan (Optional)</Label>
              <Input
                id="floorPlan"
                name="floorPlan"
                value={listingData.floorPlan}
                onChange={handleInputChange}
                placeholder="e.g. 2-bedroom deluxe"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Select
                name="bedrooms"
                value={listingData.bedrooms}
                onChange={handleInputChange}
                options={[
                  { value: '1', label: '1 Bedroom' },
                  { value: '2', label: '2 Bedrooms' },
                  { value: '3', label: '3 Bedrooms' },
                  { value: '4', label: '4 Bedrooms' },
                  { value: '5', label: '5+ Bedrooms' },
                ]}
              />
            </div>
            <div>
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Select
                name="bathrooms"
                value={listingData.bathrooms}
                onChange={handleInputChange}
                options={[
                  { value: '1', label: '1 Bathroom' },
                  { value: '1.5', label: '1.5 Bathrooms' },
                  { value: '2', label: '2 Bathrooms' },
                  { value: '2.5', label: '2.5 Bathrooms' },
                  { value: '3', label: '3 Bathrooms' },
                  { value: '3.5', label: '3.5+ Bathrooms' },
                ]}
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="private-bathroom"
                name="privateRoom"
                checked={listingData.privateRoom}
                onChange={(e) => {
                  setListingData({
                    ...listingData,
                    privateRoom: e.target.checked,
                  });
                }}
                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="private-bathroom" className="ml-2 block text-sm text-text-primary">
                Private Bathroom
              </label>
            </div>
            <span className="text-xs text-text-secondary mt-1 block">
              Check if the room being subleased has its own private bathroom
            </span>
          </div>
        </div>
      </div>
    );
  };
  
  // Render the autofill step
  const renderAutofillStep = () => {
    return (
      <>
        <h2 className="text-2xl font-bold text-text-primary mb-6">Quick Autofill</h2>
        
        <div className="space-y-6">
          <p className="text-text-secondary">
            Save time by letting AI autofill your listing! Paste the message you shared on social media or upload a screenshot from Instagram, Snapchat, or group chats.
          </p>
          
          <div className="space-y-4">
            <label className="text-sm font-medium text-text-primary block mb-2">
              Message you shared (optional)
            </label>
            <textarea
              rows={4}
              value={autofillText}
              onChange={handleAutofillTextChange}
              placeholder="Paste the text from your social media post or group chat message here..."
              className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-accent transition-all duration-200"
            />
          </div>
          
          <div>
            <p className="text-sm font-medium text-text-primary mb-4">
              Upload a screenshot (optional)
            </p>
            
            {!autofillPreview ? (
              <Card variant="default" className="p-8 text-center">
                <input
                  type="file"
                  id="autofill-image"
                  accept="image/*"
                  onChange={handleAutofillImageUpload}
                  className="hidden"
                />
                <label htmlFor="autofill-image" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12 text-accent mb-4">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-text-primary font-medium mb-1">Click to upload a screenshot</p>
                    <p className="text-text-secondary text-sm">From Instagram, Snapchat, or group chats</p>
                  </div>
                </label>
              </Card>
            ) : (
              <div className="relative">
                <img
                  src={autofillPreview}
                  alt="Preview"
                  className="w-full max-h-80 object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeAutofillImage}
                  className="absolute top-2 right-2 bg-bg-secondary bg-opacity-75 rounded-full p-1 text-error"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          {autofillError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md">
              {autofillError}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              onClick={handleAutofill}
              isLoading={isAutofilling}
              disabled={isAutofilling || (!autofillText && !autofillImage)}
              className="flex-1"
            >
              {isAutofilling ? 'Processing...' : 'Autofill with AI'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={skipAutofill}
              className="flex-1"
            >
              Skip & Fill Manually
            </Button>
          </div>
        </div>
      </>
    );
  };

  // Render the lease details step
  const renderLeaseStep = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currentRent">Current Monthly Rent ($)</Label>
            <Input
              type="number"
              id="currentRent"
              name="currentRent"
              placeholder="e.g. 800"
              value={listingData.currentRent}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <Label htmlFor="offerPrice">Your Offer Price ($)</Label>
            <Input
              type="number"
              id="offerPrice"
              name="offerPrice"
              placeholder="e.g. 700"
              value={listingData.offerPrice}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="negotiable"
            name="negotiable"
            checked={listingData.negotiable}
            onChange={handleInputChange}
            className="w-4 h-4 accent-accent"
          />
          <label htmlFor="negotiable" className="text-text-primary">
            Price is negotiable
          </label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Lease Start Date</Label>
            <Input
              type="date"
              id="startDate"
              name="startDate"
              value={listingData.startDate}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <Label htmlFor="endDate">Lease End Date</Label>
            <Input
              type="date"
              id="endDate"
              name="endDate"
              value={listingData.endDate}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={listingData.description}
            onChange={handleInputChange}
            placeholder="Describe your apartment, highlight special features, explain why you're subleasing, etc."
            className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-accent transition-all duration-200"
          />
        </div>
      </div>
    );
  };

  // Render amenities and details step
  const renderDetailsStep = () => {
    return (
      <div className="space-y-6">
        <div>
          <Label>Select all amenities that apply</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {amenityOptions.map((amenity: string) => (
              <div key={amenity} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={amenity}
                  checked={listingData.amenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="w-4 h-4 accent-accent"
                />
                <label htmlFor={amenity} className="text-text-primary">
                  {amenity}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t border-border-light pt-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Roommate Situation</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasRoommates"
                name="hasRoommates"
                checked={listingData.hasRoommates}
                onChange={handleInputChange}
                className="w-4 h-4 accent-accent"
              />
              <label htmlFor="hasRoommates" className="text-text-primary">
                This apartment has current roommates
              </label>
            </div>
            
            {listingData.hasRoommates && (
              <>
                <div className="flex items-center space-x-2 ml-6">
                  <input
                    type="checkbox"
                    id="roommatesStaying"
                    name="roommatesStaying"
                    checked={listingData.roommatesStaying}
                    onChange={handleInputChange}
                    className="w-4 h-4 accent-accent"
                  />
                  <label htmlFor="roommatesStaying" className="text-text-primary">
                    Roommates will be staying during the sublease period
                  </label>
                </div>
                
                <div className="ml-6">
                  <Label htmlFor="genderPreference">Gender Preference (if applicable)</Label>
                  <Select
                    name="genderPreference"
                    value={listingData.genderPreference}
                    onChange={handleInputChange}
                    options={[
                      { value: '', label: 'No preference' },
                      { value: 'Male', label: 'Male' },
                      { value: 'Female', label: 'Female' },
                    ]}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render the images step
  const renderImagesStep = () => {
    return (
      <div className="space-y-6">
        {existingImages.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Existing Images</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {existingImages.map((imageUrl, index) => (
                <div key={`existing-${index}`} className="relative group">
                  <div className="h-24 bg-bg-secondary rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={`Existing ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-1 right-1 bg-bg-secondary bg-opacity-75 rounded-full p-1 text-error opacity-0 group-hover:opacity-100 transition-opacity"
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
        
        <div>
          <p className="text-text-secondary mb-4">
            Upload photos of your apartment to attract more interest. Include images of the bedroom, bathroom, living area, and any special features.
          </p>
          
          <Card variant="default" className="p-8 text-center">
            <input
              type="file"
              id="images"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <label htmlFor="images" className="cursor-pointer">
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12 text-accent mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-text-primary font-medium mb-1">Click to upload images</p>
                <p className="text-text-secondary text-sm">Or drag and drop files here</p>
              </div>
            </label>
          </Card>
        </div>
        
        {listingData.images.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">New Uploaded Images</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {listingData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="h-24 bg-bg-secondary rounded-lg overflow-hidden">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-bg-secondary bg-opacity-75 rounded-full p-1 text-error opacity-0 group-hover:opacity-100 transition-opacity"
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

        {/* Confirmation checkbox */}
        <div className="mt-6 p-4 border border-border-light rounded-lg bg-bg-secondary">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="confirmation"
              checked={confirmed}
              onChange={() => setConfirmed(!confirmed)}
              className="mt-1 w-4 h-4 accent-accent"
            />
            <label htmlFor="confirmation" className="ml-2 text-text-primary">
              <p className="font-medium">I confirm that:</p>
              <ul className="list-disc ml-6 text-sm text-text-secondary mt-1 space-y-1">
                <li>I have the right to sublease this property</li>
                <li>All information provided is accurate and truthful</li>
                <li>I will respond to inquiries in a timely manner</li>
                <li>I understand that Penn State Sublease is not responsible for the verification of listings or users</li>
              </ul>
            </label>
          </div>
        </div>
      </div>
    );
  };

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 0:
        if (isEditMode) {
          return renderBasicInfoStep();
        }
        return renderAutofillStep();
      case 1:
        return renderBasicInfoStep();
      case 2:
        return renderLeaseStep();
      case 3:
        return renderDetailsStep();
      case 4:
        return renderImagesStep();
      default:
        return null;
    }
  };

  // Render step buttons
  const renderStepButtons = () => {
    if (step === 0) {
      // Autofill step - buttons are handled inside that step
      return null;
    }
    
    return (
      <div className="flex justify-between mt-8">
        {step > 0 && (
          <Button 
            type="button" 
            variant="secondary"
            onClick={prevStep}
            disabled={isLoading}
          >
            Back
          </Button>
        )}
        
        {step < 4 ? (
          <Button 
            type="button"
            onClick={nextStep}
            className="ml-auto"
          >
            Next
          </Button>
        ) : (
          <Button 
            type="submit"
            isLoading={isLoading}
            disabled={!confirmed}
            className="ml-auto"
          >
            {isEditMode ? 'Update Listing' : 'Create Listing'}
          </Button>
        )}
      </div>
    );
  };

  return (
    <Card variant="glass" className="p-6">
      {success ? (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-16 h-16 text-green-500 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            {isEditMode ? 'Listing Updated!' : 'Listing Created!'}
          </h2>
          <p className="text-text-secondary mb-6">
            {isEditMode 
              ? 'Your sublease listing has been successfully updated.'
              : 'Your sublease listing has been successfully created.'}
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => router.push('/profile')}>
              Go to Profile
            </Button>
            {!isEditMode && (
              <Button variant="secondary" onClick={() => router.push('/create')}>
                Create Another
              </Button>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Display any error messages */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          {/* Progressive Steps */}
          <div className="mb-8">
            <div className="flex justify-center gap-2 mb-4">
              {Array.from({ length: isEditMode ? 4 : 5 }).map((_, i) => {
                const stepNumber = isEditMode ? i + 1 : i;
                const isCurrentStep = step === stepNumber;
                const isCompleted = step > stepNumber;
                
                return (
                  <div 
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all ${
                      isCurrentStep 
                        ? 'bg-accent scale-125' 
                        : isCompleted 
                          ? 'bg-accent/60' 
                          : 'bg-bg-secondary border border-border-light'
                    }`}
                  />
                );
              })}
            </div>
          </div>
          
          {renderStepContent()}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > (isEditMode ? 1 : 0) && (
              <Button 
                type="button" 
                variant="secondary"
                onClick={prevStep}
                disabled={isLoading}
              >
                Back
              </Button>
            )}
            
            {step < 4 ? (
              <Button 
                type="button"
                onClick={nextStep}
                className="ml-auto"
              >
                Next
              </Button>
            ) : (
              <Button 
                type="submit"
                isLoading={isLoading}
                disabled={!confirmed}
                className="ml-auto"
              >
                {isEditMode ? 'Update Listing' : 'Create Listing'}
              </Button>
            )}
          </div>
        </form>
      )}
    </Card>
  );
} 