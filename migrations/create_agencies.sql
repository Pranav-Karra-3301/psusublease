-- Create agencies table
CREATE TABLE IF NOT EXISTS public.agencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  website TEXT,
  phone TEXT,
  email TEXT NOT NULL,
  additional_emails TEXT[],
  contact_person TEXT,
  google_maps_link TEXT,
  description TEXT,
  logo_url TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_agencies_user_id ON public.agencies(user_id);

-- Enable Row Level Security
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Policy for users to see all verified agencies
CREATE POLICY "Anyone can view verified agencies" 
ON public.agencies 
FOR SELECT 
USING (is_verified = true);

-- Policy for users to manage their own agency
CREATE POLICY "Users can manage their own agency" 
ON public.agencies 
FOR ALL 
USING (auth.uid() = user_id);

-- Policy for authenticated users to create agency
CREATE POLICY "Authenticated users can create agency" 
ON public.agencies 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated'); 