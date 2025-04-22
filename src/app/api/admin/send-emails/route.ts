import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { InviteEmailTemplate } from '@/components/email/InviteEmailTemplate';
import supabase from '@/utils/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    // Get the current user to verify admin status
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminEmails = ['pranavkarra001@gmail.com', 'machinelearningpennstate@gmail.com'];
    if (!adminEmails.includes(user.email ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { type, fromEmail, subject, message, emails, userIds } = body;

    if (!fromEmail || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if Resend API key is available
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY environment variable is not set');
      return NextResponse.json({ error: 'Email service configuration error' }, { status: 500 });
    }

    if (type === 'invite') {
      // Send invites to a list of emails
      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return NextResponse.json({ error: 'No valid emails provided' }, { status: 400 });
      }

      const results = [];
      const errors = [];

      // Process emails in batches to avoid rate limits
      for (const email of emails) {
        try {
          const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: subject,
            react: InviteEmailTemplate({ message }),
          });

          if (error) {
            console.error(`Error sending to ${email}:`, error);
            errors.push({ email, error });
          } else {
            results.push({ email, id: data?.id });
          }
        } catch (err) {
          console.error(`Exception sending to ${email}:`, err);
          errors.push({ email, error: err });
        }
      }

      return NextResponse.json({ 
        success: true, 
        results, 
        errors,
        totalSent: results.length,
        totalFailed: errors.length
      });
    } else if (type === 'blast') {
      // Send targeted emails to specific users
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return NextResponse.json({ error: 'No valid user IDs provided' }, { status: 400 });
      }

      console.log('Processing blast email to users:', userIds);

      // Get user emails from IDs
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      if (userError) {
        console.error('Error fetching user data:', userError);
        return NextResponse.json({ error: 'Error fetching user data', details: userError }, { status: 500 });
      }

      console.log('Retrieved user data:', userData);

      if (!userData || userData.length === 0) {
        return NextResponse.json({ error: 'No users found with the provided IDs' }, { status: 400 });
      }

      // Validate and extract emails
      const validUsers = userData.filter(user => user && user.email && typeof user.email === 'string' && user.email.includes('@'));
      const userEmails = validUsers.map(user => user.email);
      
      console.log('Valid user emails found:', userEmails.length);

      if (userEmails.length === 0) {
        return NextResponse.json({ error: 'No valid user emails found', userData }, { status: 400 });
      }

      const results = [];
      const errors = [];

      // Process emails in batches
      for (const email of userEmails) {
        try {
          if (!email) continue;
          
          const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: subject,
            react: InviteEmailTemplate({ message }),
          });

          if (error) {
            console.error(`Error sending to ${email}:`, error);
            errors.push({ email, error });
          } else {
            results.push({ email, id: data?.id });
          }
        } catch (err) {
          console.error(`Exception sending to ${email}:`, err);
          errors.push({ email, error: err });
        }
      }

      return NextResponse.json({ 
        success: true, 
        results, 
        errors,
        totalSent: results.length,
        totalFailed: errors.length
      });
    } else {
      return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
} 