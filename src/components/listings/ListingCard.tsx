'use client';

import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface ListingCardProps {
  id: string;
  apartment: string;
  location: string;
  price: number;
  startDate: string;
  endDate: string;
  bedrooms: number;
  bathrooms: number;
  image?: string;
}

export default function ListingCard({
  id,
  apartment,
  location,
  price,
  startDate,
  endDate,
  bedrooms,
  bathrooms,
  image = '/placeholder.jpg',
}: ListingCardProps) {
  return (
    <Card variant="glass" className="overflow-hidden flex flex-col h-full">
      <div className="h-48 bg-bg-secondary relative -mx-6 -mt-6 mb-4">
        {image && (
          <Image
            src={image}
            alt={`${apartment} listing`}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute top-2 right-2 bg-accent text-white px-2 py-1 rounded text-sm font-medium">
          {id}
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-text-primary">{apartment}</h3>
      <p className="text-text-secondary text-sm mb-2">{location}</p>
      
      <div className="flex justify-between items-center mb-4">
        <span className="text-accent text-xl font-bold">${price}/mo</span>
        <span className="text-text-secondary text-sm">
          {new Date(startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 
          {new Date(endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </span>
      </div>
      
      <div className="flex gap-4 text-sm text-text-secondary mb-4">
        <span>{bedrooms} {bedrooms === 1 ? 'Bed' : 'Beds'}</span>
        <span>•</span>
        <span>{bathrooms} {bathrooms === 1 ? 'Bath' : 'Baths'}</span>
      </div>
      
      <div className="mt-auto pt-4 flex items-center justify-between">
        <button className="text-text-secondary text-sm hover:text-accent transition-colors flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy ID
        </button>
        <Link href={`/listings/${id}`}>
          <Button variant="primary">View Details</Button>
        </Link>
      </div>
    </Card>
  );
} 