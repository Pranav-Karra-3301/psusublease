'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AuthPortal() {
  const [userType, setUserType] = useState<'tenant' | 'agency' | null>(null);
  const router = useRouter();
  
  const handleSignIn = () => {
    router.push('/auth/signin');
  };
  
  const handleSignUp = () => {
    if (!userType) {
      alert('Please select whether you are a tenant or property manager.');
      return;
    }
    // Store the user type in localStorage to be used during signup
    localStorage.setItem('selectedUserType', userType);
    router.push('/auth/signup');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <Image 
            src="/lion.png" 
            alt="PSU Sublease Lion Logo" 
            width={100} 
            height={100} 
            className="rounded-md"
          />
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-8">PSU Subleases</h1>
        
        <div className="mb-6">
          <button
            onClick={handleSignIn}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
        
        <div>
          <p className="text-center font-medium mb-4">Create a new account</p>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">I am a:</p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setUserType('tenant')}
                className={`flex-1 py-3 px-4 rounded-md border transition-colors ${
                  userType === 'tenant'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                }`}
              >
                Tenant/Student
              </button>
              <button
                type="button"
                onClick={() => setUserType('agency')}
                className={`flex-1 py-3 px-4 rounded-md border transition-colors ${
                  userType === 'agency'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                }`}
              >
                Property Manager
              </button>
            </div>
          </div>
          
          <button
            onClick={handleSignUp}
            className="w-full bg-gray-800 text-white py-3 rounded-md hover:bg-gray-900 transition-colors"
          >
            Sign Up
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            PSU Subleases is an aggregator platform that does not handle any financial transactions between users.
          </p>
        </div>
      </div>
    </div>
  );
} 