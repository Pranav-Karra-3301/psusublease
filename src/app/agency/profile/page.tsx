'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import supabase from '@/utils/supabase';
import { useAgencies } from '@/hooks/useAgencies';

export default function AgencyProfilePage() {
  const router = useRouter();
  const { fetchMyAgency } = useAgencies();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [agency, setAgency] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    description: '',
    address: '',
    logo: null as File | null,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    const loadAgency = async () => {
      setLoading(true);
      try {
        const agencyData = await fetchMyAgency();
        
        if (!agencyData) {
          router.push('/agency/register');
          return;
        }
        
        setAgency(agencyData);
        setFormData({
          name: agencyData.name || '',
          email: agencyData.email || '',
          phone: agencyData.phone || '',
          website: agencyData.website || '',
          description: agencyData.description || '',
          address: agencyData.address || '',
          logo: null,
        });
        
        if (agencyData.logo_url) {
          setLogoPreview(agencyData.logo_url);
        }
      } catch (err: any) {
        setError('Error loading agency profile. Please try again.');
        console.error('Error loading agency:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadAgency();
  }, [fetchMyAgency, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        logo: file,
      });
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      if (!agency) {
        throw new Error('Agency not found');
      }
      
      // Get the session token for authentication
      const { data: sessionData } = await supabase.auth.getSession();
      const userToken = sessionData?.session?.access_token;
      if (!userToken) throw new Error('Authentication error: No session token available');
      
      // Upload new logo if provided
      let logoUrl = agency.logo_url;
      if (formData.logo) {
        const fileExt = formData.logo.name.split('.').pop();
        const fileName = `${agency.id}-agency-logo-${Date.now()}.${fileExt}`;
        
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
      
      // Prepare agency data for update
      const agencyData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        website: formData.website || null,
        description: formData.description || null,
        address: formData.address || '',
        logo_url: logoUrl,
        updated_at: new Date().toISOString(),
      };
      
      // Use API route to update the agency
      const response = await fetch('/api/update-agency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agencyId: agency.id,
          agencyData,
          userToken,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update agency profile');
      }
      
      setSuccess(true);
      // Update the local agency data
      setAgency({
        ...agency,
        ...agencyData,
      });
      
    } catch (error: any) {
      console.error('Error updating agency profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 mt-16 flex justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 mt-16">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Agency Profile</h1>
          <p className="text-text-secondary">
            Update your agency details to showcase your properties to Penn State students.
          </p>
        </div>
        
        <Card className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
              Agency profile updated successfully!
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
                <Label htmlFor="email" required>Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contact@example.com"
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
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main St, State College, PA 16801"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
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
              
              {logoPreview && (
                <div className="mb-4">
                  <img 
                    src={logoPreview} 
                    alt="Agency Logo" 
                    className="w-24 h-24 object-contain border border-border-light rounded-md"
                  />
                </div>
              )}
              
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
            
            <div className="pt-4 flex space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/agency/dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
} 