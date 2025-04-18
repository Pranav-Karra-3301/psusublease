-- Create sublease_requests table
CREATE TABLE IF NOT EXISTS public.sublease_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  area_preference TEXT NOT NULL,
  distance_to_campus NUMERIC NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget_min NUMERIC NOT NULL,
  budget_max NUMERIC NOT NULL,
  preferred_apartments TEXT[] NULL,
  bedrooms INTEGER NULL,
  bathrooms INTEGER NULL,
  additional_notes TEXT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_sublease_requests_user_id ON public.sublease_requests(user_id);

-- Enable Row Level Security
ALTER TABLE public.sublease_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Policy for users to see all verified requests
CREATE POLICY "Anyone can view verified requests" 
ON public.sublease_requests 
FOR SELECT 
USING (is_verified = true);

-- Policy for users to manage their own requests
CREATE POLICY "Users can manage their own requests" 
ON public.sublease_requests 
FOR ALL 
USING (auth.uid() = user_id);

-- Policy for authenticated users to create requests
CREATE POLICY "Authenticated users can create requests" 
ON public.sublease_requests 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated'); 