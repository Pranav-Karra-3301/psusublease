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
    const { listingData, floorPlans, userToken } = await request.json();

    if (!listingData || !userToken) {
      return NextResponse.json(
        { error: 'Missing listing data or user token' },
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
    const { data: agencyData, error: agencyError } = await supabaseAdmin
      .from('agencies')
      .select('id')
      .eq('userid', user.id)
      .eq('id', listingData.agency_id)
      .single();
    
    if (agencyError || !agencyData) {
      console.error('Agency verification error:', agencyError);
      return NextResponse.json(
        { error: 'You do not have permission to create listings for this agency' },
        { status: 403 }
      );
    }

    // Insert the listing with admin privileges (bypassing RLS)
    const { data: listing, error: listingError } = await supabaseAdmin
      .from('agency_listings')
      .insert([{
        ...listingData,
        floor_plan: listingData.floor_plan || '',  // Provide a default empty string if undefined
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (listingError) {
      console.error('Listing creation error:', listingError);
      return NextResponse.json(
        { error: `Error creating listing: ${listingError.message}` },
        { status: 500 }
      );
    }

    // Insert floor plans if provided
    if (floorPlans && floorPlans.length > 0) {
      const floorPlansWithListingId = floorPlans.map(plan => ({
        ...plan,
        agency_listing_id: listing.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error: floorPlansError } = await supabaseAdmin
        .from('floor_plans')
        .insert(floorPlansWithListingId);

      if (floorPlansError) {
        console.error('Floor plans insertion error:', floorPlansError);
        // We still return the listing even if floor plans fail
        return NextResponse.json({
          success: true,
          data: listing,
          warning: `Listing created but floor plans failed: ${floorPlansError.message}`
        });
      }
    }

    return NextResponse.json({ success: true, data: listing });
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
} 