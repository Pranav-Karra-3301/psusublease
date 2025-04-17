import { Database } from './database.types';
import { User } from '@supabase/supabase-js';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type NewProfile = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export interface UserWithProfile extends User {
  profile?: Profile;
} 