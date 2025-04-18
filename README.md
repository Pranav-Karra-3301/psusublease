This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Database Update Required

There's an error showing `"relation \"public.sublease_requests\" does not exist"` because the database is missing the required table. Follow these steps to fix it:

1. Log into your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project: `jbbdxvmlktaqapclgolt`
3. Go to the SQL Editor
4. Create a new query and paste the following SQL:

```sql
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
```

5. Run the query
6. Restart your application

This will create the missing `sublease_requests` table and set up the proper permissions.
