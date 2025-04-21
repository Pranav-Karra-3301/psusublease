import { Database } from './database.types';

export type Agency = Database['public']['Tables']['agencies']['Row'];
export type NewAgency = Database['public']['Tables']['agencies']['Insert'];
export type AgencyUpdate = Database['public']['Tables']['agencies']['Update'];

export type AgencyListing = Database['public']['Tables']['agency_listings']['Row'];
export type NewAgencyListing = Database['public']['Tables']['agency_listings']['Insert'];
export type AgencyListingUpdate = Database['public']['Tables']['agency_listings']['Update'];

export type FloorPlan = Database['public']['Tables']['floor_plans']['Row'];
export type NewFloorPlan = Database['public']['Tables']['floor_plans']['Insert'];
export type FloorPlanUpdate = Database['public']['Tables']['floor_plans']['Update'];

export interface AgencyListingWithFloorPlans extends AgencyListing {
  agency: Agency;
  floor_plans: FloorPlan[];
}

export interface AgencyListingWithDetails extends AgencyListing {
  agency: Agency;
  floor_plans: FloorPlan[];
}

export interface AgencyWithDetails extends Agency {
  agency_listings: AgencyListing[];
}

export interface AgencyWithListings extends Agency {
  listings: AgencyListingWithFloorPlans[];
} 