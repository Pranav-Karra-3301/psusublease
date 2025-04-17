import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12 text-accent">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      
      <h1 className="text-4xl font-bold text-text-primary mb-4">404 - Page Not Found</h1>
      <p className="text-xl text-text-secondary mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/">
          <Button size="lg">Go to Homepage</Button>
        </Link>
        <Link href="/listings">
          <Button variant="secondary" size="lg">Browse Listings</Button>
        </Link>
      </div>
    </div>
  );
} 