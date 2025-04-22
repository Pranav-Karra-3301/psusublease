import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY;
  
  console.log('Testing Resend API');
  console.log('API Key present:', !!apiKey);
  
  if (!apiKey) {
    return NextResponse.json({
      error: 'RESEND_API_KEY is not set in environment variables',
      success: false
    });
  }
  
  try {
    const resend = new Resend(apiKey);
    const results = [];
    let success = false;
    let hasError = false;
    
    // Test 1: Using Resend's default domain
    try {
      console.log('Testing with Resend default domain');
      const { data, error } = await resend.emails.send({
        from: 'PSU Leases <onboarding@resend.dev>',
        to: 'delivered@resend.dev', // Resend's test email that always succeeds
        subject: 'Test Email from PSU Leases (Default Domain)',
        text: 'This is a test email to verify the Resend API is working correctly with the default domain.',
      });
      
      if (error) {
        console.error('Error sending test email with default domain:', error);
        results.push({
          test: 'default_domain',
          success: false,
          error: error,
        });
        hasError = true;
      } else {
        console.log('Test email with default domain sent successfully:', data);
        results.push({
          test: 'default_domain',
          success: true,
          data: data,
        });
        success = true;
      }
    } catch (e) {
      console.error('Exception in test email with default domain:', e);
      results.push({
        test: 'default_domain',
        success: false,
        error: e instanceof Error ? e.message : String(e),
      });
      hasError = true;
    }
    
    // Test 2: Using the custom domain
    try {
      console.log('Testing with custom domain');
      const { data, error } = await resend.emails.send({
        from: 'PSU Leases <hi@psuleases.com>',
        to: 'delivered@resend.dev', // Resend's test email that always succeeds
        subject: 'Test Email from PSU Leases (Custom Domain)',
        text: 'This is a test email to verify the Resend API is working correctly with the custom domain.',
      });
      
      if (error) {
        console.error('Error sending test email with custom domain:', error);
        results.push({
          test: 'custom_domain',
          success: false,
          error: error,
        });
        hasError = true;
      } else {
        console.log('Test email with custom domain sent successfully:', data);
        results.push({
          test: 'custom_domain',
          success: true,
          data: data,
        });
        success = true;
      }
    } catch (e) {
      console.error('Exception in test email with custom domain:', e);
      results.push({
        test: 'custom_domain',
        success: false,
        error: e instanceof Error ? e.message : String(e),
      });
      hasError = true;
    }
    
    // Return overall results
    return NextResponse.json({
      message: success ? 'At least one test email sent successfully' : 'All test emails failed',
      results: results,
      success: success,
      hasError: hasError
    });
  } catch (error) {
    console.error('Exception in test email:', error);
    return NextResponse.json({
      error: 'Exception in test email',
      details: error instanceof Error ? error.message : String(error),
      success: false
    });
  }
} 