'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-bg-secondary bg-opacity-50 backdrop-blur-md border-t border-border-light mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-text-primary">PSU<span className="text-accent">Sublease</span></h3>
            <p className="text-sm text-text-secondary">
              Find and post subleases near Penn State University Park campus.
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-text-primary">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/listings" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                Browse Listings
              </Link>
              <Link href="/create" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                Post Sublease
              </Link>
              <Link href="/auth" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                Sign In/Up
              </Link>
              <Link href="/profile" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                My Profile
              </Link>
            </nav>
          </div>
          
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-text-primary">Contact</h3>
            <p className="text-sm text-text-secondary">
              Have questions or feedback? Reach out to us at <a href="mailto:info@psusublease.com" className="text-accent hover:underline">info@psusublease.com</a>
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border-light">
          <p className="text-xs text-text-secondary leading-relaxed">
            <strong className="text-text-primary">Disclaimer:</strong> PSU Sublease is not officially associated with Penn State University. 
            This platform was built by students to help the Penn State community find and list subleases. 
            This is solely an aggregator of listings - no financial transactions occur on this platform. 
            Users are responsible for all arrangements and transactions outside of this site. 
            We attempt to verify users but cannot be held responsible for fraudulent listings. 
            Use caution when contacting listers.
          </p>
          <p className="text-xs text-text-secondary mt-4">
            © {new Date().getFullYear()} PSU Sublease. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 