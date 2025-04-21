import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

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
    const { agencyId, adminToken } = await request.json();
    if (!agencyId || !adminToken) {
      return NextResponse.json({ error: 'Missing agencyId or adminToken' }, { status: 400 });
    }

    // Verify the admin token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(adminToken);
    if (authError || !user || user.email !== 'pranavkarra001@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the agency
    const { error } = await supabaseAdmin
      .from('agencies')
      .update({ is_verified: true })
      .eq('id', agencyId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 