'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-bg-secondary bg-opacity-50 backdrop-blur-md border-t border-border-light mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <Image 
                src="/psusubleaseLogo.png" 
                alt="PSU Sublease Lion Logo" 
                width={30} 
                height={30} 
                className="rounded-md"
              />
              <h3 className="text-lg font-semibold text-text-primary">PSU<span className="text-accent">Sublease</span></h3>
            </div>
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
              <Link href="/roadmap" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                roadmap
              </Link>
              <Link href="/about" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                about the developer
              </Link>
            </nav>
          </div>
          
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-text-primary">Contact</h3>
            <p className="text-sm text-text-secondary">
              Have questions or feedback? <a href="https://docs.google.com/forms/d/e/1FAIpQLSdxNfKZHEbbgIaRclQjw1eU_2G7ptewmtgnAf1aXAC4CHKAzQ/viewform?usp=dialog" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">Fill out our contact form</a>
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
      <div className="w-full">
        <Image 
          src="/lionFore.png" 
          alt="PSU Sublease Lion Logo" 
          width={1200} 
          height={600} 
          className="w-full max-w-none"
        />
      </div>
    </footer>
  );
} 