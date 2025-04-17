import { Database } from './database.types';

export type Apartment = Database['public']['Tables']['apartments']['Row'];
export type NewApartment = Database['public']['Tables']['apartments']['Insert'];
export type ApartmentUpdate = Database['public']['Tables']['apartments']['Update']; 