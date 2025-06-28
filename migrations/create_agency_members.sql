-- Create agency_members table
CREATE TABLE IF NOT EXISTS public.agency_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- A user can only be in one agency at a time
  CONSTRAINT unique_user_agency UNIQUE (user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agency_members_agency_id ON public.agency_members(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_members_user_id ON public.agency_members(user_id);

-- Create pending_invites table
CREATE TABLE IF NOT EXISTS public.pending_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at TIMESTAMPTZ,
  
  -- Prevent duplicate invites to the same email for the same agency
  CONSTRAINT unique_email_agency UNIQUE (email, agency_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pending_invites_agency_id ON public.pending_invites(agency_id);
CREATE INDEX IF NOT EXISTS idx_pending_invites_token ON public.pending_invites(token);
CREATE INDEX IF NOT EXISTS idx_pending_invites_email ON public.pending_invites(email);

-- Enable Row Level Security
ALTER TABLE public.agency_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_invites ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own agency membership
CREATE POLICY "Users can view their own agency membership"
ON public.agency_members
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for members to view other members in their agency
CREATE POLICY "Members can view other members in their agency"
ON public.agency_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.agency_members
    WHERE 
      user_id = auth.uid() AND 
      agency_id = public.agency_members.agency_id
  )
);

-- Policy for admins to manage members in their agency
CREATE POLICY "Admins can manage members in their agency"
ON public.agency_members
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.agency_members
    WHERE 
      user_id = auth.uid() AND 
      agency_id = public.agency_members.agency_id AND
      role = 'admin'
  )
);

-- Policy for admins to manage pending invites for their agency
CREATE POLICY "Admins can manage pending invites for their agency"
ON public.pending_invites
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.agency_members
    WHERE 
      user_id = auth.uid() AND 
      agency_id = public.pending_invites.agency_id AND
      role = 'admin'
  )
);

-- Policy for members to view pending invites in their agency
CREATE POLICY "Members can view pending invites in their agency" 
ON public.pending_invites
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.agency_members
    WHERE 
      user_id = auth.uid() AND 
      agency_id = public.pending_invites.agency_id
  )
);

-- Policy for anyone to use an invite token to join an agency
CREATE POLICY "Anyone can use an invite token"
ON public.pending_invites
FOR SELECT
USING (
  used_at IS NULL
); 