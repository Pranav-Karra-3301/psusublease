import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/utils/supabase';

export async function POST(req: NextRequest) {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { memberId } = body;

    if (!memberId) {
      return NextResponse.json({ error: 'Missing member ID' }, { status: 400 });
    }

    // Verify that the user is allowed to delete this membership
    // (either it's their own, or they're an admin of the agency)
    const { data: membershipData, error: membershipError } = await supabase
      .from('agency_members')
      .select('*')
      .eq('id', memberId)
      .single();

    if (membershipError) {
      console.error('Error fetching membership:', membershipError);
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 });
    }

    // Check if this is the user's own membership
    const isOwnMembership = membershipData.user_id === user.id;

    // If it's not their own, check if they're an admin
    if (!isOwnMembership) {
      const { data: adminCheck, error: adminError } = await supabase
        .from('agency_members')
        .select('*')
        .eq('user_id', user.id)
        .eq('agency_id', membershipData.agency_id)
        .eq('role', 'admin')
        .single();

      if (adminError || !adminCheck) {
        return NextResponse.json({ 
          error: 'You are not authorized to remove this member' 
        }, { status: 403 });
      }
    }

    // Check if this would leave the agency with no admins
    if (membershipData.role === 'admin') {
      const { data: adminCount, error: countError } = await supabase
        .from('agency_members')
        .select('id', { count: 'exact' })
        .eq('agency_id', membershipData.agency_id)
        .eq('role', 'admin');

      if (!countError && adminCount && adminCount.length <= 1) {
        return NextResponse.json({ 
          error: 'Cannot remove the last admin from an agency. Promote another member to admin first.' 
        }, { status: 400 });
      }
    }

    // Delete the membership
    const { error: deleteError } = await supabase
      .from('agency_members')
      .delete()
      .eq('id', memberId);

    if (deleteError) {
      console.error('Error deleting membership:', deleteError);
      return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing leave request:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
} 