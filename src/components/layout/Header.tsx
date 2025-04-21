'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import supabase from '@/utils/supabase';
import { useAgencies } from '@/hooks/useAgencies';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuthContext();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isAgency, setIsAgency] = useState(false);
  const { fetchMyAgency } = useAgencies();

  useEffect(() => {
    const checkAgencyStatus = async () => {
      if (user) {
        try {
          const agency = await fetchMyAgency();
          setIsAgency(!!agency);
        } catch (error) {
          console.error('Error checking agency status:', error);
          setIsAgency(false);
        }
      } else {
        setIsAgency(false);
      }
    };

    checkAgencyStatus();
  }, [user, fetchMyAgency]);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="bg-white fixed top-0 w-full z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image 
            src="/psusubleaseLogo.png" 
            width={30} 
            height={30} 
            alt="PSU Leases Logo" 
            className="rounded-md md:mr-2"
          />
          <span className="sr-only md:not-sr-only text-lg font-semibold">
            <span className="text-black">PSU</span>
            <span className="text">Leases</span>
          </span>
        </Link>
        
        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <div className="flex gap-2">
            <Link href="/listings" className="px-4 py-2 rounded-xl bg-primary text-white shadow-lg font-semibold hover:bg-primary/90 hover:-translate-y-1 transition-all duration-200">
              Browse Listings
            </Link>
            <Link href="/requests" className="px-4 py-2 rounded-xl bg-primary text-white shadow-lg font-semibold hover:bg-primary/90 hover:-translate-y-1 transition-all duration-200">
              Browse Requests
            </Link>
          </div>
          <div className="flex gap-2">
            <Link href="/create" className="px-4 py-2 rounded-xl bg-primary text-white shadow-lg font-semibold hover:bg-primary/90 hover:-translate-y-1 transition-all duration-200">
              Post Sublease
            </Link>
            <Link href="/requests/create" className="px-4 py-2 rounded-xl bg-primary text-white shadow-lg font-semibold hover:bg-primary/90 hover:-translate-y-1 transition-all duration-200">
              Post Request
            </Link>
          </div>
          {user ? (
            <>
              {isAgency ? (
                <div className="relative group">
                  <button className="px-3 py-2 text-text-primary hover:text-accent rounded-md transition-colors">
                    Agency
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-border-light rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link href="/agency/dashboard" className="block px-4 py-2 text-text-primary hover:bg-bg-secondary hover:text-accent">
                        Dashboard
                      </Link>
                      <Link href="/agency/create-listing" className="block px-4 py-2 text-text-primary hover:bg-bg-secondary hover:text-accent">
                        Create Listing
                      </Link>
                      <Link href="/agency/profile" className="block px-4 py-2 text-text-primary hover:bg-bg-secondary hover:text-accent">
                        Edit Agency Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href="/agency/register" className="px-3 py-2 text-text-primary hover:text-accent rounded-md transition-colors">
                  Property Managers
                </Link>
              )}
              <div className="relative group">
                <button className="px-3 py-2 text-text-primary hover:text-accent rounded-md transition-colors">
                  Account
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-border-light rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link href="/profile" className="block px-4 py-2 text-text-primary hover:bg-bg-secondary hover:text-accent">
                      Profile
                    </Link>
                    <Link href="/create" className="block px-4 py-2 text-text-primary hover:bg-bg-secondary hover:text-accent">
                      Create Sublease
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-text-primary hover:bg-bg-secondary hover:text-accent disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? 'Signing out...' : 'Sign out'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="px-3 py-2 text-text-primary hover:text-accent rounded-md transition-colors">
                Sign in
              </Link>
              <Link href="/auth/signup" className="ml-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                Sign up
              </Link>
            </>
          )}
        </nav>
        
        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-t border-border-light md:hidden z-50">
            <div className="container mx-auto px-4 py-2">
              <Link href="/listings" className="block py-3 border-b border-border-light">
                Listings
              </Link>
              <Link href="/requests" className="block py-3 border-b border-border-light">
                Requests
              </Link>
              {user ? (
                <>
                  {isAgency ? (
                    <>
                      <div className="py-3 border-b border-border-light font-medium">Agency</div>
                      <Link href="/agency/dashboard" className="block py-3 pl-4 border-b border-border-light">
                        Dashboard
                      </Link>
                      <Link href="/agency/create-listing" className="block py-3 pl-4 border-b border-border-light">
                        Create Listing
                      </Link>
                      <Link href="/agency/profile" className="block py-3 pl-4 border-b border-border-light">
                        Edit Agency Profile
                      </Link>
                    </>
                  ) : (
                    <Link href="/agency/register" className="block py-3 border-b border-border-light">
                      Property Managers
                    </Link>
                  )}
                  <Link href="/profile" className="block py-3 border-b border-border-light">
                    Profile
                  </Link>
                  <Link href="/create" className="block py-3 border-b border-border-light">
                    Create Sublease
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left py-3 text-text-primary disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Signing out...' : 'Sign out'}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="block py-3 border-b border-border-light">
                    Sign in
                  </Link>
                  <Link href="/auth/signup" className="block py-3">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 