import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import supabase from '@/utils/supabase';

type User = {
  id: string;
  email: string | null;
  first_name?: string | null;
  last_name?: string | null;
  user_type?: string | null;
  created_at: string;
};

const BlastUser: React.FC = () => {
  const [fromEmail, setFromEmail] = useState('hi@psuleases.com');
  const [subject, setSubject] = useState('Important Update from PSU Leases');
  const [message, setMessage] = useState('Hello,\n\nWe wanted to share an important update with you regarding PSU Leases.\n\nBest regards,\nPSU Leases Team');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [result, setResult] = useState<null | {
    success: boolean;
    totalSent?: number;
    totalFailed?: number;
    errors?: Array<{ email: string; error: any }>;
    details?: any;
  }>(null);

  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setFetchingUsers(true);
        setFetchError(null);
        
        // Get current user's email for admin verification
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setAdminEmail(user.email);
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name, user_type, created_at') as { data: User[], error: any };
        
        if (error) throw error;
        
        // Filter out users without emails
        const usersWithEmail = data.filter(user => user.email && typeof user.email === 'string' && user.email.includes('@'));
        
        if (usersWithEmail.length === 0) {
          setFetchError('No users with valid email addresses found');
        }
        
        setUsers(usersWithEmail);
        setFilteredUsers(usersWithEmail);
      } catch (error) {
        console.error('Error fetching users:', error);
        setFetchError('Failed to load users. Please try refreshing the page.');
      } finally {
        setFetchingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
      (user.email && user.email.toLowerCase().includes(term)) ||
      (user.first_name && user.first_name.toLowerCase().includes(term)) ||
      (user.last_name && user.last_name.toLowerCase().includes(term))
    );
    
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAll = () => {
    const allUserIds = filteredUsers.map(user => user.id);
    setSelectedUsers(allUserIds);
  };

  const selectNone = () => {
    setSelectedUsers([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedUsers.length === 0) {
      alert('Please select at least one user');
      return;
    }
    
    setLoading(true);
    setResult(null);

    try {
      console.log('Sending emails to users:', selectedUsers);
      
      // Get selected users' emails directly
      const selectedUserEmails = selectedUsers
        .map(id => {
          const user = users.find(u => u.id === id);
          return user?.email;
        })
        .filter(email => email && typeof email === 'string' && email.includes('@')) as string[];
      
      if (selectedUserEmails.length === 0) {
        throw new Error('No valid email addresses found for selected users');
      }
      
      console.log('Sending to emails:', selectedUserEmails);
      
      // Use the new direct API route that doesn't rely on Supabase auth
      const response = await fetch('/api/admin/send-emails-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'blast',
          fromEmail,
          subject,
          message,
          // Send emails directly instead of userIds
          emails: selectedUserEmails,
          // Pass admin email for simple verification
          adminEmail
        }),
      });

      const data = await response.json();
      
      console.log('Email sending response:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to send emails');
      }
      
      setResult({
        success: data.success,
        totalSent: data.totalSent,
        totalFailed: data.totalFailed,
        errors: data.errors,
        details: data.details
      });
    } catch (error) {
      console.error('Email sending error:', error);
      setResult({ 
        success: false, 
        errors: [{ email: '', error: error instanceof Error ? error.message : 'Failed to send emails. Please try again.' }],
        details: error
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to check if user has valid email
  const hasValidEmail = (user: User) => {
    return user.email && typeof user.email === 'string' && user.email.includes('@');
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Blast User</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-4">
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
                  rows={8}
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
            </div>
          </div>
          
          <div>
            <div className="mb-4">
              <label htmlFor="searchUsers" className="block text-sm font-medium text-text-secondary mb-1">
                Search Users
              </label>
              <input
                id="searchUsers"
                type="text"
                placeholder="Search by email or name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
            
            <div className="flex justify-between mb-2">
              <p className="text-sm text-text-secondary">
                {selectedUsers.length} of {filteredUsers.length} selected
              </p>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-sm text-accent hover:underline"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={selectNone}
                  className="text-sm text-text-secondary hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>
            
            <div className="border border-border-light rounded-md h-[350px] overflow-y-auto">
              {fetchingUsers ? (
                <div className="flex justify-center items-center h-full">
                  <span className="text-text-secondary">Loading users...</span>
                </div>
              ) : fetchError ? (
                <div className="flex justify-center items-center h-full">
                  <span className="text-red-500">{fetchError}</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <span className="text-text-secondary">No users found</span>
                </div>
              ) : (
                <ul className="divide-y divide-border-light">
                  {filteredUsers.map(user => (
                    <li key={user.id} className="p-3 hover:bg-bg-secondary">
                      <label className="flex items-start cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="mt-1 h-4 w-4 text-accent focus:ring-accent border-border-light rounded"
                        />
                        <div className="ml-3">
                          <p className={`text-text-primary font-medium ${!hasValidEmail(user) ? 'text-red-500' : ''}`}>
                            {user.email || 'No email'}
                            {!hasValidEmail(user) && ' (Invalid email)'}
                          </p>
                          <p className="text-text-secondary text-sm">
                            {[user.first_name, user.last_name].filter(Boolean).join(' ') || 'No name'}
                          </p>
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full mt-6"
          disabled={loading || selectedUsers.length === 0 || !adminEmail}
        >
          {loading ? 'Sending...' : `Send to ${selectedUsers.length} User${selectedUsers.length !== 1 ? 's' : ''}`}
        </Button>
      </form>
      
      {result && (
        <div className="mt-6">
          {result.success ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="text-green-800 font-medium">Emails Sent</h3>
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
              <h3 className="text-red-800 font-medium">Error Sending Emails</h3>
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

export default BlastUser; 