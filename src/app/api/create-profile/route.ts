import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// Initialize Supabase with service role for admin privileges
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Make sure to add this to your .env.local
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    const { profile, userToken } = await request.json();

    if (!profile || !userToken) {
      return NextResponse.json(
        { error: 'Missing profile data or user token' },
        { status: 400 }
      );
    }

    // Verify the user token to prevent abuse
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(userToken);

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Invalid user token' },
        { status: 401 }
      );
    }

    // Ensure the profile ID matches the authenticated user
    if (profile.id !== user.id) {
      return NextResponse.json(
        { error: 'Profile ID does not match authenticated user' },
        { status: 403 }
      );
    }

    // Create the profile with admin privileges (bypassing RLS)
    const { error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        email: profile.email,
        preferred_contact: profile.preferred_contact || 'email',
        user_type: profile.user_type || 'tenant',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error creating profile:', error);
      return NextResponse.json(
        { error: `Failed to create profile: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in create-profile API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 