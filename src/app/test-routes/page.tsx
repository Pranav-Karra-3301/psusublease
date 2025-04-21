'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function TestRoutes() {
  const [message, setMessage] = useState<string | null>(null);
  
  const checkRoutes = async () => {
    setMessage('Checking routes...');
    
    try {
      // Check auth endpoints
      const routes = [
        '/auth',
        '/auth/signin',
        '/auth/signup',
        '/debug'
      ];
      
      const results = await Promise.all(
        routes.map(async (route) => {
          try {
            const response = await fetch(route);
            return { 
              route, 
              status: response.status,
              ok: response.ok
            };
          } catch (error) {
            return { route, status: 'error', ok: false };
          }
        })
      );
      
      setMessage(JSON.stringify(results, null, 2));
    } catch (error) {
      setMessage(`Error checking routes: ${error}`);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Test Authentication Routes</h1>
      
      <div className="flex flex-col gap-4 mb-8">
        <Link href="/auth/signin" className="text-blue-500 hover:underline">
          Sign In Page
        </Link>
        
        <Link href="/auth/signup" className="text-blue-500 hover:underline">
          Sign Up Page
        </Link>
        
        <Link href="/auth" className="text-blue-500 hover:underline">
          Main Auth Page
        </Link>

        <Link href="/debug" className="text-blue-500 hover:underline">
          Debug Page
        </Link>
      </div>
      
      <button
        onClick={checkRoutes}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Test Route Availability
      </button>
      
      {message && (
        <pre className="mt-8 p-4 bg-gray-100 rounded overflow-auto max-h-96">
          {message}
        </pre>
      )}
    </div>
  );
} 