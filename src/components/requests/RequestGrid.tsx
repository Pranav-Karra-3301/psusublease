'use client';

import RequestCard from './RequestCard';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface Request {
  id: string;
  area_preference: string;
  distance_to_campus?: number | null;
  budget_min: number;
  budget_max: number;
  start_date: string;
  end_date: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  preferred_apartments?: string[] | null;
  user_id: string;
}

interface RequestGridProps {
  requests: Request[];
  isLoading?: boolean;
  currentUserId?: string;
}

export default function RequestGrid({
  requests,
  isLoading = false,
  currentUserId
}: RequestGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="loading-animation bg-white border border-gray-200 h-64 rounded-lg"></div>
        ))}
      </div>
    );
  }
  
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-16 h-16 text-gray-400 mb-4">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4.5 3.5 0 0-1.5 4.5-5.5 4.5s-5.5-4.5-5.5-4.5m5.5 7v1m0 0v1m0-1h1m-1 0h-1" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests found</h3>
        <p className="text-gray-600 text-center max-w-md mb-6">
          There are no sublease requests available at the moment. Be the first to post what you're looking for!
        </p>
        <Link href="/requests/create">
          <Button>Post a Request</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {requests.map(request => (
        <RequestCard
          key={request.id}
          id={request.id}
          area={request.area_preference}
          distance_to_campus={request.distance_to_campus}
          budget_min={request.budget_min}
          budget_max={request.budget_max}
          startDate={request.start_date}
          endDate={request.end_date}
          bedrooms={request.bedrooms}
          bathrooms={request.bathrooms}
          preferredApartments={request.preferred_apartments}
          isOwner={currentUserId === request.user_id}
        />
      ))}
    </div>
  );
} 