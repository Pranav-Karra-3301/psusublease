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

    // Migrate from userid to user_id for compatibility
    const updatedAgencyData = {
      ...agencyData,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_verified: false, // Default to not verified
    };
    
    // Remove the old userid field if it exists
    if ('userid' in updatedAgencyData) {
      delete updatedAgencyData.userid;
    }

    // Ensure the user is not already a member of an agency
    const { data: existingMembership, error: membershipError } = await supabaseAdmin
      .from('agency_members')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (membershipError && membershipError.code !== 'PGRST116') {
      console.error('Error checking existing membership:', membershipError);
      return NextResponse.json(
        { error: `Error checking user's existing agency membership: ${membershipError.message}` },
        { status: 500 }
      );
    }

    if (existingMembership) {
      return NextResponse.json(
        { error: 'You are already a member of an agency. You must leave your current agency first.' },
        { status: 400 }
      );
    }

    // Begin a transaction to create the agency and add the user as admin
    // Create the agency
    const { data: agency, error } = await supabaseAdmin
      .from('agencies')
      .insert([updatedAgencyData])
      .select()
      .single();

    if (error) {
      console.error('Database error creating agency:', error);
      return NextResponse.json(
        { error: `Error creating agency: ${error.message}` },
        { status: 500 }
      );
    }

    // Add the user as an admin member
    const { error: memberError } = await supabaseAdmin
      .from('agency_members')
      .insert([{
        user_id: user.id,
        agency_id: agency.id,
        role: 'admin',
        joined_at: new Date().toISOString()
      }]);

    if (memberError) {
      console.error('Database error adding member:', memberError);
      
      // Clean up - delete the agency since we couldn't add the member
      await supabaseAdmin
        .from('agencies')
        .delete()
        .eq('id', agency.id);
        
      return NextResponse.json(
        { error: `Error adding user as agency admin: ${memberError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: agency });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: `Unexpected error: ${error.message}` },
      { status: 500 }
    );
  }
} 