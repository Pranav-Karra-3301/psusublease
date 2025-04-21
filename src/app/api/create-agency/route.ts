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
    const { agencyData, userToken } = await request.json();

    if (!agencyData || !userToken) {
      return NextResponse.json(
        { error: 'Missing agency data or user token' },
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

    // Ensure the agency user_id matches the authenticated user
    if (agencyData.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Agency user_id does not match authenticated user' },
        { status: 403 }
      );
    }

    // Create the agency with admin privileges (bypassing RLS)
    const { data, error } = await supabaseAdmin
      .from('agencies')
      .insert([{
        ...agencyData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_verified: false, // Default to not verified
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: `Error creating agency: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
} 