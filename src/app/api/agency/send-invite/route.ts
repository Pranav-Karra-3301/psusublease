import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { InviteEmailTemplate } from '@/components/email/InviteEmailTemplate';
import supabase from '@/utils/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    // Get the current user to verify permission
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { inviteId, agencyName } = body;

    if (!inviteId || !agencyName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if Resend API key is available
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY environment variable is not set');
      return NextResponse.json({ error: 'Email service configuration error' }, { status: 500 });
    }

    // Verify that the user is an admin for this agency
    const { data: inviteData, error: inviteError } = await supabase
      .from('pending_invites')
      .select('*, agency:agency_id(id)')
      .eq('id', inviteId)
      .single();

    if (inviteError) {
      console.error('Error fetching invite:', inviteError);
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    // Check if user is admin of this agency
    const { data: membership, error: membershipError } = await supabase
      .from('agency_members')
      .select('*')
      .eq('user_id', user.id)
      .eq('agency_id', inviteData.agency_id)
      .eq('role', 'admin')
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'You are not authorized to send invites for this agency' }, { status: 403 });
    }

    // Create the invite URL
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${inviteData.token}`;

    // Send the email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'PSU Leases <hi@psuleases.com>',
      to: inviteData.email,
      subject: `You've been invited to join ${agencyName}`,
      react: InviteEmailTemplate({ 
        message: `You've been invited to join ${agencyName} on PSU Leases. Click the button below to accept the invitation.`,
        inviteLink: inviteUrl
      }),
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      return NextResponse.json({ 
        error: 'Failed to send email', 
        details: emailError 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        id: emailData?.id,
        email: inviteData.email 
      } 
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
} 