'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import Card from '@/components/ui/Card';
import { useAgencies } from '@/hooks/useAgencies';
import supabase from '@/utils/supabase';

// List of common amenities that can be selected
const amenityOptions = [
  'In-unit Washer/Dryer',
  'Furnished',
  'Fitness Center',
  'Pool',
  'High-Speed Internet',
  'Parking Included',
  'Cable TV Included',
  'Study Room',
  'Pet Friendly',
  'Balcony/Patio',
  'Air Conditioning',
  'Dishwasher',
  'Security System',
  'Shuttle Service',
  'Business Center',
  'Garbage Disposal',
  'Hardwood Floors',
  'Elevator',
  'Wheelchair Access',
];

// List of utilities that might be included
const utilityOptions = [
  'Water',
  'Electricity',
  'Gas',
  'Trash',
  'Sewer',
  'Internet',
  'Cable TV',
  'Heating',
];

export default function CreateAgencyListingForm() {
  const router = useRouter();
  const { createAgencyListing, fetchMyAgency } = useAgencies();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [floorPlanCount, setFloorPlanCount] = useState(1);

  // Base listing state
  const [listingData, setListingData] = useState({
    propertyName: '',
    address: '',
    description: '',
    amenities: [] as string[],
    utilitiesIncluded: [] as string[],
    leaseTerms: '',
    startDate: '',
    endDate: '',
    applicationLink: '',
    applicationDeadline: '',
    contactEmail: '',
    contactPhone: '',
    images: [] as File[],
  });

  // Floor plans state - dynamic array
  const [floorPlans, setFloorPlans] = useState([
    {
      name: '',
      bedrooms: '1',
      bathrooms: '1',
      squareFeet: '',
      price: '',
      availability: '1',
      description: '',
      images: [] as File[],
    },
  ]);

  // Handle basic listing data changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      // Nothing to do for checkboxes in this form
    } else {
      setListingData({
        ...listingData,
        [name]: value,
      });
    }
  };

  // Handle floor plan changes
  const handleFloorPlanChange = (index: number, field: string, value: string | File[]) => {
    const updatedFloorPlans = [...floorPlans];
    updatedFloorPlans[index] = {
      ...updatedFloorPlans[index],
      [field]: value,
    };
    setFloorPlans(updatedFloorPlans);
  };

  // Add a new floor plan
  const addFloorPlan = () => {
    setFloorPlans([
      ...floorPlans,
      {
        name: '',
        bedrooms: '1',
        bathrooms: '1',
        squareFeet: '',
        price: '',
        availability: '1',
        description: '',
        images: [] as File[],
      },
    ]);
    setFloorPlanCount(floorPlanCount + 1);
  };

  // Remove a floor plan
  const removeFloorPlan = (index: number) => {
    if (floorPlans.length > 1) {
      const updatedFloorPlans = floorPlans.filter((_, i) => i !== index);
      setFloorPlans(updatedFloorPlans);
      setFloorPlanCount(floorPlanCount - 1);
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

  // Handle utility selection
  const handleUtilityToggle = (utility: string) => {
    setListingData({
      ...listingData,
      utilitiesIncluded: listingData.utilitiesIncluded.includes(utility)
        ? listingData.utilitiesIncluded.filter(u => u !== utility)
        : [...listingData.utilitiesIncluded, utility],
    });
  };

  // Handle property image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      setListingData({
        ...listingData,
        images: [...listingData.images, ...fileArray],
      });
    }
  };

  // Handle floor plan image upload
  const handleFloorPlanImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      handleFloorPlanChange(index, 'images', [...floorPlans[index].images, ...fileArray]);
    }
  };

  // Remove uploaded property image
  const removeImage = (index: number) => {
    setListingData({
      ...listingData,
      images: listingData.images.filter((_, i) => i !== index),
    });
  };

  // Remove uploaded floor plan image
  const removeFloorPlanImage = (planIndex: number, imageIndex: number) => {
    const updatedImages = floorPlans[planIndex].images.filter((_, i) => i !== imageIndex);
    handleFloorPlanChange(planIndex, 'images', updatedImages);
  };

  // Navigate between steps
  const nextStep = () => {
    setCurrentStep(currentStep + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get the current user's agency
      const agency = await fetchMyAgency();
      if (!agency) throw new Error('You must register your agency before creating listings');

      // Validate required fields
      if (!listingData.propertyName || !listingData.address || !listingData.startDate) {
        throw new Error('Please fill in all required fields');
      }

      // Upload property images
      const propertyImages = [];
      if (listingData.images.length > 0) {
        for (const image of listingData.images) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${agency.id}-property-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(fileName, image);
          
          if (uploadError) throw uploadError;
          
          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('property-images')
            .getPublicUrl(fileName);
          
          propertyImages.push(publicUrl);
        }
      }

      // Prepare basic listing data
      const listingToUpload = {
        agency_id: agency.id,
        property_name: listingData.propertyName,
        address: listingData.address,
        description: listingData.description || null,
        amenities: listingData.amenities.length > 0 ? listingData.amenities : null,
        utilities_included: listingData.utilitiesIncluded.length > 0 ? listingData.utilitiesIncluded : null,
        lease_terms: listingData.leaseTerms || null,
        start_date: listingData.startDate,
        end_date: listingData.endDate || null,
        application_link: listingData.applicationLink || null,
        application_deadline: listingData.applicationDeadline || null,
        contact_email: listingData.contactEmail || null,
        contact_phone: listingData.contactPhone || null,
        images: propertyImages.length > 0 ? propertyImages : null,
        is_active: true,
      };

      // Process floor plans
      const processedFloorPlans = [];
      for (let i = 0; i < floorPlans.length; i++) {
        const plan = floorPlans[i];
        
        // Validate floor plan required fields
        if (!plan.name || !plan.price) {
          throw new Error(`Please fill in all required fields for Floor Plan ${i + 1}`);
        }

        // Upload floor plan images
        const floorPlanImages = [];
        if (plan.images.length > 0) {
          for (const image of plan.images) {
            const fileExt = image.name.split('.').pop();
            const fileName = `${agency.id}-floorplan-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
              .from('floor-plan-images')
              .upload(fileName, image);
            
            if (uploadError) throw uploadError;
            
            // Get the public URL
            const { data: { publicUrl } } = supabase.storage
              .from('floor-plan-images')
              .getPublicUrl(fileName);
            
            floorPlanImages.push(publicUrl);
          }
        }

        processedFloorPlans.push({
          name: plan.name,
          bedrooms: parseInt(plan.bedrooms),
          bathrooms: parseFloat(plan.bathrooms),
          square_feet: plan.squareFeet ? parseInt(plan.squareFeet) : null,
          price: parseFloat(plan.price),
          availability: parseInt(plan.availability),
          description: plan.description || null,
          images: floorPlanImages.length > 0 ? floorPlanImages : null,
        });
      }

      // Create the listing with floor plans
      const listing = await createAgencyListing(listingToUpload, processedFloorPlans);
      if (!listing) throw new Error('Failed to create listing');

      setSuccess(true);
      // Redirect to agency dashboard after a short delay
      setTimeout(() => {
        router.push('/agency/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Error creating listing:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="p-6 max-w-3xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Listing Created Successfully!</h2>
          <p className="text-text-secondary mb-6">
            Your property listing has been created and is now live on PSU Leases.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => router.push('/agency/dashboard')}>
              Go to Dashboard
            </Button>
            <Button variant="secondary" onClick={() => {
              setSuccess(false);
              setCurrentStep(1);
              setListingData({
                propertyName: '',
                address: '',
                description: '',
                amenities: [],
                utilitiesIncluded: [],
                leaseTerms: '',
                startDate: '',
                endDate: '',
                applicationLink: '',
                applicationDeadline: '',
                contactEmail: '',
                contactPhone: '',
                images: [],
              });
              setFloorPlans([{
                name: '',
                bedrooms: '1',
                bathrooms: '1',
                squareFeet: '',
                price: '',
                availability: '1',
                description: '',
                images: [],
              }]);
              setFloorPlanCount(1);
            }}>
              Create Another Listing
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-text-primary mb-2">Create Property Listing</h2>
      <p className="text-text-secondary mb-6">Add your property details to attract potential tenants</p>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* Progress steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className={`flex flex-col items-center ${currentStep >= 1 ? 'text-accent' : 'text-text-secondary'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-accent text-white' : 'bg-bg-secondary text-text-secondary border border-border-light'}`}>
              1
            </div>
            <span className="text-xs mt-1">Property Info</span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-accent' : 'bg-bg-secondary'}`}></div>
          <div className={`flex flex-col items-center ${currentStep >= 2 ? 'text-accent' : 'text-text-secondary'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-accent text-white' : 'bg-bg-secondary text-text-secondary border border-border-light'}`}>
              2
            </div>
            <span className="text-xs mt-1">Floor Plans</span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? 'bg-accent' : 'bg-bg-secondary'}`}></div>
          <div className={`flex flex-col items-center ${currentStep >= 3 ? 'text-accent' : 'text-text-secondary'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-accent text-white' : 'bg-bg-secondary text-text-secondary border border-border-light'}`}>
              3
            </div>
            <span className="text-xs mt-1">Amenities</span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${currentStep >= 4 ? 'bg-accent' : 'bg-bg-secondary'}`}></div>
          <div className={`flex flex-col items-center ${currentStep >= 4 ? 'text-accent' : 'text-text-secondary'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 4 ? 'bg-accent text-white' : 'bg-bg-secondary text-text-secondary border border-border-light'}`}>
              4
            </div>
            <span className="text-xs mt-1">Photos & Submit</span>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Basic Property Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="propertyName" required>Property Name</Label>
              <Input
                id="propertyName"
                name="propertyName"
                value={listingData.propertyName}
                onChange={handleInputChange}
                placeholder="e.g. The Heights Apartments"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="address" required>Address</Label>
              <Input
                id="address"
                name="address"
                value={listingData.address}
                onChange={handleInputChange}
                placeholder="e.g. 123 College Ave, State College, PA 16801"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Property Description</Label>
              <textarea
                id="description"
                name="description"
                value={listingData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe your property, highlight key features, amenities, and benefits..."
                className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-accent transition-all duration-200"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="leaseTerms">Lease Terms</Label>
                <Input
                  id="leaseTerms"
                  name="leaseTerms"
                  value={listingData.leaseTerms}
                  onChange={handleInputChange}
                  placeholder="e.g. 12-month lease"
                />
              </div>
              
              <div>
                <Label htmlFor="applicationLink">Application Link</Label>
                <Input
                  id="applicationLink"
                  name="applicationLink"
                  value={listingData.applicationLink}
                  onChange={handleInputChange}
                  placeholder="e.g. https://youragency.com/apply"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" required>Availability Start Date</Label>
                <Input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={listingData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="endDate">Lease End Date (Optional)</Label>
                <Input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={listingData.endDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="applicationDeadline">Application Deadline (Optional)</Label>
                <Input
                  type="date"
                  id="applicationDeadline"
                  name="applicationDeadline"
                  value={listingData.applicationDeadline}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactEmail">Contact Email (Optional)</Label>
                <Input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={listingData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="e.g. leasing@youragency.com"
                />
              </div>
              
              <div>
                <Label htmlFor="contactPhone">Contact Phone (Optional)</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  value={listingData.contactPhone}
                  onChange={handleInputChange}
                  placeholder="e.g. (555) 123-4567"
                />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button type="button" onClick={nextStep}>
                Next: Floor Plans
              </Button>
            </div>
          </div>
        )}
        
        {/* Step 2: Floor Plans */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-text-primary">Floor Plans</h3>
            <p className="text-text-secondary">Add details for each available floor plan</p>
            
            {floorPlans.map((plan, index) => (
              <div key={index} className="border border-border-light rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-lg">Floor Plan {index + 1}</h4>
                  {floorPlans.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFloorPlan(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`floorPlan-${index}-name`} required>Floor Plan Name</Label>
                    <Input
                      id={`floorPlan-${index}-name`}
                      value={plan.name}
                      onChange={(e) => handleFloorPlanChange(index, 'name', e.target.value)}
                      placeholder="e.g. 1-Bedroom Deluxe"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`floorPlan-${index}-bedrooms`} required>Bedrooms</Label>
                      <select
                        id={`floorPlan-${index}-bedrooms`}
                        value={plan.bedrooms}
                        onChange={(e) => handleFloorPlanChange(index, 'bedrooms', e.target.value)}
                        className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent transition-all duration-200"
                        required
                      >
                        {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                          <option key={num} value={num}>
                            {num === 0 ? 'Studio' : `${num} ${num === 1 ? 'Bedroom' : 'Bedrooms'}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor={`floorPlan-${index}-bathrooms`} required>Bathrooms</Label>
                      <select
                        id={`floorPlan-${index}-bathrooms`}
                        value={plan.bathrooms}
                        onChange={(e) => handleFloorPlanChange(index, 'bathrooms', e.target.value)}
                        className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent transition-all duration-200"
                        required
                      >
                        {['1', '1.5', '2', '2.5', '3', '3.5', '4'].map((num) => (
                          <option key={num} value={num}>
                            {num} {parseFloat(num) === 1 ? 'Bathroom' : 'Bathrooms'}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor={`floorPlan-${index}-squareFeet`}>Square Feet</Label>
                      <Input
                        id={`floorPlan-${index}-squareFeet`}
                        type="number"
                        value={plan.squareFeet}
                        onChange={(e) => handleFloorPlanChange(index, 'squareFeet', e.target.value)}
                        placeholder="e.g. 750"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`floorPlan-${index}-price`} required>Price ($ per month)</Label>
                      <Input
                        id={`floorPlan-${index}-price`}
                        type="number"
                        value={plan.price}
                        onChange={(e) => handleFloorPlanChange(index, 'price', e.target.value)}
                        placeholder="e.g. 1200"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`floorPlan-${index}-availability`}>Units Available</Label>
                      <Input
                        id={`floorPlan-${index}-availability`}
                        type="number"
                        value={plan.availability}
                        onChange={(e) => handleFloorPlanChange(index, 'availability', e.target.value)}
                        placeholder="e.g. 5"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`floorPlan-${index}-description`}>Description</Label>
                    <textarea
                      id={`floorPlan-${index}-description`}
                      value={plan.description}
                      onChange={(e) => handleFloorPlanChange(index, 'description', e.target.value)}
                      rows={3}
                      placeholder="Describe this floor plan..."
                      className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-accent transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <div className="flex justify-center">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={addFloorPlan}
                className="mt-2"
              >
                + Add Another Floor Plan
              </Button>
            </div>
            
            <div className="pt-4 flex justify-between">
              <Button type="button" variant="secondary" onClick={prevStep}>
                Back
              </Button>
              <Button type="button" onClick={nextStep}>
                Next: Amenities
              </Button>
            </div>
          </div>
        )}
        
        {/* Step 3: Amenities and Utilities */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-text-primary mb-4">Property Amenities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {amenityOptions.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`amenity-${amenity}`}
                      checked={listingData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="w-4 h-4 accent-accent"
                    />
                    <label htmlFor={`amenity-${amenity}`} className="text-text-primary">
                      {amenity}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-6">
              <h3 className="text-xl font-semibold text-text-primary mb-4">Utilities Included</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {utilityOptions.map((utility) => (
                  <div key={utility} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`utility-${utility}`}
                      checked={listingData.utilitiesIncluded.includes(utility)}
                      onChange={() => handleUtilityToggle(utility)}
                      className="w-4 h-4 accent-accent"
                    />
                    <label htmlFor={`utility-${utility}`} className="text-text-primary">
                      {utility}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-4 flex justify-between">
              <Button type="button" variant="secondary" onClick={prevStep}>
                Back
              </Button>
              <Button type="button" onClick={nextStep}>
                Next: Photos & Submit
              </Button>
            </div>
          </div>
        )}
        
        {/* Step 4: Photos and Submission */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-text-primary mb-4">Property Photos</h3>
              <p className="text-text-secondary mb-2">
                Upload photos of the property (exterior, common areas, etc.)
              </p>
              
              <div className="border-2 border-dashed border-border-light rounded-lg p-6 text-center">
                <Input
                  type="file"
                  id="propertyImages"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent/80"
                />
                <p className="text-xs text-text-secondary mt-2">
                  Recommended: High-quality photos with good lighting (max 5MB per image)
                </p>
              </div>
              
              {/* Preview uploaded property images */}
              {listingData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {listingData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <div className="aspect-square rounded-lg overflow-hidden bg-bg-secondary">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Property Image ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Floor plan photos */}
            {floorPlans.map((plan, planIndex) => (
              <div key={planIndex} className="pt-4">
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                  Photos for {plan.name || `Floor Plan ${planIndex + 1}`}
                </h3>
                
                <div className="border-2 border-dashed border-border-light rounded-lg p-6 text-center">
                  <Input
                    type="file"
                    id={`floorPlanImages-${planIndex}`}
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFloorPlanImageUpload(planIndex, e)}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent/80"
                  />
                  <p className="text-xs text-text-secondary mt-2">
                    Upload photos specific to this floor plan
                  </p>
                </div>
                
                {/* Preview uploaded floor plan images */}
                {plan.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {plan.images.map((image, imageIndex) => (
                      <div key={imageIndex} className="relative">
                        <div className="aspect-square rounded-lg overflow-hidden bg-bg-secondary">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Floor Plan ${planIndex + 1} Image ${imageIndex + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFloorPlanImage(planIndex, imageIndex)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            <div className="pt-6 flex justify-between">
              <Button type="button" variant="secondary" onClick={prevStep}>
                Back
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating Listing...' : 'Create Listing'}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Card>
  );
} 