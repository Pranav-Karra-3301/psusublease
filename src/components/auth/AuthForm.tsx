'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import supabase from '@/utils/supabase';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

type AuthMode = 'signin' | 'signup';

export default function AuthForm() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  const { signIn, signUp, signOut, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  // Redirect user when logged in and redirect parameter exists
  useEffect(() => {
    if (user && redirectPath) {
      router.push(redirectPath);
    }
  }, [user, redirectPath, router]);

  // Add this function to the AuthForm component
  useEffect(() => {
    // Check if user is logged in and there's pending profile data
    const createPendingProfile = async () => {
      if (user && localStorage.getItem('pendingProfile')) {
        try {
          const profileData = JSON.parse(localStorage.getItem('pendingProfile') || '{}');
          
          // Make sure the profile ID matches the current user
          if (profileData.id === user.id) {
            console.log('Creating profile for verified user:', user.id);
            
            // Get user token for authentication
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            if (!token) {
              console.error('No access token available');
              return;
            }
            
            // Call the API endpoint to create profile
            const response = await fetch('/api/create-profile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                profile: profileData,
                userToken: token
              })
            });
            
            const result = await response.json();
            
            if (!response.ok) {
              console.error('Profile creation error:', result.error);
            } else {
              console.log('Profile created successfully');
              // Clear the pending profile data
              localStorage.removeItem('pendingProfile');
            }
          }
        } catch (error) {
          console.error('Error creating pending profile:', error);
        }
      }
    };
    
    createPendingProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({
        text: 'Please enter a valid email address',
        type: 'error'
      });
      setLoading(false);
      return;
    }

    // Validate password
    if (password.length < 6) {
      setMessage({
        text: 'Password must be at least 6 characters long',
        type: 'error'
      });
      setLoading(false);
      return;
    }

    try {
      let result;
      
      if (mode === 'signin') {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password);
        
        // If signup successful, store profile info in local storage temporarily
        // We'll create the profile after email verification
        if (result.success && result.user) {
          try {
            // Store profile data in local storage to use after verification
            const profileData = {
              id: result.user.id,
              first_name: name.split(' ')[0] || '',
              last_name: name.split(' ').slice(1).join(' ') || '',
              phone: phone,
              email: email,
              preferred_contact: 'email'
            };
            
            localStorage.setItem('pendingProfile', JSON.stringify(profileData));
            
            console.log('Profile data stored for later creation after verification');
          } catch (profileError) {
            console.error('Failed to store profile data:', profileError);
            // Continue with signup - we'll handle profile creation later
          }
        }
      }

      if (!result.success) {
        throw new Error(result.error);
      }

      setMessage({
        text: mode === 'signin' ? 'Signed in successfully!' : 'Signed up successfully! Please check your email to verify your account.',
        type: 'success'
      });
      
      // Clear form
      setEmail('');
      setPassword('');
      setName('');
      setPhone('');
      
      // If signed up, switch to sign in mode
      if (mode === 'signup') {
        setMode('signin');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Provide more specific error messages
      let errorMessage = error.message;
      
      if (errorMessage.includes('User already registered')) {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = 'Please verify your email before signing in. Check your inbox for a confirmation link.';
      }
      
      setMessage({
        text: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    
    try {
      await signOut();
      setMessage({
        text: 'Signed out successfully!',
        type: 'success'
      });
    } catch (error: any) {
      setMessage({
        text: error.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-border-light p-6 max-w-md mx-auto mt-8">
        <h2 className="text-2xl font-bold mb-4">Welcome, {user.email}</h2>
        {message && (
          <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-accent/10 text-accent' : 'bg-error/10 text-error'}`}>
            {message.text}
          </div>
        )}
        <button 
          onClick={handleSignOut}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors w-full"
        >
          {loading ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border-light p-6 max-w-md mx-auto mt-8">
      <div className="flex justify-center mb-6">
        <Image 
          src="/lion.png" 
          alt="PSU Sublease Lion Logo" 
          width={80} 
          height={80} 
          className="rounded-md"
        />
      </div>
      
      <h2 className="text-2xl font-bold mb-4 text-center">
        {mode === 'signin' ? 'Sign In' : 'Sign Up'}
      </h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-accent/10 text-accent' : 'bg-error/10 text-error'}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <>
            <div className="mb-4">
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-text-primary">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="phone" className="block mb-2 text-sm font-medium text-text-primary">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
          </>
        )}
        
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-text-primary">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-text-primary">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors w-full mb-4"
        >
          {loading 
            ? (mode === 'signin' ? 'Signing In...' : 'Signing Up...') 
            : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
        </button>
      </form>
      
      <div className="text-center mt-4">
        {mode === 'signin' ? (
          <button 
            onClick={() => setMode('signup')}
            className="text-primary hover:underline"
          >
            Don&apos;t have an account? Sign Up
          </button>
        ) : (
          <button 
            onClick={() => setMode('signin')}
            className="text-primary hover:underline"
          >
            Already have an account? Sign In
          </button>
        )}
      </div>
    </div>
  );
} 