'use client';

import { formatCurrency, formatDate } from '@/utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface ListingCardProps {
  id: string;
  apartment: string;
  location: string;
  price: number;
  startDate: string;
  endDate?: string;
  bedrooms: number;
  bathrooms: number;
  image?: string;
  isAgencyListing?: boolean;
  isFacebookListing?: boolean;
  agencyLogo?: string;
  agencyName?: string;
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
  image = '/apt_defaults/default.png',
  isAgencyListing = false,
  isFacebookListing = false,
  agencyLogo,
  agencyName
}: ListingCardProps) {
  const linkPath = isFacebookListing
    ? `/facebook-listings/${id}`
    : isAgencyListing
      ? `/agency-listings/${id}`
      : `/listings/${id}`;

  return (
    <Link href={linkPath} className="block">
      <motion.div 
        whileHover={{ y: -5 }}
        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col"
      >
        <div className="relative aspect-video">
          <Image
            src={image}
            alt={apartment}
            fill
            className="object-cover"
          />
          <div className="absolute top-2 right-2 bg-accent text-white text-xs py-1 px-2 rounded-full">
            {id}
          </div>
        </div>
        
        <div className="p-4 flex-grow flex flex-col">
          <div className="mb-2 flex-grow">
            <h3 className="font-semibold text-lg text-text-primary">{apartment}</h3>
            <p className="text-text-secondary text-sm">{location}</p>
          </div>
          
          <div className="flex justify-between items-center mb-3">
            <div className="text-accent font-semibold">
              {price && price > 0 ? `${formatCurrency(price)}` : 'N/A'}
              <span className="text-xs text-text-secondary font-normal">/mo</span>
            </div>
            <div className="text-text-secondary text-sm">From {formatDate(startDate)}</div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-text-secondary pt-3 border-t border-border-light">
            <div>{bedrooms && bedrooms > 0 ? `${bedrooms} ${bedrooms === 1 ? 'Bed' : 'Beds'}` : '- Bed'}</div>
            <div>•</div>
            <div>{bathrooms && bathrooms > 0 ? `${bathrooms} ${bathrooms === 1 ? 'Bath' : 'Baths'}` : '- Bath'}</div>
          </div>
          
          {isAgencyListing && agencyLogo && (
            <div className="flex items-center justify-end mt-3 pt-3 border-t border-border-light">
              <span className="text-xs text-text-secondary mr-2">Listed by:</span>
              <div className="relative h-6 w-6 rounded overflow-hidden">
                <Image 
                  src={agencyLogo} 
                  alt={agencyName || 'Agency'} 
                  fill 
                  className="object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
} 