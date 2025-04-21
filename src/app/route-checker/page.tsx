'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RouteChecker() {
  const [customRoute, setCustomRoute] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const routes = [
    '/',
    '/auth',
    '/auth/signin',
    '/auth/signup',
    '/debug',
    '/simple-layout',
    '/test-routes',
    '/working-auth'
  ];
  
  const checkRoute = async (route: string) => {
    try {
      const response = await fetch(route);
      return { 
        route, 
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      };
    } catch (error: any) {
      return { 
        route, 
        status: 'error', 
        ok: false,
        error: error.message 
      };
    }
  };
  
  const checkAllRoutes = async () => {
    setLoading(true);
    try {
      const results = await Promise.all(routes.map(checkRoute));
      setResults(results);
    } catch (error) {
      console.error('Error checking routes:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const checkCustomRoute = async () => {
    if (!customRoute) return;
    
    setLoading(true);
    try {
      const result = await checkRoute(customRoute);
      setResults([result]);
    } catch (error) {
      console.error('Error checking route:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Route Checker</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Built-in Routes</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {routes.map(route => (
            <Link 
              key={route} 
              href={route}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            >
              {route}
            </Link>
          ))}
        </div>
        <button
          onClick={checkAllRoutes}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Checking...' : 'Check All Routes'}
        </button>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Custom Route</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={customRoute}
            onChange={(e) => setCustomRoute(e.target.value)}
            placeholder="/your-route"
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={checkCustomRoute}
            disabled={!customRoute || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Check
          </button>
        </div>
      </div>
      
      {results.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          <div className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left p-2">Route</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">OK</th>
                  <th className="text-left p-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-2">{result.route}</td>
                    <td className="p-2">{result.status}</td>
                    <td className="p-2">{result.ok ? '✅' : '❌'}</td>
                    <td className="p-2">{result.statusText || result.error || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 