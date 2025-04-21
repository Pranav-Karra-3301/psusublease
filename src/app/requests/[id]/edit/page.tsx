'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/auth/AuthProvider';
import supabase from '@/utils/supabase';
import CreateRequestForm from '@/components/requests/CreateRequestForm';

function EditRequestContent() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuthContext();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Redirect if user is not logged in
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);
  
  useEffect(() => {
    if (!params.id || !user) return;
    
    const fetchRequest = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch the request data
        const { data, error } = await supabase
          .from('sublease_requests')
          .select('*')
          .eq('id', params.id)
          .single();
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (!data) {
          throw new Error('Request not found');
        }
        
        // Verify that the current user is the owner of the request
        if (data.user_id !== user.id) {
          throw new Error('You do not have permission to edit this request');
        }
        
        setRequest(data);
      } catch (error: any) {
        console.error('Error fetching request:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequest();
  }, [params.id, user]);
  
  if (isLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-bg-secondary rounded w-1/3"></div>
            <div className="h-96 bg-bg-secondary rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-error mb-4">Error</h1>
          <p className="text-text-secondary mb-6">{error}</p>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  if (!request) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Request Not Found</h1>
          <p className="text-text-secondary mb-6">The request you're trying to edit doesn't exist or has been deleted.</p>
          <button 
            onClick={() => router.push('/profile')}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Edit Sublease Request</h1>
        
        <CreateRequestForm 
          initialData={request}
          isEdit={true}
        />
      </div>
    </div>
  );
}

export default function EditRequestPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Loading edit form...</div>}>
      <EditRequestContent />
    </Suspense>
  );
} 