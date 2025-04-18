import { useState, useCallback } from 'react';
import supabase from '../utils/supabase';
import { Database } from '../types/database.types';

type SubleaseRequest = Database['public']['Tables']['sublease_requests']['Row'];
type NewSubleaseRequest = Database['public']['Tables']['sublease_requests']['Insert'];

export function useSubleaseRequests() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getRequests = useCallback(async (includeUnverified = false) => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('sublease_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!includeUnverified) {
        query = query.eq('is_verified', true);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Error in getRequests:', err);
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getRequest = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('sublease_requests')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Error in getRequest:', err);
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserRequests = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('sublease_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Error in getUserRequests:', err);
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const createRequest = useCallback(async (request: NewSubleaseRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!request) {
        throw new Error('Request data is required');
      }
      
      // Validate required fields according to schema
      if (!request.user_id) {
        throw new Error('Missing user_id - user authentication required');
      }
      
      if (!request.area_preference) {
        throw new Error('Area preference is required');
      }
      
      if (!request.start_date || !request.end_date) {
        throw new Error('Start and end dates are required');
      }
      
      if (request.budget_min === undefined || request.budget_max === undefined) {
        throw new Error('Budget range is required');
      }
      
      console.log('Creating request with data:', JSON.stringify(request, null, 2));
      
      const { data, error } = await supabase
        .from('sublease_requests')
        .insert(request)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      console.log('Successfully created request:', data);
      return { data, error: null };
    } catch (err: any) {
      const errorMessage = err?.message || 'An unknown error occurred';
      console.error('Error in createRequest:', err);
      console.error('Error message:', errorMessage);
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRequest = useCallback(async (id: string, updates: Partial<SubleaseRequest>) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!id || !updates) {
        throw new Error('Request ID and update data are required');
      }
      
      const { data, error } = await supabase
        .from('sublease_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Error in updateRequest:', err);
      setError(err?.message || 'An unknown error occurred');
      return { data: null, error: err?.message || 'Failed to update request' };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRequest = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!id) {
        throw new Error('Request ID is required');
      }
      
      const { error } = await supabase
        .from('sublease_requests')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (err: any) {
      console.error('Error in deleteRequest:', err);
      setError(err?.message || 'An unknown error occurred');
      return { success: false, error: err?.message || 'Failed to delete request' };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getRequests,
    getRequest,
    getUserRequests,
    createRequest,
    updateRequest,
    deleteRequest
  };
} 