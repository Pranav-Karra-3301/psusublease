import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// Initialize Supabase with service role for admin privileges
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    const { agencyId, agencyData, userToken } = await request.json();

    if (!agencyId || !agencyData || !userToken) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
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

    // Verify this user owns the agency
    const { data: agencyCheck, error: agencyCheckError } = await supabaseAdmin
      .from('agencies')
      .select('id')
      .eq('userid', user.id)
      .eq('id', agencyId)
      .single();
    
    if (agencyCheckError || !agencyCheck) {
      console.error('Agency verification error:', agencyCheckError);
      return NextResponse.json(
        { error: 'You do not have permission to update this agency' },
        { status: 403 }
      );
    }

    // Update the agency with admin privileges (bypassing RLS)
    const { data, error } = await supabaseAdmin
      .from('agencies')
      .update(agencyData)
      .eq('id', agencyId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: `Error updating agency: ${error.message}`, details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: `Server error: ${error.message}`, details: error.toString() },
      { status: 500 }
    );
  }
} 