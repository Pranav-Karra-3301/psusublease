export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      apartments: {
        Row: {
          address: string
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          website: string | null
        }
        Insert: {
          address: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          website?: string | null
        }
        Relationships: []
      }
      agencies: {
        Row: {
          id: string
          user_id: string
          name: string
          website: string | null
          phone: string | null
          email: string
          additional_emails: string[] | null
          contact_person: string | null
          google_maps_link: string | null
          description: string | null
          logo_url: string | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          website?: string | null
          phone?: string | null
          email: string
          additional_emails?: string[] | null
          contact_person?: string | null
          google_maps_link?: string | null
          description?: string | null
          logo_url?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          website?: string | null
          phone?: string | null
          email?: string
          additional_emails?: string[] | null
          contact_person?: string | null
          google_maps_link?: string | null
          description?: string | null
          logo_url?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agencies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      agency_listings: {
        Row: {
          id: string
          agency_id: string
          property_name: string
          address: string
          description: string | null
          amenities: string[] | null
          utilities_included: string[] | null
          lease_terms: string | null
          start_date: string
          end_date: string | null
          application_link: string | null
          application_deadline: string | null
          contact_email: string | null
          contact_phone: string | null
          images: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          property_name: string
          address: string
          description?: string | null
          amenities?: string[] | null
          utilities_included?: string[] | null
          lease_terms?: string | null
          start_date: string
          end_date?: string | null
          application_link?: string | null
          application_deadline?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          images?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agency_id?: string
          property_name?: string
          address?: string
          description?: string | null
          amenities?: string[] | null
          utilities_included?: string[] | null
          lease_terms?: string | null
          start_date?: string
          end_date?: string | null
          application_link?: string | null
          application_deadline?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          images?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_listings_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          }
        ]
      }
      floor_plans: {
        Row: {
          id: string
          agency_listing_id: string
          name: string
          bedrooms: number
          bathrooms: number
          square_feet: number | null
          price: number
          availability: number | null
          description: string | null
          images: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agency_listing_id: string
          name: string
          bedrooms: number
          bathrooms: number
          square_feet?: number | null
          price: number
          availability?: number | null
          description?: string | null
          images?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agency_listing_id?: string
          name?: string
          bedrooms?: number
          bathrooms?: number
          square_feet?: number | null
          price?: number
          availability?: number | null
          description?: string | null
          images?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "floor_plans_agency_listing_id_fkey"
            columns: ["agency_listing_id"]
            isOneToOne: false
            referencedRelation: "agency_listings"
            referencedColumns: ["id"]
          }
        ]
      }
      listings: {
        Row: {
          amenities: string[] | null
          apartment_id: string | null
          bathrooms: number
          bedrooms: number
          created_at: string
          current_rent: number
          custom_apartment: string | null
          description: string | null
          end_date: string
          fees: Json | null
          floor_plan: string
          gender_preference: string | null
          has_roommates: boolean | null
          id: string
          images: string[] | null
          negotiable: boolean | null
          offer_price: number
          roommates_staying: boolean | null
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amenities?: string[] | null
          apartment_id?: string | null
          bathrooms: number
          bedrooms: number
          created_at?: string
          current_rent: number
          custom_apartment?: string | null
          description?: string | null
          end_date: string
          fees?: Json | null
          floor_plan: string
          gender_preference?: string | null
          has_roommates?: boolean | null
          id?: string
          images?: string[] | null
          negotiable?: boolean | null
          offer_price: number
          roommates_staying?: boolean | null
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amenities?: string[] | null
          apartment_id?: string | null
          bathrooms?: number
          bedrooms?: number
          created_at?: string
          current_rent?: number
          custom_apartment?: string | null
          description?: string | null
          end_date?: string
          fees?: Json | null
          floor_plan?: string
          gender_preference?: string | null
          has_roommates?: boolean | null
          id?: string
          images?: string[] | null
          negotiable?: boolean | null
          offer_price?: number
          roommates_staying?: boolean | null
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listings_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          preferred_contact: string | null
          updated_at: string
          user_type: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          preferred_contact?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          preferred_contact?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Relationships: []
      }
      agency_members: {
        Row: {
          id: string
          user_id: string
          agency_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          user_id: string
          agency_id: string
          role: string
          joined_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          agency_id?: string
          role?: string
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_members_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          }
        ]
      }
      pending_invites: {
        Row: {
          id: string
          email: string
          agency_id: string
          token: string
          role: string
          created_at: string
          used_at: string | null
        }
        Insert: {
          id?: string
          email: string
          agency_id: string
          token: string
          role?: string
          created_at?: string
          used_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          agency_id?: string
          token?: string
          role?: string
          created_at?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pending_invites_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          }
        ]
      }
      sublease_requests: {
        Row: {
          id: string
          user_id: string
          area_preference: string
          distance_to_campus: number | null
          start_date: string
          end_date: string
          budget_min: number
          budget_max: number
          preferred_apartments: string[] | null
          bedrooms: number | null
          bathrooms: number | null
          additional_notes: string | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          area_preference: string
          distance_to_campus?: number | null
          start_date: string
          end_date: string
          budget_min: number
          budget_max: number
          preferred_apartments?: string[] | null
          bedrooms?: number | null
          bathrooms?: number | null
          additional_notes?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          area_preference?: string
          distance_to_campus?: number | null
          start_date?: string
          end_date?: string
          budget_min?: number
          budget_max?: number
          preferred_apartments?: string[] | null
          bedrooms?: number | null
          bathrooms?: number | null
          additional_notes?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sublease_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 