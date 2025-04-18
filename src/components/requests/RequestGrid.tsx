'use client';

import RequestCard from './RequestCard';

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
          <div key={index} className="animate-pulse bg-bg-secondary h-64 rounded-lg"></div>
        ))}
      </div>
    );
  }
  
  if (requests.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-text-secondary text-lg">No requests found.</p>
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