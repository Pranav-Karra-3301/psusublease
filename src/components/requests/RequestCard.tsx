'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuthContext } from '@/components/auth/AuthProvider';

interface RequestCardProps {
  id: string;
  area: string;
  distance_to_campus?: number | null;
  budget_min: number;
  budget_max: number;
  startDate: string;
  endDate: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  preferredApartments?: string[] | null;
  isOwner?: boolean;
}

export default function RequestCard({
  id,
  area,
  distance_to_campus,
  budget_min,
  budget_max,
  startDate,
  endDate,
  bedrooms,
  bathrooms,
  preferredApartments,
  isOwner = false
}: RequestCardProps) {
  const { user } = useAuthContext();
  
  // Format date range safely
  const formatDateRange = (startDateString: string, endDateString: string) => {
    try {
      const startDate = new Date(startDateString);
      const endDate = new Date(endDateString);
      
      // Check if dates are valid
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return 'Invalid date range';
      }
      
      return `${startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 
              ${endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
    } catch (error) {
      console.error('Error formatting date range:', error);
      return 'Invalid date range';
    }
  };

  return (
    <Card variant="glass" className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-text-primary">{area}</h3>
        <span className="text-sm text-text-secondary font-mono">{id.substring(0, 8)}...</span>
      </div>
      
      <div className="mb-4">
        <span className="text-accent text-lg font-bold">${budget_min} - ${budget_max}</span>
        <span className="text-text-secondary text-sm ml-2">per month</span>
      </div>
      
      <div className="space-y-2 mb-6">
        <div className="flex items-center text-text-secondary text-sm">
          <span className="flex-1">Duration</span>
          <span>{formatDateRange(startDate, endDate)}</span>
        </div>
        
        {(bedrooms || bathrooms) && (
          <div className="flex items-center text-text-secondary text-sm">
            <span className="flex-1">Space</span>
            <span>
              {bedrooms && `${bedrooms} ${bedrooms === 1 ? 'Bed' : 'Beds'}`}
              {bedrooms && bathrooms && ' • '}
              {bathrooms && `${bathrooms} ${bathrooms === 1 ? 'Bath' : 'Baths'}`}
            </span>
          </div>
        )}
        
        {distance_to_campus && (
          <div className="flex items-center text-text-secondary text-sm">
            <span className="flex-1">Distance to Campus</span>
            <span>{distance_to_campus} miles</span>
          </div>
        )}
      </div>
      
      {preferredApartments && preferredApartments.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-text-secondary mb-1">Preferred Apartments:</p>
          <div className="flex flex-wrap gap-1">
            {preferredApartments.map((apt, index) => (
              <span key={index} className="bg-bg-secondary text-text-primary text-xs px-2 py-1 rounded-full">
                {apt}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-auto pt-4 border-t border-border-light">
        {isOwner ? (
          <div className="flex gap-2">
            <Link href={`/requests/${id}/edit`} className="flex-1">
              <Button variant="secondary" fullWidth>Edit</Button>
            </Link>
            <Link href={`/requests/${id}`} className="flex-1">
              <Button variant="primary" fullWidth>View</Button>
            </Link>
          </div>
        ) : user ? (
          <Link href={`/requests/${id}`}>
            <Button variant="primary" fullWidth>Contact</Button>
          </Link>
        ) : (
          <Link href="/auth">
            <Button variant="primary" fullWidth>Sign in to Contact</Button>
          </Link>
        )}
      </div>
    </Card>
  );
} 