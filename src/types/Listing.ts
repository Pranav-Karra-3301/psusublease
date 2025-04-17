import { Database } from './database.types';
import { Apartment } from './Apartment';
import { Profile } from './User';

export type Listing = Database['public']['Tables']['listings']['Row'];
export type NewListing = Database['public']['Tables']['listings']['Insert'];
export type ListingUpdate = Database['public']['Tables']['listings']['Update'];

export interface ListingWithRelations extends Listing {
  apartments?: Apartment | null;
  profiles?: Profile | null;
} 