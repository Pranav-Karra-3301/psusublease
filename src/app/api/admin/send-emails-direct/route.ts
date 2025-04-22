import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { InviteEmailTemplate } from '@/components/email/InviteEmailTemplate';

// Check if the environment is configured
const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  console.error('RESEND_API_KEY environment variable is not set');
}

const resend = new Resend(RESEND_API_KEY);

// Simple admin check using an admin key instead of Supabase auth
// In a production app, you'd want something more secure
const ADMIN_EMAILS = ['pranavkarra001@gmail.com', 'machinelearningpennstate@gmail.com'];

export async function POST(req: NextRequest) {
  try {
    console.log('Direct email API route called');
    
    // Check if Resend API key is available
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY environment variable is not set');
      return NextResponse.json({ 
        error: 'Email service configuration error: RESEND_API_KEY is not set', 
        success: false 
      });
    }

    const body = await req.json();
    const { type, fromEmail, subject, message, emails, userIds, adminEmail } = body;

    console.log('Request body:', { type, fromEmail, subject, emails: emails?.length, userIds, adminEmail });

    // Very basic admin check - in a real app, use a more secure method
    // This is just for testing purposes
    if (!ADMIN_EMAILS.includes(adminEmail)) {
      console.log('Admin check failed:', adminEmail);
      // Return 200 instead of 403 to avoid CORS issues during testing
      return NextResponse.json({ 
        error: 'Please provide a valid admin email',
        success: false
      });
    }

    if (!fromEmail || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields', success: false });
    }

    if (type === 'invite') {
      // Send invites to a list of emails
      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return NextResponse.json({ 
          error: 'No valid emails provided', 
          success: false
        });
      }

      const results = [];
      const errors = [];

      // Process emails one by one to avoid rate limits
      for (const email of emails) {
        try {
          if (!email || typeof email !== 'string' || !email.includes('@')) {
            errors.push({ email, error: 'Invalid email address' });
            continue;
          }

          console.log('Sending invite email to:', email);
          
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
            console.log(`Successfully sent to ${email}`, data);
            results.push({ email, id: data?.id });
          }
        } catch (err) {
          console.error(`Exception sending to ${email}:`, err);
          errors.push({ email, error: err });
        }
      }

      return NextResponse.json({ 
        success: results.length > 0, 
        results, 
        errors,
        totalSent: results.length,
        totalFailed: errors.length
      });
    } else if (type === 'blast') {
      // For blast emails, we need user emails directly
      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return NextResponse.json({ 
          error: 'No valid emails provided',
          success: false
        });
      }

      console.log('Sending blast emails to:', emails);

      const results = [];
      const errors = [];

      // Process emails one by one
      for (const email of emails) {
        try {
          if (!email || typeof email !== 'string' || !email.includes('@')) {
            errors.push({ email, error: 'Invalid email address format' });
            continue;
          }
          
          console.log('Sending blast email to:', email);
          
          try {
            const response = await resend.emails.send({
              from: fromEmail,
              to: email,
              subject: subject,
              react: InviteEmailTemplate({ message }),
            });
            
            console.log(`Email send response for ${email}:`, response);
            
            if (response.error) {
              console.error(`Error sending to ${email}:`, response.error);
              errors.push({ 
                email, 
                error: typeof response.error === 'object' 
                  ? JSON.stringify(response.error) 
                  : response.error 
              });
            } else {
              console.log(`Successfully sent to ${email}`, response.data);
              results.push({ email, id: response.data?.id });
            }
          } catch (sendError) {
            console.error(`Exception in Resend API for ${email}:`, sendError);
            errors.push({ 
              email, 
              error: sendError instanceof Error 
                ? sendError.message 
                : typeof sendError === 'object' 
                  ? JSON.stringify(sendError)
                  : String(sendError)
            });
          }
        } catch (err) {
          console.error(`Exception processing ${email}:`, err);
          errors.push({ 
            email, 
            error: err instanceof Error ? err.message : String(err)
          });
        }
      }

      return NextResponse.json({ 
        success: results.length > 0, 
        results, 
        errors,
        totalSent: results.length,
        totalFailed: errors.length,
        apiKey: RESEND_API_KEY ? 'API key is set' : 'API key is missing'
      });
    } else {
      return NextResponse.json({ error: 'Invalid email type', success: false });
    }
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error),
      success: false
    });
  }
} 