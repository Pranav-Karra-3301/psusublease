import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface AgencyCardProps {
  id: string;
  name: string;
  location?: string;
  logoUrl?: string;
  description?: string;
}

const AgencyCard: React.FC<AgencyCardProps> = ({ id, name, location, logoUrl, description }) => {
  return (
    <div className="bg-bg-secondary rounded-lg border border-border-light p-6 flex flex-col items-center justify-between min-h-[18rem] transition hover:shadow-sm">
      <div className="flex flex-col items-center">
        {logoUrl ? (
          <div className="relative w-24 h-24 mb-4 overflow-hidden">
            <Image
              src={logoUrl}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-contain rounded-lg border border-border-light"
            />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-lg bg-bg-secondary border border-border-light flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-text-secondary/50">
              {name.charAt(0)}
            </span>
          </div>
        )}
        <h2 className="text-xl font-bold text-text-primary mb-1 text-center">{name}</h2>
        <p className="text-text-secondary text-sm mb-2 text-center">{location || 'Location not specified'}</p>
        <p className="text-text-primary text-center line-clamp-3 mb-4">{description || 'No description provided.'}</p>
      </div>
      
      <Link
        href={`/agencies/${id}`}
        className="mt-auto text-accent font-medium hover:underline transition-colors"
      >
        View Details
      </Link>
    </div>
  );
};

export default AgencyCard; 