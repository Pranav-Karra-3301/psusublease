'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import supabase from '@/utils/supabase';

// Mock apartment data
const apartments = [
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'The Rise', address: '111 Beaver Ave, State College, PA' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', name: 'The Metropolitan', address: '400 W College Ave, State College, PA' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', name: 'The Legacy', address: '478 E Beaver Ave, State College, PA' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', name: 'Calder Commons', address: '511 E Calder Way, State College, PA' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', name: 'The Station', address: '330 W College Ave, State College, PA' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', name: 'Here State College', address: '131 Hiester St, State College, PA' },
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

export default function CreateListingForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Form state
  const [listingData, setListingData] = useState({
    apartmentId: '',
    customApartment: '',
    floorPlan: '',
    bedrooms: '1',
    bathrooms: '1',
    currentRent: '',
    offerPrice: '',
    negotiable: false,
    startDate: '',
    endDate: '',
    description: '',
    amenities: [] as string[],
    hasRoommates: false,
    roommatesStaying: false,
    genderPreference: '',
    images: [] as File[],
  });

  // Add a state for error messages
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [confirmed, setConfirmed] = useState<boolean>(false);

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
        ? listingData.amenities.filter(a => a !== amenity)
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

  // Move to next step
  const nextStep = () => {
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  // Move to previous step
  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  // Submit the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Get the authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error('Authentication error: ' + userError.message);
      }
      
      if (!user) {
        throw new Error('You must be signed in to create a listing');
      }
      
      // Format the data for submission
      const formattedData = {
        user_id: user.id,
        apartment_id: listingData.apartmentId === 'custom' ? null : listingData.apartmentId,
        custom_apartment: listingData.apartmentId === 'custom' ? listingData.customApartment : null,
        floor_plan: listingData.floorPlan,
        bedrooms: parseInt(listingData.bedrooms),
        bathrooms: parseFloat(listingData.bathrooms),
        current_rent: parseFloat(listingData.currentRent),
        offer_price: parseFloat(listingData.offerPrice),
        negotiable: listingData.negotiable,
        start_date: listingData.startDate,
        end_date: listingData.endDate,
        description: listingData.description,
        amenities: listingData.amenities,
        has_roommates: listingData.hasRoommates,
        roommates_staying: listingData.roommatesStaying,
        gender_preference: listingData.genderPreference,
      };
      
      // Insert into database
      const { error: insertError, data: insertedData } = await supabase
        .from('listings')
        .insert(formattedData)
        .select()
        .single();
      
      if (insertError) {
        console.error('Database insertion error:', insertError);
        throw new Error(`Failed to create listing: ${insertError.message}`);
      }
      
      if (!insertedData) {
        throw new Error('Failed to create listing: No data returned');
      }
      
      const listingId = insertedData.id;
      
      // Upload images if there are any
      const imageUrls = [];
      
      if (listingData.images.length > 0) {
        for (const image of listingData.images) {
          const filename = `${user.id}/${Date.now()}-${image.name}`;
          const { error: uploadError } = await supabase.storage
            .from('listing-images')
            .upload(filename, image, {
              upsert: true,
              metadata: {
                contentType: image.type,
              },
            });
          
          if (uploadError) {
            console.error('Error uploading image:', uploadError);
            continue;
          }
          
          // Get public URL
          const { data } = supabase.storage
            .from('listing-images')
            .getPublicUrl(filename);
            
          if (data) {
            imageUrls.push(data.publicUrl);
          }
        }
        
        // Update listing with image URLs if any were uploaded
        if (imageUrls.length > 0) {
          const { error: updateError } = await supabase
            .from('listings')
            .update({ 
              images: imageUrls
            })
            .eq('id', listingId);
            
          if (updateError) {
            console.error('Error updating listing with images:', updateError);
          }
        }
      }
      
      // Show success message
      setSuccess(true);
      
      // Redirect after a delay to allow user to see success message
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
      
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h2 className="text-2xl font-bold text-text-primary mb-6">Apartment Details</h2>
            
            <div className="space-y-6">
              <div>
                <Select
                  label="Select Your Apartment"
                  name="apartmentId"
                  value={listingData.apartmentId}
                  onChange={handleInputChange}
                  options={[
                    { value: '', label: 'Select an apartment...' },
                    ...apartments.map(apt => ({ 
                      value: apt.id, 
                      label: `${apt.name} - ${apt.address}` 
                    })),
                    { value: 'custom', label: 'My apartment is not listed' },
                  ]}
                />
              </div>
              
              {listingData.apartmentId === 'custom' && (
                <div className="space-y-4">
                  <Input
                    label="Apartment Name"
                    name="customApartment"
                    placeholder="e.g. The Heights"
                    value={listingData.customApartment}
                    onChange={handleInputChange}
                  />
                  
                  <Input
                    label="Address"
                    name="address"
                    placeholder="e.g. 123 College Ave, State College, PA"
                    onChange={handleInputChange}
                  />
                </div>
              )}
              
              <div>
                <Input
                  label="Floor Plan Name (if applicable)"
                  name="floorPlan"
                  placeholder="e.g. 2BR Deluxe"
                  value={listingData.floorPlan}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Bedrooms"
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
                
                <Select
                  label="Bathrooms"
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
          </>
        );
        
      case 2:
        return (
          <>
            <h2 className="text-2xl font-bold text-text-primary mb-6">Lease Details</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Current Monthly Rent ($)"
                  name="currentRent"
                  placeholder="e.g. 800"
                  value={listingData.currentRent}
                  onChange={handleInputChange}
                />
                
                <Input
                  type="number"
                  label="Your Offer Price ($)"
                  name="offerPrice"
                  placeholder="e.g. 700"
                  value={listingData.offerPrice}
                  onChange={handleInputChange}
                />
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
                <Input
                  type="date"
                  label="Lease Start Date"
                  name="startDate"
                  value={listingData.startDate}
                  onChange={handleInputChange}
                />
                
                <Input
                  type="date"
                  label="Lease End Date"
                  name="endDate"
                  value={listingData.endDate}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-primary block mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={listingData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your apartment, highlight special features, explain why you're subleasing, etc."
                  className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-accent transition-all duration-200"
                />
              </div>
            </div>
          </>
        );
        
      case 3:
        return (
          <>
            <h2 className="text-2xl font-bold text-text-primary mb-6">Amenities & Features</h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-text-primary block mb-2">
                  Select all amenities that apply
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {amenityOptions.map((amenity) => (
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
                        <Select
                          label="Gender Preference (if applicable)"
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
          </>
        );
        
      case 4:
        return (
          <>
            <h2 className="text-2xl font-bold text-text-primary mb-6">Listing Images</h2>
            
            <div className="space-y-6">
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
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Uploaded Images</h3>
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
            </div>
          </>
        );
        
      case 5:
        return (
          <>
            <h2 className="text-2xl font-bold text-text-primary mb-6">Review & Submit</h2>
            
            <div className="space-y-6">
              <Card variant="glass">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Apartment Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Apartment:</span>
                    <span className="text-text-primary">
                      {listingData.apartmentId === 'custom' 
                        ? listingData.customApartment 
                        : apartments.find(a => a.id === listingData.apartmentId)?.name || 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Floor Plan:</span>
                    <span className="text-text-primary">{listingData.floorPlan || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Bedrooms:</span>
                    <span className="text-text-primary">{listingData.bedrooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Bathrooms:</span>
                    <span className="text-text-primary">{listingData.bathrooms}</span>
                  </div>
                </div>
              </Card>
              
              <Card variant="glass">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Lease Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Current Rent:</span>
                    <span className="text-text-primary">${listingData.currentRent}/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Offer Price:</span>
                    <span className="text-accent font-semibold">${listingData.offerPrice}/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Negotiable:</span>
                    <span className="text-text-primary">{listingData.negotiable ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Lease Period:</span>
                    <span className="text-text-primary">
                      {listingData.startDate && listingData.endDate 
                        ? `${new Date(listingData.startDate).toLocaleDateString()} - ${new Date(listingData.endDate).toLocaleDateString()}`
                        : 'Not specified'}
                    </span>
                  </div>
                </div>
                {listingData.description && (
                  <div className="mt-4 pt-4 border-t border-border-light">
                    <span className="text-text-secondary block mb-2">Description:</span>
                    <p className="text-text-primary text-sm">{listingData.description}</p>
                  </div>
                )}
              </Card>
              
              {listingData.amenities.length > 0 && (
                <Card variant="glass">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Amenities</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {listingData.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 text-accent">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-text-primary text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              
              {listingData.hasRoommates && (
                <Card variant="glass">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Roommate Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Roommates Staying:</span>
                      <span className="text-text-primary">{listingData.roommatesStaying ? 'Yes' : 'No'}</span>
                    </div>
                    {listingData.genderPreference && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Gender Preference:</span>
                        <span className="text-text-primary">{listingData.genderPreference}</span>
                      </div>
                    )}
                  </div>
                </Card>
              )}
              
              <Card variant="glass">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Images</h3>
                {listingData.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {listingData.images.map((image, index) => (
                      <div key={index} className="h-24 bg-bg-secondary rounded-lg overflow-hidden">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary">No images uploaded</p>
                )}
              </Card>
              
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="confirm"
                    className="w-4 h-4 accent-accent mt-1"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                  />
                  <label htmlFor="confirm" className="text-text-secondary text-sm">
                    I confirm that all information provided is accurate and I am authorized to sublease this apartment. I understand that PSU Sublease is only a listing platform and does not handle any financial transactions or legal agreements between parties.
                  </label>
                </div>
              </div>
            </div>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
          <p className="font-medium mb-1">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md">
          <p className="font-medium mb-1">Success!</p>
          <p>Your listing was created successfully. Redirecting to your profile...</p>
        </div>
      )}
      
      <Card variant="default" className="mb-8">
        {renderStepContent()}
      </Card>
      
      <div className="flex justify-between mt-8">
        {step > 1 && (
          <Button
            type="button"
            variant="secondary"
            onClick={prevStep}
            disabled={isLoading}
          >
            Previous
          </Button>
        )}
        
        {step < 5 ? (
          <Button
            type="button"
            onClick={nextStep}
            className="ml-auto"
            disabled={
              (step === 1 && !listingData.apartmentId) ||
              (step === 2 && (!listingData.currentRent || !listingData.offerPrice || !listingData.startDate || !listingData.endDate))
            }
          >
            Next
          </Button>
        ) : (
          <Button
            type="submit"
            isLoading={isLoading}
            className="ml-auto"
            disabled={!confirmed}
          >
            Submit Listing
          </Button>
        )}
      </div>
      
      <div className="flex justify-center mt-6">
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`w-3 h-3 rounded-full ${
                step === stepNumber
                  ? 'bg-accent'
                  : step > stepNumber
                  ? 'bg-accent/50'
                  : 'bg-border-light'
              }`}
            />
          ))}
        </div>
      </div>
    </form>
  );
} 