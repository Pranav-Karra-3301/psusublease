import React from 'react';

interface AgencyCardProps {
  id: string;
  name: string;
  location?: string;
  logoUrl?: string;
  description?: string;
}

const AgencyCard: React.FC<AgencyCardProps> = ({ id, name, location, logoUrl, description }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center justify-between min-h-[18rem] transition hover:shadow-md border border-gray-100">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={name}
          className="w-20 h-20 object-cover rounded-full mb-4 border border-gray-200"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-10 h-10 text-gray-300">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
      )}
      <h2 className="text-xl font-bold text-blue-900 mb-1 text-center">{name}</h2>
      <p className="text-gray-500 text-sm mb-2 text-center">{location || 'Location not specified'}</p>
      <p className="text-gray-700 text-center line-clamp-3 mb-4">{description || 'No description provided.'}</p>
      <a
        href={`/agencies/${id}`}
        className="mt-auto text-blue-700 font-medium hover:underline transition-colors"
      >
        View Details
      </a>
    </div>
  );
};

export default AgencyCard; 