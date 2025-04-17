import { useState } from 'react';
import supabase from '../utils/supabase';
import { Database } from '../types/database.types';

type Apartment = Database['public']['Tables']['apartments']['Row'];
type NewApartment = Database['public']['Tables']['apartments']['Insert'];

export function useApartments() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getApartments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('apartments')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (err: any) {
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getApartment = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('apartments')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (err: any) {
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const createApartment = async (apartment: NewApartment) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('apartments')
        .insert(apartment)
        .select()
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (err: any) {
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateApartment = async (id: string, updates: Partial<Apartment>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('apartments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (err: any) {
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteApartment = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('apartments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getApartments,
    getApartment,
    createApartment,
    updateApartment,
    deleteApartment
  };
} 