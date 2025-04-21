-- Create agency_listings table
CREATE TABLE IF NOT EXISTS public.agency_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES public.agencies(id),
  property_name TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  amenities TEXT[],
  utilities_included TEXT[],
  lease_terms TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  application_link TEXT,
  application_deadline DATE,
  contact_email TEXT,
  contact_phone TEXT,
  images TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create floor_plans table for agencies
CREATE TABLE IF NOT EXISTS public.floor_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_listing_id UUID NOT NULL REFERENCES public.agency_listings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms DECIMAL NOT NULL,
  square_feet INTEGER,
  price DECIMAL NOT NULL,
  availability INTEGER, -- Number of available units
  description TEXT,
  images TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agency_listings_agency_id ON public.agency_listings(agency_id);
CREATE INDEX IF NOT EXISTS idx_floor_plans_agency_listing_id ON public.floor_plans(agency_listing_id);

-- Enable Row Level Security
ALTER TABLE public.agency_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.floor_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for agency_listings
-- Policy for users to see all active agency listings
CREATE POLICY "Anyone can view active agency listings" 
ON public.agency_listings 
FOR SELECT 
USING (is_active = true);

-- Policy for agencies to manage their own listings
CREATE POLICY "Agencies can manage their own listings" 
ON public.agency_listings 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.agencies a
  WHERE a.id = agency_id AND a.user_id = auth.uid()
));

-- Create policies for floor_plans
-- Policy for users to see all floor plans
CREATE POLICY "Anyone can view floor plans" 
ON public.floor_plans 
FOR SELECT 
USING (true);

-- Policy for agencies to manage floor plans for their own listings
CREATE POLICY "Agencies can manage floor plans for their listings" 
ON public.floor_plans 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.agency_listings al
  JOIN public.agencies a ON al.agency_id = a.id
  WHERE al.id = agency_listing_id AND a.user_id = auth.uid()
)); 