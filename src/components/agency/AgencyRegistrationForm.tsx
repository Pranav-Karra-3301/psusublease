'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import supabase from '@/utils/supabase';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import Card from '@/components/ui/Card';
import { useAgencies } from '@/hooks/useAgencies';

export default function AgencyRegistrationForm() {
  const router = useRouter();
  const { createAgency } = useAgencies();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    website: '',
    phone: '',
    email: '',
    additionalEmails: '',
    contactPerson: '',
    googleMapsLink: '',
    description: '',
    logo: null as File | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({
        ...formData,
        logo: e.target.files[0],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error(userError.message);
      if (!user) throw new Error('You must be signed in to register as an agency');

      // Get the session token for authentication
      const { data: sessionData } = await supabase.auth.getSession();
      const userToken = sessionData?.session?.access_token;
      if (!userToken) throw new Error('Authentication error: No session token available');

      // Validate required fields
      if (!formData.name || !formData.email || !formData.phone) {
        throw new Error('Please fill in all required fields');
      }

      // Process additional emails
      const additionalEmails = formData.additionalEmails
        ? formData.additionalEmails.split(',').map(email => email.trim())
        : [];

      // Upload logo if provided
      let logoUrl = null;
      if (formData.logo) {
        const fileExt = formData.logo.name.split('.').pop();
        const fileName = `${user.id}-agency-logo-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('agency-logos')
          .upload(fileName, formData.logo);
        
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('agency-logos')
          .getPublicUrl(fileName);
        
        logoUrl = publicUrl;
      }

      // Prepare agency data
      const agencyData = {
        user_id: user.id,
        name: formData.name,
        website: formData.website || null,
        phone: formData.phone,
        email: formData.email,
        additional_emails: additionalEmails.length > 0 ? additionalEmails : null,
        contact_person: formData.contactPerson || null,
        google_maps_link: formData.googleMapsLink || null,
        description: formData.description || null,
        logo_url: logoUrl,
      };

      // Use the server API route instead of the client-side function
      const response = await fetch('/api/create-agency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agencyData,
          userToken,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create agency');
      }

      setSuccess(true);
      // Redirect to agency dashboard after a short delay
      setTimeout(() => {
        router.push('/agency/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Error registering agency:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Registration Successful!</h2>
          <p className="text-text-secondary mb-6">
            Your agency has been registered. Our team will verify your information and you'll receive a confirmation email when your account is activated.
          </p>
          <Button onClick={() => router.push('/agency/dashboard')}>
            Go to Agency Dashboard
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-text-primary mb-6">Register Your Property Management Agency</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="name" required>Agency Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your agency's name"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email" required>Primary Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="primary@example.com"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phone" required>Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="(555) 123-4567"
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="additionalEmails">Additional Contact Emails (comma-separated)</Label>
          <Input
            id="additionalEmails"
            name="additionalEmails"
            value={formData.additionalEmails}
            onChange={handleInputChange}
            placeholder="leasing@example.com, info@example.com"
          />
        </div>
        
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            placeholder="https://www.youragency.com"
          />
        </div>
        
        <div>
          <Label htmlFor="contactPerson">Point of Contact (Name)</Label>
          <Input
            id="contactPerson"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleInputChange}
            placeholder="John Doe"
          />
        </div>
        
        <div>
          <Label htmlFor="googleMapsLink">Google Maps Link (Recommended)</Label>
          <Input
            id="googleMapsLink"
            name="googleMapsLink"
            value={formData.googleMapsLink}
            onChange={handleInputChange}
            placeholder="https://goo.gl/maps/..."
          />
        </div>
        
        <div>
          <Label htmlFor="description">Agency Description</Label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            placeholder="Tell students about your agency and properties..."
            className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-accent transition-all duration-200"
          />
        </div>
        
        <div>
          <Label htmlFor="logo">Agency Logo</Label>
          <Input
            id="logo"
            name="logo"
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="bg-bg-secondary border border-border-light rounded-lg px-4 py-2 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-accent transition-all duration-200"
          />
          <p className="text-xs text-text-secondary mt-1">
            Recommended size: 300x300px, PNG or JPG format
          </p>
        </div>
        
        <div className="pt-4">
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Register Agency'}
          </Button>
        </div>
        
        <p className="text-sm text-text-secondary text-center">
          By registering, you agree to our terms of service and privacy policy.
          Your agency information will be verified before being published on the platform.
        </p>
      </form>
    </Card>
  );
} 