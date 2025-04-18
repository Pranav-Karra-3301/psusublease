import { useState, useCallback } from 'react';
import supabase from '../utils/supabase';
import { Database } from '../types/database.types';

type Listing = Database['public']['Tables']['listings']['Row'];
type NewListing = Database['public']['Tables']['listings']['Insert'];

export function useListings() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          apartments(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Error in getListings:', err);
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getListing = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          apartments(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Error in getListing:', err);
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const createListing = useCallback(async (listing: NewListing) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('listings')
        .insert(listing)
        .select(`
          *,
          apartments(*)
        `)
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Error in createListing:', err);
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateListing = useCallback(async (id: string, updates: Partial<Listing>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('listings')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          apartments(*)
        `)
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Error in updateListing:', err);
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteListing = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (err: any) {
      console.error('Error in deleteListing:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getListings,
    getListing,
    createListing,
    updateListing,
    deleteListing
  };
} 