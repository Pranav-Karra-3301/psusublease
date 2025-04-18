'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useSubleaseRequests } from '@/hooks/useSubleaseRequests';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';

interface CreateRequestFormProps {
  initialData?: any;
  isEditMode?: boolean;
}

export default function CreateRequestForm({
  initialData,
  isEditMode = false
}: CreateRequestFormProps) {
  const router = useRouter();
  const { user } = useAuthContext();
  const { createRequest, updateRequest, loading, error } = useSubleaseRequests();
  
  // Form state
  const [formData, setFormData] = useState({
    area_preference: '',
    distance_to_campus: '',
    start_date: '',
    end_date: '',
    budget_min: '',
    budget_max: '',
    preferred_apartments: [],
    bedrooms: '',
    bathrooms: '',
    additional_notes: ''
  });
  
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Load initial data if editing
  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        area_preference: initialData.area_preference || '',
        distance_to_campus: initialData.distance_to_campus?.toString() || '',
        start_date: initialData.start_date || '',
        end_date: initialData.end_date || '',
        budget_min: initialData.budget_min?.toString() || '',
        budget_max: initialData.budget_max?.toString() || '',
        preferred_apartments: initialData.preferred_apartments || [],
        bedrooms: initialData.bedrooms?.toString() || '',
        bathrooms: initialData.bathrooms?.toString() || '',
        additional_notes: initialData.additional_notes || ''
      });
    }
  }, [initialData, isEditMode]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle adding preferred apartments
  const [apartmentInput, setApartmentInput] = useState('');
  
  const handleAddApartment = () => {
    if (apartmentInput.trim()) {
      setFormData(prev => ({
        ...prev,
        preferred_apartments: [...prev.preferred_apartments, apartmentInput.trim()]
      }));
      setApartmentInput('');
    }
  };
  
  const handleRemoveApartment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      preferred_apartments: prev.preferred_apartments.filter((_, i) => i !== index)
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.area_preference || !formData.start_date || !formData.end_date || 
        !formData.budget_min || !formData.budget_max) {
      setFormError('Please fill in all required fields');
      return;
    }
    
    if (formData.budget_min && formData.budget_max && 
        Number(formData.budget_min) > Number(formData.budget_max)) {
      setFormError('Minimum budget cannot be greater than maximum budget.');
      return;
    }
    
    if (formData.start_date && formData.end_date && 
        new Date(formData.start_date) > new Date(formData.end_date)) {
      setFormError('Start date cannot be after end date.');
      return;
    }

    if (!user || !user.id) {
      setFormError('User authentication error. Please log in again.');
      console.error('User is not authenticated or missing user ID:', user);
      return;
    }
    
    setFormError(null);
    setIsSubmitting(true);
    
    try {
      // Transform form data to match database schema
      const requestData = {
        area_preference: formData.area_preference,
        distance_to_campus: formData.distance_to_campus ? Number(formData.distance_to_campus) : null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        budget_min: Number(formData.budget_min), 
        budget_max: Number(formData.budget_max), 
        preferred_apartments: formData.preferred_apartments.length > 0 ? formData.preferred_apartments : null,
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
        additional_notes: formData.additional_notes || null,
        user_id: user.id,
        is_verified: true
      };
      
      console.log('Submitting request data:', JSON.stringify(requestData, null, 2));
      
      if (isEditMode && initialData) {
        // Update existing request
        const { data, error } = await updateRequest(initialData.id, requestData);
        
        if (error) {
          throw new Error(error || 'Failed to update request');
        }
        
        setSuccessMessage('Your request has been updated successfully!');
        setTimeout(() => {
          router.push('/profile');
        }, 2000);
      } else {
        // Create new request
        const { data, error } = await createRequest(requestData);
        
        if (error) {
          throw new Error(error || 'Failed to create request');
        }
        
        setSuccessMessage('Your request has been submitted successfully!');
        setFormData({
          area_preference: '',
          distance_to_campus: '',
          start_date: '',
          end_date: '',
          budget_min: '',
          budget_max: '',
          preferred_apartments: [],
          bedrooms: '',
          bathrooms: '',
          additional_notes: ''
        });
        
        setTimeout(() => {
          router.push('/profile');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Error submitting request:', err);
      setFormError(err.message || 'Failed to submit request. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card variant="glass" className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-text-primary mb-6">
        {isEditMode ? 'Edit Your Request' : 'Create a Sublease Request'}
      </h2>
      
      {formError && (
        <div className="mb-6 p-4 bg-error/10 border border-error rounded-lg text-error">
          {formError}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-500 rounded-lg text-green-700">
          {successMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              label="Preferred Area *"
              placeholder="e.g., Downtown, East College"
              name="area_preference"
              value={formData.area_preference}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <Input
              label="Distance to Campus (miles)"
              type="number"
              min="0"
              step="0.1"
              placeholder="e.g., 0.5"
              name="distance_to_campus"
              value={formData.distance_to_campus}
              onChange={handleChange}
            />
          </div>
          
          <div className="md:col-span-2">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Preferred Apartments (Optional)
              </label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add an apartment"
                  value={apartmentInput}
                  onChange={(e) => setApartmentInput(e.target.value)}
                  className="flex-grow"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddApartment}
                >
                  Add
                </Button>
              </div>
              
              {formData.preferred_apartments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.preferred_apartments.map((apt, index) => (
                    <div key={index} className="bg-bg-secondary text-text-primary px-3 py-1 rounded-full flex items-center space-x-1">
                      <span>{apt}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveApartment(index)}
                        className="text-text-secondary hover:text-error transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <Input
              label="Start Date *"
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <Input
              label="End Date *"
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <Input
              label="Minimum Budget *"
              type="number"
              min="0"
              placeholder="e.g., 600"
              name="budget_min"
              value={formData.budget_min}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <Input
              label="Maximum Budget *"
              type="number"
              min="0"
              placeholder="e.g., 1200"
              name="budget_max"
              value={formData.budget_max}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <Select
              label="Bedrooms"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              options={[
                { value: '', label: 'Any' },
                { value: '1', label: '1 Bedroom' },
                { value: '2', label: '2 Bedrooms' },
                { value: '3', label: '3 Bedrooms' },
                { value: '4', label: '4+ Bedrooms' },
              ]}
            />
          </div>
          
          <div>
            <Select
              label="Bathrooms"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              options={[
                { value: '', label: 'Any' },
                { value: '1', label: '1 Bathroom' },
                { value: '2', label: '2 Bathrooms' },
                { value: '3', label: '3+ Bathrooms' },
              ]}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-primary mb-1">
              Additional Notes
            </label>
            <textarea
              name="additional_notes"
              value={formData.additional_notes}
              onChange={handleChange}
              placeholder="Any additional requirements or preferences..."
              rows={4}
              className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 bg-bg-primary text-text-primary placeholder:text-text-secondary"
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Submitting...' : isEditMode ? 'Update Request' : 'Submit Request'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
} 