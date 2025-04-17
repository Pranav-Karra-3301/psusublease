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
        }
        Relationships: []
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