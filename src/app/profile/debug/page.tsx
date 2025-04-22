'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import supabase from '@/utils/supabase';
import Link from 'next/link';

export default function DebugPage() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDebugInfo = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const info: any = {
          userId: user.id,
          userEmail: user.email,
        };

        // Get all agencies
        const { data: allAgencies, error: agenciesError } = await supabase
          .from('agencies')
          .select('*');
        
        info.allAgencies = allAgencies;
        info.agenciesError = agenciesError;

        // Try to find agency with userid
        const { data: userIdAgency, error: userIdError } = await supabase
          .from('agencies')
          .select('*')
          .eq('userid', user.id)
          .single();
        
        info.userIdAgency = userIdAgency;
        info.userIdError = userIdError;

        // Try to find agency with user_id
        const { data: user_idAgency, error: user_idError } = await supabase
          .from('agencies')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        info.user_idAgency = user_idAgency;
        info.user_idError = user_idError;

        // Check any case-insensitive matches
        if (allAgencies) {
          const matches = allAgencies.filter((agency: any) => {
            if (!agency.userid && !agency.user_id) return false;
            
            return (
              (agency.userid && agency.userid.toLowerCase() === user.id.toLowerCase()) ||
              (agency.user_id && agency.user_id.toLowerCase() === user.id.toLowerCase())
            );
          });
          
          info.caseInsensitiveMatches = matches;
        }

        setDebugInfo(info);
      } catch (err: any) {
        console.error('Error fetching debug info:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDebugInfo();
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 mt-16">
        <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
        <p>Please sign in to view debug information.</p>
        <Link href="/auth/signin" className="text-blue-600 underline">
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 mt-16">
        <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 mt-16">
        <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 mt-16">
      <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">User Information</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>User ID:</strong> {debugInfo.userId}</p>
          <p><strong>Email:</strong> {debugInfo.userEmail}</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Agency Query (userid)</h2>
        <div className="bg-gray-100 p-4 rounded">
          {debugInfo.userIdAgency ? (
            <div>
              <p><strong>Agency ID:</strong> {debugInfo.userIdAgency.id}</p>
              <p><strong>Agency Name:</strong> {debugInfo.userIdAgency.name}</p>
              <p><strong>Agency User ID:</strong> {debugInfo.userIdAgency.userid}</p>
              <p><strong>Created:</strong> {new Date(debugInfo.userIdAgency.created_at).toLocaleString()}</p>
              <div className="mt-4">
                <Link href="/agency/dashboard" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                  Go to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <p>No agency found with userid = "{debugInfo.userId}"</p>
          )}
          {debugInfo.userIdError && (
            <p className="text-red-500 mt-2">Error: {JSON.stringify(debugInfo.userIdError)}</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Agency Query (user_id)</h2>
        <div className="bg-gray-100 p-4 rounded">
          {debugInfo.user_idAgency ? (
            <div>
              <p><strong>Agency ID:</strong> {debugInfo.user_idAgency.id}</p>
              <p><strong>Agency Name:</strong> {debugInfo.user_idAgency.name}</p>
              <p><strong>Agency User ID:</strong> {debugInfo.user_idAgency.user_id}</p>
              <p><strong>Created:</strong> {new Date(debugInfo.user_idAgency.created_at).toLocaleString()}</p>
              <div className="mt-4">
                <Link href="/agency/dashboard" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                  Go to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <p>No agency found with user_id = "{debugInfo.userId}"</p>
          )}
          {debugInfo.user_idError && (
            <p className="text-red-500 mt-2">Error: {JSON.stringify(debugInfo.user_idError)}</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Case-Insensitive Matches</h2>
        <div className="bg-gray-100 p-4 rounded">
          {debugInfo.caseInsensitiveMatches && debugInfo.caseInsensitiveMatches.length > 0 ? (
            <div>
              <p>{debugInfo.caseInsensitiveMatches.length} case-insensitive match(es) found:</p>
              <ul className="list-disc pl-6 mt-2">
                {debugInfo.caseInsensitiveMatches.map((agency: any) => (
                  <li key={agency.id}>
                    {agency.name} (ID: {agency.id}, User ID: {agency.userid || agency.user_id})
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No case-insensitive matches found</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">All Agencies</h2>
        <div className="bg-gray-100 p-4 rounded">
          {debugInfo.allAgencies && debugInfo.allAgencies.length > 0 ? (
            <div>
              <p>{debugInfo.allAgencies.length} agencies found:</p>
              <ul className="list-disc pl-6 mt-2">
                {debugInfo.allAgencies.map((agency: any) => (
                  <li key={agency.id}>
                    {agency.name} (ID: {agency.id}, User ID: {agency.userid || agency.user_id})
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No agencies found in database</p>
          )}
          {debugInfo.agenciesError && (
            <p className="text-red-500 mt-2">Error: {JSON.stringify(debugInfo.agenciesError)}</p>
          )}
        </div>
      </div>

      <div className="mt-8 flex space-x-4">
        <Link href="/profile" className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">
          Back to Profile
        </Link>
        <Link href="/agency/register" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          Register an Agency
        </Link>
      </div>
    </div>
  );
} 