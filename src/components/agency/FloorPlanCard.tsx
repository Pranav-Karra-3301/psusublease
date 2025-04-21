import React from 'react';
import Image from 'next/image';
import { FloorPlan } from '@/types/Agency';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/utils/formatters';

interface FloorPlanCardProps {
  floorPlan: FloorPlan;
  className?: string;
}

export default function FloorPlanCard({ floorPlan, className = '' }: FloorPlanCardProps) {
  return (
    <Card 
      variant="glass" 
      className={`p-6 transition-transform hover:translate-y-[-4px] ${className}`}
    >
      {/* Floor Plan Image */}
      <div className="mb-4">
        {floorPlan.images && floorPlan.images.length > 0 ? (
          <div className="relative h-48 w-full overflow-hidden rounded-lg">
            <Image
              src={floorPlan.images[0]}
              alt={floorPlan.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-48 w-full bg-bg-secondary rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12 text-text-tertiary">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        )}
      </div>

      {/* Floor Plan Name & Price */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-medium text-text-primary">{floorPlan.name}</h3>
        <span className="text-accent font-semibold">{formatCurrency(floorPlan.price)}</span>
      </div>

      {/* Basic Details */}
      <div className="flex items-center gap-4 mb-3 text-text-secondary">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2 3h20v18H2z M9 3v18 M16 3v18" />
          </svg>
          <span>{floorPlan.bedrooms} {floorPlan.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
        </div>
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z M3 10h18 M10 10v9" />
          </svg>
          <span>{floorPlan.bathrooms} {floorPlan.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
        </div>
        {floorPlan.square_feet && (
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
            </svg>
            <span>{floorPlan.square_feet} sq ft</span>
          </div>
        )}
      </div>

      {/* Availability */}
      {floorPlan.availability && floorPlan.availability > 0 && (
        <div className="mb-3">
          <span className="text-sm bg-accent/10 text-accent px-2 py-1 rounded-full">
            {floorPlan.availability} {floorPlan.availability === 1 ? 'unit' : 'units'} available
          </span>
        </div>
      )}

      {/* Description */}
      {floorPlan.description && (
        <p className="text-text-secondary text-sm mt-2 line-clamp-3">
          {floorPlan.description}
        </p>
      )}
    </Card>
  );
} 