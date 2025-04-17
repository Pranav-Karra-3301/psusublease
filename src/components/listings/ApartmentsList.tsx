'use client';

import { useEffect, useState } from 'react';
import { useApartments } from '@/hooks/useApartments';
import { Apartment } from '@/types/Apartment';

export default function ApartmentsList() {
  const { getApartments, loading, error } = useApartments();
  const [apartments, setApartments] = useState<Apartment[]>([]);

  useEffect(() => {
    const fetchApartments = async () => {
      const { data } = await getApartments();
      if (data) {
        setApartments(data);
      }
    };

    fetchApartments();
  }, [getApartments]);

  if (loading) {
    return <div className="text-center py-8">Loading apartments...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-error">Error: {error}</div>;
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6">Available Apartments</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apartments.map((apartment) => (
          <div key={apartment.id} className="glass-card">
            <h3 className="text-xl font-semibold mb-2">{apartment.name}</h3>
            <p className="text-text-secondary mb-4">{apartment.address}</p>
            {apartment.website && (
              <p className="mb-2">
                <a 
                  href={apartment.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Visit Website
                </a>
              </p>
            )}
            {apartment.phone && (
              <p className="mb-2">Phone: {apartment.phone}</p>
            )}
            {apartment.email && (
              <p className="mb-2">Email: {apartment.email}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 