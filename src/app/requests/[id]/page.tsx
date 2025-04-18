'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuthContext } from '@/components/auth/AuthProvider';
import supabase from '@/utils/supabase';
import { formatDateRange, formatDate } from '@/utils/formatters';
import RequestDetail from '@/components/requests/RequestDetail';

function RequestPageContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthContext();
  const [request, setRequest] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  useEffect(() => {
    if (!params.id) return;
    
    const fetchRequestDetails = async () => {
      setLoading(true);
      
      try {
        // Fetch request details
        const { data: requestData, error: requestError } = await supabase
          .from('sublease_requests')
          .select('*')
          .eq('id', params.id)
          .single();
        
        if (requestError) {
          console.error('Error fetching request:', requestError);
          return;
        }
        
        if (!requestData) {
          console.error('No request found with ID:', params.id);
          return;
        }
        
        setRequest(requestData);
        
        // Fetch owner profile
        if (requestData.user_id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', requestData.user_id)
            .single();
          
          if (!profileError && profileData) {
            setOwner(profileData);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequestDetails();
  }, [params.id]);

  const handleDeleteRequest = async () => {
    if (!user || !request || user.id !== request.user_id) {
      return;
    }
    
    setDeleting(true);
    
    try {
      const { error } = await supabase
        .from('sublease_requests')
        .delete()
        .eq('id', request.id);
      
      if (error) throw error;
      
      // Redirect back to profile page after deletion
      router.push('/profile');
    } catch (error) {
      console.error('Error deleting request:', error);
    } finally {
      setDeleting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-bg-secondary rounded w-1/2"></div>
            <div className="h-64 bg-bg-secondary rounded"></div>
            <div className="h-32 bg-bg-secondary rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!request) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Request Not Found</h1>
          <p className="text-text-secondary mb-6">The request you're looking for doesn't exist or has been deleted.</p>
          <Link href="/requests">
            <Button variant="primary">View All Requests</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const isOwner = user && request.user_id === user.id;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-text-primary">Sublease Request</h1>
          <div className="flex gap-2">
            <Button 
              variant="secondary"
              onClick={() => router.back()}
            >
              Back
            </Button>
            
            {isOwner && (
              <>
                <Link href={`/requests/${request.id}/edit`}>
                  <Button variant="primary">Edit Request</Button>
                </Link>
                {!deleteConfirm ? (
                  <Button 
                    variant="danger"
                    onClick={() => setDeleteConfirm(true)}
                  >
                    Delete
                  </Button>
                ) : (
                  <Button 
                    variant="danger"
                    onClick={handleDeleteRequest}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
        
        <Card variant="glass" className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-semibold text-text-primary">
                  {request.area_preference}
                </h2>
                <div className="text-sm text-text-secondary">
                  Posted on {formatDate(request.created_at)}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-text-primary">Budget</h3>
                  <p className="text-accent text-xl font-bold">${request.budget_min} - ${request.budget_max} <span className="text-text-secondary text-sm">per month</span></p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-text-primary">Duration</h3>
                  <p className="text-text-secondary">{formatDateRange(request.start_date, request.end_date)}</p>
                </div>
                
                {(request.bedrooms || request.bathrooms) && (
                  <div>
                    <h3 className="text-lg font-medium text-text-primary">Space Requirements</h3>
                    <p className="text-text-secondary">
                      {request.bedrooms && `${request.bedrooms} ${request.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}`}
                      {request.bedrooms && request.bathrooms && ' • '}
                      {request.bathrooms && `${request.bathrooms} ${request.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}`}
                    </p>
                  </div>
                )}
                
                {request.distance_to_campus && (
                  <div>
                    <h3 className="text-lg font-medium text-text-primary">Distance to Campus</h3>
                    <p className="text-text-secondary">
                      {request.distance_to_campus} miles
                    </p>
                  </div>
                )}
                
                {request.preferred_apartments && request.preferred_apartments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-text-primary">Preferred Apartments</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {request.preferred_apartments.map((apt: string, index: number) => (
                        <span 
                          key={index} 
                          className="bg-bg-secondary text-text-primary px-3 py-1 rounded-full text-sm"
                        >
                          {apt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {request.notes && (
                  <div>
                    <h3 className="text-lg font-medium text-text-primary">Additional Notes</h3>
                    <p className="text-text-secondary whitespace-pre-line">{request.notes}</p>
                  </div>
                )}
              </div>
            </div>
            
            {owner && (
              <div className="md:w-64">
                <Card className="p-4">
                  <h3 className="text-lg font-medium text-text-primary mb-3">Posted by</h3>
                  <p className="font-semibold mb-1">
                    {owner.first_name} {owner.last_name}
                  </p>
                  
                  {user ? (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-text-secondary mb-2">Contact Information</h4>
                      
                      {owner.email && (
                        <p className="text-sm mb-1">
                          <span className="font-medium">Email:</span> {owner.email}
                        </p>
                      )}
                      
                      {owner.phone && (
                        <p className="text-sm mb-1">
                          <span className="font-medium">Phone:</span> {owner.phone}
                        </p>
                      )}
                      
                      <p className="text-sm mt-2">
                        <span className="font-medium">Preferred Contact:</span> {owner.preferred_contact}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <div className="relative">
                        <div className="filter blur-sm">
                          <h4 className="text-sm font-medium text-text-secondary mb-2">Contact Information</h4>
                          
                          {owner.email && (
                            <p className="text-sm mb-1">
                              <span className="font-medium">Email:</span> example@email.com
                            </p>
                          )}
                          
                          {owner.phone && (
                            <p className="text-sm mb-1">
                              <span className="font-medium">Phone:</span> (555) 555-5555
                            </p>
                          )}
                          
                          <p className="text-sm mt-2">
                            <span className="font-medium">Preferred Contact:</span> {owner.preferred_contact}
                          </p>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center flex-col bg-bg-primary/60 rounded p-2">
                          <p className="text-center font-medium mb-2">Login to view contact info</p>
                          <Link href="/auth">
                            <Button variant="primary" size="sm">Login</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function RequestPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Loading request details...</div>}>
      <RequestPageContent />
    </Suspense>
  );
} 