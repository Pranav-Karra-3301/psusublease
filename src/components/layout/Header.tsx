'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import supabase from '@/utils/supabase';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuthContext();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
        <Link href="/" className="text-xl font-semibold text-primary">
          PSU<span className="text-accent">Sublease</span>
        </Link>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden text-text-primary"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <Link href="/listings" className="px-4 py-2 rounded-md hover:bg-bg-secondary transition-colors">
            Browse
          </Link>
          <Link href="/create" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
            Post Sublease
          </Link>
          {user ? (
            <>
              <Link href="/profile" className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors">
                My Profile
              </Link>
              <button 
                onClick={handleSignOut}
                disabled={loading}
                className="px-4 py-2 text-error border border-error rounded-md hover:bg-error/10 transition-colors"
              >
                {loading ? 'Signing out...' : 'Sign Out'}
              </button>
            </>
          ) : (
            <Link href="/auth" className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors">
              Sign In
            </Link>
          )}
        </nav>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            <Link 
              href="/listings" 
              className="px-4 py-2 hover:bg-bg-secondary rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse
            </Link>
            <Link 
              href="/create" 
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Post Sublease
            </Link>
            {user ? (
              <>
                <Link 
                  href="/profile"
                  className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </Link>
                <button 
                  onClick={handleSignOut}
                  disabled={loading}
                  className="px-4 py-2 text-error border border-error rounded-md hover:bg-error/10 transition-colors"
                >
                  {loading ? 'Signing out...' : 'Sign Out'}
                </button>
              </>
            ) : (
              <Link 
                href="/auth"
                className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 