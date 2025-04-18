import { useState, useEffect, useCallback } from 'react';
import supabase from '@/utils/supabase';
import { Agency, AgencyListing, FloorPlan, AgencyListingWithFloorPlans } from '@/types/Agency';

export function useAgencies() {
  const [loading, setLoading] = useState(true);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch all verified agencies
  const fetchAgencies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .eq('is_verified', true);

      if (error) {
        throw error;
      }

      setAgencies(data as Agency[]);
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching agencies:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single agency by ID
  const fetchAgencyById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data as Agency;
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching agency:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch listings for an agency
  const fetchAgencyListings = useCallback(async (agencyId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch listings with agency details
      const { data: listingsData, error: listingsError } = await supabase
        .from('agency_listings')
        .select(`
          *,
          agency:agencies(*)
        `)
        .eq('agency_id', agencyId)
        .eq('is_active', true);

      if (listingsError) {
        throw listingsError;
      }

      // For each listing, fetch its floor plans
      const listingsWithFloorPlans = await Promise.all(
        (listingsData || []).map(async (listing: any) => {
          const { data: floorPlansData, error: floorPlansError } = await supabase
            .from('floor_plans')
            .select('*')
            .eq('agency_listing_id', listing.id);

          if (floorPlansError) {
            console.error('Error fetching floor plans:', floorPlansError);
            return {
              ...listing,
              floor_plans: [],
            };
          }

          return {
            ...listing,
            floor_plans: floorPlansData,
          };
        })
      );

      return listingsWithFloorPlans as AgencyListingWithFloorPlans[];
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching agency listings:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all active agency listings
  const fetchAllAgencyListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all active listings with agency details
      const { data: listingsData, error: listingsError } = await supabase
        .from('agency_listings')
        .select(`
          *,
          agency:agencies(*)
        `)
        .eq('is_active', true);

      if (listingsError) {
        throw listingsError;
      }

      // For each listing, fetch its floor plans
      const listingsWithFloorPlans = await Promise.all(
        (listingsData || []).map(async (listing: any) => {
          const { data: floorPlansData, error: floorPlansError } = await supabase
            .from('floor_plans')
            .select('*')
            .eq('agency_listing_id', listing.id);

          if (floorPlansError) {
            console.error('Error fetching floor plans:', floorPlansError);
            return {
              ...listing,
              floor_plans: [],
            };
          }

          return {
            ...listing,
            floor_plans: floorPlansData,
          };
        })
      );

      return listingsWithFloorPlans as AgencyListingWithFloorPlans[];
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching all agency listings:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new agency
  const createAgency = useCallback(async (agencyData: Omit<Agency, 'id' | 'created_at' | 'updated_at' | 'is_verified'>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('agencies')
        .insert([agencyData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Agency;
    } catch (error: any) {
      setError(error.message);
      console.error('Error creating agency:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new agency listing
  const createAgencyListing = useCallback(async (
    listingData: Omit<AgencyListing, 'id' | 'created_at' | 'updated_at'>,
    floorPlans: Omit<FloorPlan, 'id' | 'created_at' | 'updated_at' | 'agency_listing_id'>[]
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Begin a transaction
      const { data: listingData, error: listingError } = await supabase
        .from('agency_listings')
        .insert([listingData])
        .select()
        .single();

      if (listingError) {
        throw listingError;
      }

      if (floorPlans.length > 0) {
        // Add the listing ID to each floor plan
        const floorPlansWithListingId = floorPlans.map(plan => ({
          ...plan,
          agency_listing_id: listingData.id
        }));

        // Insert floor plans
        const { error: floorPlansError } = await supabase
          .from('floor_plans')
          .insert(floorPlansWithListingId);

        if (floorPlansError) {
          throw floorPlansError;
        }
      }

      return listingData as AgencyListing;
    } catch (error: any) {
      setError(error.message);
      console.error('Error creating agency listing:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an agency listing
  const updateAgencyListing = useCallback(async (
    listingId: string,
    listingData: Partial<AgencyListing>,
    newFloorPlans: Omit<FloorPlan, 'id' | 'created_at' | 'updated_at' | 'agency_listing_id'>[],
    updatedFloorPlans: FloorPlan[],
    deletedFloorPlanIds: string[]
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Update the listing
      const { error: listingError } = await supabase
        .from('agency_listings')
        .update(listingData)
        .eq('id', listingId);

      if (listingError) {
        throw listingError;
      }

      // Delete floor plans that are no longer needed
      if (deletedFloorPlanIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('floor_plans')
          .delete()
          .in('id', deletedFloorPlanIds);

        if (deleteError) {
          throw deleteError;
        }
      }

      // Update existing floor plans
      for (const plan of updatedFloorPlans) {
        const { id, created_at, updated_at, ...updateData } = plan;
        const { error: updateError } = await supabase
          .from('floor_plans')
          .update(updateData)
          .eq('id', id);

        if (updateError) {
          throw updateError;
        }
      }

      // Add new floor plans
      if (newFloorPlans.length > 0) {
        const floorPlansWithListingId = newFloorPlans.map(plan => ({
          ...plan,
          agency_listing_id: listingId
        }));

        const { error: insertError } = await supabase
          .from('floor_plans')
          .insert(floorPlansWithListingId);

        if (insertError) {
          throw insertError;
        }
      }

      return true;
    } catch (error: any) {
      setError(error.message);
      console.error('Error updating agency listing:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch current user's agency
  const fetchMyAgency = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) return null;

      // Get the agency
      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No agency found for this user
          return null;
        }
        throw error;
      }

      return data as Agency;
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching user agency:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgencies();
  }, [fetchAgencies]);

  return {
    loading,
    agencies,
    error,
    fetchAgencies,
    fetchAgencyById,
    fetchAgencyListings,
    fetchAllAgencyListings,
    createAgency,
    createAgencyListing,
    updateAgencyListing,
    fetchMyAgency,
  };
} 