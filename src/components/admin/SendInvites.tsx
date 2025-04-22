import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import supabase from '@/utils/supabase';

const SendInvites: React.FC = () => {
  const [fromEmail, setFromEmail] = useState('hi@psuleases.com');
  const [subject, setSubject] = useState('Join PSU Leases');
  const [message, setMessage] = useState('Hello,\n\nYou are invited to join PSU Leases, the best platform to find or list housing at Penn State University.\n\nBest regards,\nPSU Leases Team');
  const [emailList, setEmailList] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [result, setResult] = useState<null | {
    success: boolean;
    totalSent?: number;
    totalFailed?: number;
    errors?: Array<{ email: string; error: any }>;
    details?: any;
  }>(null);

  // Get current user's email for admin verification
  useEffect(() => {
    const getAdminEmail = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setAdminEmail(user.email);
        }
      } catch (error) {
        console.error('Error getting user:', error);
      }
    };

    getAdminEmail();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      // Parse emails (comma, semicolon, space, or newline separated)
      const emails = emailList
        .split(/[,;\s\n]+/)
        .map(email => email.trim())
        .filter(email => email && email.includes('@'));

      if (!emails.length) {
        setResult({ success: false, errors: [{ email: '', error: 'No valid emails provided' }] });
        setLoading(false);
        return;
      }

      console.log('Sending invites to:', emails);

      // Use the direct API route that doesn't rely on Supabase auth
      const response = await fetch('/api/admin/send-emails-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'invite',
          fromEmail,
          subject,
          message,
          emails,
          // Pass admin email for simple verification
          adminEmail
        }),
      });

      const data = await response.json();
      console.log('Email sending response:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to send invites');
      }
      
      setResult({
        success: data.success,
        totalSent: data.totalSent,
        totalFailed: data.totalFailed,
        errors: data.errors,
        details: data.details
      });
    } catch (error) {
      console.error('Error sending invites:', error);
      setResult({ 
        success: false, 
        errors: [{ 
          email: '', 
          error: error instanceof Error ? error.message : 'Failed to send invites. Please try again.' 
        }],
        details: error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Send Invites</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fromEmail" className="block text-sm font-medium text-text-secondary mb-1">
            From Email
          </label>
          <input
            id="fromEmail"
            type="email"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            className="w-full p-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-text-secondary mb-1">
            Subject
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-text-secondary mb-1">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="w-full p-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label htmlFor="emailList" className="block text-sm font-medium text-text-secondary mb-1">
            Email List
          </label>
          <p className="text-xs text-text-secondary mb-2">
            Enter emails separated by commas, spaces, or new lines
          </p>
          <textarea
            id="emailList"
            value={emailList}
            onChange={(e) => setEmailList(e.target.value)}
            rows={6}
            placeholder="user1@example.com, user2@example.com"
            className="w-full p-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            required
          />
        </div>
        
        {adminEmail ? (
          <div className="text-xs text-green-600">
            Using admin email: {adminEmail}
          </div>
        ) : (
          <div className="text-xs text-red-500">
            Admin email not detected. Please log in again.
          </div>
        )}
        
        <Button
          type="submit"
          className="w-full"
          disabled={loading || !adminEmail}
        >
          {loading ? 'Sending...' : 'Send Invites'}
        </Button>
      </form>
      
      {result && (
        <div className="mt-6">
          {result.success ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="text-green-800 font-medium">Invites Sent</h3>
              <p className="text-green-700">
                Successfully sent {result.totalSent} email{result.totalSent !== 1 ? 's' : ''}
                {result.totalFailed ? ` (${result.totalFailed} failed)` : ''}
              </p>
              
              {result.totalFailed > 0 && result.errors && result.errors.length > 0 && (
                <details className="mt-2 text-sm">
                  <summary className="cursor-pointer text-amber-700 font-medium">Show failed emails</summary>
                  <ul className="mt-2 text-red-700 list-disc pl-5">
                    {result.errors.map((error, index) => (
                      <li key={index} className="mb-2">
                        <strong>{error.email || 'Unknown recipient'}</strong>: 
                        <pre className="mt-1 p-2 bg-red-50 rounded text-red-800 overflow-auto text-xs whitespace-pre-wrap">
                          {typeof error.error === 'string' 
                            ? error.error 
                            : JSON.stringify(error.error, null, 2) || 'Unknown error'}
                        </pre>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h3 className="text-red-800 font-medium">Error Sending Invites</h3>
              <ul className="text-red-700 mt-2 list-disc pl-5">
                {result.errors?.map((error, index) => (
                  <li key={index} className="mb-2">
                    <strong>{error.email ? `${error.email}` : 'General error'}</strong>: 
                    <pre className="mt-1 p-2 bg-red-100 rounded text-red-800 overflow-auto text-xs whitespace-pre-wrap">
                      {typeof error.error === 'string' 
                        ? error.error 
                        : JSON.stringify(error.error, null, 2) || 'Unknown error'}
                    </pre>
                  </li>
                ))}
              </ul>
              {result.details && (
                <details className="mt-2 text-sm" open>
                  <summary className="cursor-pointer text-red-800">Technical details</summary>
                  <pre className="mt-2 p-2 bg-red-100 rounded text-red-800 overflow-auto text-xs whitespace-pre-wrap">
                    {typeof result.details === 'string' 
                      ? result.details
                      : JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default SendInvites; 