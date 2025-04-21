import { useState, useCallback, useEffect } from 'react';
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
      // Get regular user listings
      const { data: userListings, error: userListingsError } = await supabase
        .from('listings')
        .select(`
          *,
          apartments(*)
        `)
        .order('created_at', { ascending: false });
      
      if (userListingsError) throw userListingsError;
      
      // Get agency listings
      const { data: agencyListings, error: agencyListingsError } = await supabase
        .from('agency_listings')
        .select(`
          *,
          agency:agencies(*),
          floor_plans(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (agencyListingsError) throw agencyListingsError;
      
      // Transform agency listings to match the expected format
      const transformedAgencyListings = (agencyListings || []).map(listing => {
        // Get the lowest price from floor plans
        const lowestPrice = listing.floor_plans && listing.floor_plans.length > 0 
          ? Math.min(...listing.floor_plans.map((plan: any) => plan.price))
          : 0;
          
        // Get the bedroom and bathroom values from the first floor plan
        const firstFloorPlan = listing.floor_plans && listing.floor_plans.length > 0 
          ? listing.floor_plans[0] 
          : null;
          
        return {
          id: listing.id,
          user_id: listing.agency?.user_id || null,
          apartment_id: null,
          custom_apartment: listing.property_name,
          apartments: { address: listing.address, name: listing.property_name },
          floor_plan: firstFloorPlan?.name || '',
          bedrooms: firstFloorPlan?.bedrooms || 0,
          bathrooms: firstFloorPlan?.bathrooms || 0,
          current_rent: 0,
          offer_price: lowestPrice,
          negotiable: false,
          start_date: listing.start_date,
          end_date: listing.end_date,
          description: listing.description,
          amenities: listing.amenities,
          has_roommates: false,
          roommates_staying: null,
          gender_preference: null,
          images: listing.images,
          created_at: listing.created_at,
          updated_at: listing.updated_at,
          is_agency_listing: true, // Flag to identify agency listings
          agency: listing.agency,
          floor_plans: listing.floor_plans
        };
      });
      
      // Get facebook listings
      const { data: facebookListings, error: facebookListingsError } = await supabase
        .from('facebook_listings')
        .select('*')
        .order('created_at', { ascending: false });
      if (facebookListingsError) throw facebookListingsError;
      const transformedFacebookListings = (facebookListings || []).map(listing => {
        const parsed = listing.parsed_listing_data || {};
        return {
          id: listing.id,
          user_id: null,
          apartment_id: null,
          custom_apartment: parsed.apartment_name || '',
          apartments: { address: parsed.address || '', name: parsed.apartment_name || '' },
          floor_plan: parsed.floor_plan || '',
          bedrooms: parsed.bedrooms || 0,
          bathrooms: parsed.bathrooms || 0,
          current_rent: parsed.price || 0,
          offer_price: parsed.price || 0,
          negotiable: false,
          start_date: parsed.start_date || '',
          end_date: parsed.end_date || '',
          description: parsed.description || listing.post_text || '',
          amenities: parsed.amenities || [],
          has_roommates: false,
          roommates_staying: null,
          gender_preference: null,
          images: listing.images || [],
          created_at: listing.created_at,
          updated_at: listing.updated_at,
          is_facebook_listing: true,
          facebook_post_link: listing.facebook_post_link,
          facebook_group_link: listing.facebook_group_link,
          author_profile_link: listing.author_profile_link,
          author_username: listing.author_username,
          parsed_listing_data: parsed,
        };
      });
      
      // Combine all three types
      const combinedListings = [...(userListings || []), ...transformedAgencyListings, ...transformedFacebookListings];
      
      // Sort by created_at
      combinedListings.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      return { data: combinedListings, error: null };
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
      // First try to get from regular listings
      const { data: userListing, error: userListingError } = await supabase
        .from('listings')
        .select(`
          *,
          apartments(*)
        `)
        .eq('id', id)
        .maybeSingle();
      
      if (userListing) {
        return { data: userListing, error: null };
      }
      
      // If not found, try agency listings
      const { data: agencyListing, error: agencyListingError } = await supabase
        .from('agency_listings')
        .select(`
          *,
          agency:agencies(*),
          floor_plans(*)
        `)
        .eq('id', id)
        .maybeSingle();
        
      if (agencyListingError) throw agencyListingError;
      
      if (!agencyListing) {
        return { data: null, error: "Listing not found" };
      }
      
      // Transform to match expected format
      const lowestPrice = agencyListing.floor_plans && agencyListing.floor_plans.length > 0 
        ? Math.min(...agencyListing.floor_plans.map((plan: any) => plan.price))
        : 0;
        
      const firstFloorPlan = agencyListing.floor_plans && agencyListing.floor_plans.length > 0 
        ? agencyListing.floor_plans[0] 
        : null;
        
      const transformedAgencyListing = {
        id: agencyListing.id,
        user_id: agencyListing.agency?.user_id || null,
        apartment_id: null,
        custom_apartment: agencyListing.property_name,
        apartments: { address: agencyListing.address, name: agencyListing.property_name },
        floor_plan: firstFloorPlan?.name || '',
        bedrooms: firstFloorPlan?.bedrooms || 0,
        bathrooms: firstFloorPlan?.bathrooms || 0,
        current_rent: 0,
        offer_price: lowestPrice,
        negotiable: false,
        start_date: agencyListing.start_date,
        end_date: agencyListing.end_date,
        description: agencyListing.description,
        amenities: agencyListing.amenities,
        has_roommates: false,
        roommates_staying: null,
        gender_preference: null,
        images: agencyListing.images,
        created_at: agencyListing.created_at,
        updated_at: agencyListing.updated_at,
        is_agency_listing: true,
        agency: agencyListing.agency,
        floor_plans: agencyListing.floor_plans
      };
      
      // Get facebook listing
      const { data: facebookListing, error: facebookListingError } = await supabase
        .from('facebook_listings')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (facebookListingError) throw facebookListingError;
      if (facebookListing) {
        const parsed = facebookListing.parsed_listing_data || {};
        const transformedFacebookListing = {
          id: facebookListing.id,
          user_id: null,
          apartment_id: null,
          custom_apartment: parsed.apartment_name || '',
          apartments: { address: parsed.address || '', name: parsed.apartment_name || '' },
          floor_plan: parsed.floor_plan || '',
          bedrooms: parsed.bedrooms || 0,
          bathrooms: parsed.bathrooms || 0,
          current_rent: parsed.price || 0,
          offer_price: parsed.price || 0,
          negotiable: false,
          start_date: parsed.start_date || '',
          end_date: parsed.end_date || '',
          description: parsed.description || facebookListing.post_text || '',
          amenities: parsed.amenities || [],
          has_roommates: false,
          roommates_staying: null,
          gender_preference: null,
          images: facebookListing.images || [],
          created_at: facebookListing.created_at,
          updated_at: facebookListing.updated_at,
          is_facebook_listing: true,
          facebook_post_link: facebookListing.facebook_post_link,
          facebook_group_link: facebookListing.facebook_group_link,
          author_profile_link: facebookListing.author_profile_link,
          author_username: facebookListing.author_username,
          parsed_listing_data: parsed,
        };
        return { data: transformedFacebookListing, error: null };
      }
      
      return { data: transformedAgencyListing, error: null };
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
      console.log('Creating listing with data:', listing);
      
      const { data, error } = await supabase
        .from('listings')
        .insert(listing)
        .select(`
          *,
          apartments(*)
        `)
        .single();
      
      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Error in createListing:', err);
      const errorMessage = err.message || 'Unknown error occurred during listing creation';
      setError(errorMessage);
      return { data: null, error: errorMessage };
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

  const deleteFacebookListing = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('facebook_listings')
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
  }, []);

  return {
    loading,
    error,
    getListings,
    getListing,
    createListing,
    updateListing,
    deleteListing,
    deleteFacebookListing,
  };
} 