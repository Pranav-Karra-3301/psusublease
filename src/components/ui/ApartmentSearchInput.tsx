'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useApartments } from '@/hooks/useApartments';

interface Apartment {
  id: string;
  name: string;
  address: string;
  defaultImage: string;
}

interface SuggestedDestination {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface ApartmentSearchInputProps {
  label?: string;
  value: string;
  onChange: (id: string, apartment: Apartment | null) => void;
  apartments: Apartment[];
  customOption?: boolean;
}

export default function ApartmentSearchInput({
  label,
  value,
  onChange,
  apartments,
  customOption = true,
}: ApartmentSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<Apartment[]>([]);
  const inputRef = useRef<HTMLDivElement>(null);

  // Initialize searchQuery with the selected apartment name
  useEffect(() => {
    if (value) {
      if (value === 'custom') {
        setSearchQuery('My apartment is not listed');
      } else {
        const selectedApartment = apartments.find(apt => apt.id === value);
        if (selectedApartment) {
          setSearchQuery(selectedApartment.name);
        } else {
          setSearchQuery('');
        }
      }
    }
  }, [value, apartments]);

  // Suggested destinations (static content)
  const suggestedDestinations: SuggestedDestination[] = [
    {
      id: 'nearby',
      name: 'Nearby',
      description: 'Find what\'s around you',
      icon: '/icons/location.svg'
    },
    {
      id: 'popular',
      name: 'Common Apartments',
      description: 'Frequently chosen options',
      icon: '/icons/trending.svg'
    },
  ];

  // Filter apartments based on search query
  const filteredApartments = searchQuery.trim() === '' 
    ? [] 
    : apartments.filter(apt => 
        apt.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        apt.address.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 10);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load recent searches
  useEffect(() => {
    const loadRecentSearches = () => {
      try {
        const storedSearches = localStorage.getItem('recentApartmentSearches');
        if (storedSearches) {
          const parsed = JSON.parse(storedSearches);
          if (Array.isArray(parsed)) {
            // Only show up to 3 recent searches
            setRecentSearches(parsed.slice(0, 3));
          }
        }
      } catch (err) {
        console.error('Error loading recent searches:', err);
      }
    };

    loadRecentSearches();
  }, []);

  // Add apartment to recent searches
  const addToRecentSearches = (apartment: Apartment) => {
    try {
      let updatedSearches = [...recentSearches];
      
      // Remove if already exists to avoid duplicates
      updatedSearches = updatedSearches.filter(apt => apt.id !== apartment.id);
      
      // Add to beginning of array
      updatedSearches.unshift(apartment);
      
      // Limit to 3 items
      updatedSearches = updatedSearches.slice(0, 3);
      
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentApartmentSearches', JSON.stringify(updatedSearches));
    } catch (err) {
      console.error('Error saving recent searches:', err);
    }
  };

  const handleSelectApartment = (apartment: Apartment) => {
    onChange(apartment.id, apartment);
    setSearchQuery(apartment.name);
    setIsOpen(false);
    addToRecentSearches(apartment);
  };

  const handleSelectCustom = () => {
    onChange('custom', null);
    setSearchQuery('My apartment is not listed');
    setIsOpen(false);
  };

  // Get a list of 3 popular apartments
  const getPopularApartments = () => {
    // In a real app, this would be based on analytics or most viewed
    // For now, just return the first 3 apartments
    return apartments.slice(0, 3);
  };

  // Make sure the dropdown includes the custom option at the end of the search results
  const renderCustomOption = () => {
    if (!customOption) return null;
    
    return (
      <div 
        className="flex items-center hover:bg-bg-hover rounded-lg cursor-pointer p-4"
        onClick={handleSelectCustom}
      >
        <div className="w-10 h-10 mr-3 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-text-secondary">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div className="font-medium text-text-primary">My apartment is not listed</div>
      </div>
    );
  };

  return (
    <div className="w-full" ref={inputRef}>
      {label && (
        <label className="text-sm font-medium text-text-primary block mb-2">
          {label}
        </label>
      )}
      
      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center w-full bg-bg-secondary border border-border-light rounded-lg overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-accent transition-all duration-200">
          <div className="flex items-center justify-center pl-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-text-secondary">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <input
            type="text"
            className="w-full px-3 py-3 bg-transparent border-none text-text-primary placeholder:text-text-secondary/50 focus:outline-none"
            placeholder="Select your apartment"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
          />
        </div>
        
        {/* Dropdown Results */}
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-bg-secondary border border-border-light rounded-lg shadow-lg max-h-[500px] overflow-y-auto">
            {/* Recent Searches Section */}
            {recentSearches.length > 0 && (
              <div className="p-4">
                <h3 className="text-text-primary text-lg font-medium mb-4">Recent searches</h3>
                <div className="space-y-4">
                  {recentSearches.map((apt) => (
                    <div 
                      key={apt.id} 
                      className="flex items-center hover:bg-bg-hover rounded-lg cursor-pointer p-2"
                      onClick={() => handleSelectApartment(apt)}
                    >
                      <div className="w-16 h-16 relative mr-4 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        <Image 
                          src={apt.defaultImage || '/apt_defaults/default.png'} 
                          alt={apt.name}
                          className="object-cover"
                          fill
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-text-primary text-lg">{apt.name}</div>
                        <div className="text-text-secondary">{apt.address}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Search Results */}
            {searchQuery.trim() !== '' && (
              <div className="p-4 border-t border-border-light">
                <h3 className="text-text-primary text-lg font-medium mb-4">
                  {filteredApartments.length > 0 ? 'Search results' : 'No results found'}
                </h3>
                <div className="space-y-4">
                  {customOption && renderCustomOption()}
                  {filteredApartments.map((apt) => (
                    <div 
                      key={apt.id} 
                      className="flex items-center hover:bg-bg-hover rounded-lg cursor-pointer p-2"
                      onClick={() => handleSelectApartment(apt)}
                    >
                      <div className="w-16 h-16 relative mr-4 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        <Image 
                          src={apt.defaultImage || '/apt_defaults/default.png'} 
                          alt={apt.name}
                          className="object-cover"
                          fill
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-text-primary text-lg">{apt.name}</div>
                        <div className="text-text-secondary">{apt.address}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Suggested Destinations */}
            {searchQuery.trim() === '' && (
              <div className={`p-4 ${recentSearches.length > 0 ? 'border-t border-border-light' : ''}`}>
                <h3 className="text-text-primary text-lg font-medium mb-4">Select from list</h3>
                <div className="space-y-4">
                  {suggestedDestinations.map((destination) => (
                    <div 
                      key={destination.id} 
                      className="flex items-center hover:bg-bg-hover rounded-lg cursor-pointer p-2"
                      onClick={() => {
                        if (destination.id === 'popular') {
                          // Do nothing special, popular apartments will be shown below
                        } else if (destination.id === 'nearby') {
                          // In a real app, this would use geolocation
                          // For demo purposes, just show a selection of apartments
                          const randomApartments = apartments.sort(() => 0.5 - Math.random()).slice(0, 3);
                          if (randomApartments.length > 0) {
                            handleSelectApartment(randomApartments[0]);
                          }
                        }
                      }}
                    >
                      <div className="w-16 h-16 relative mr-4 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-text-primary text-lg">{destination.name}</div>
                        <div className="text-text-secondary">{destination.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Popular Apartments */}
            {searchQuery.trim() === '' && (
              <div className="p-4 border-t border-border-light">
                <h3 className="text-text-primary text-lg font-medium mb-4">Common apartments</h3>
                <div className="space-y-4">
                  {getPopularApartments().map((apt) => (
                    <div 
                      key={apt.id} 
                      className="flex items-center hover:bg-bg-hover rounded-lg cursor-pointer p-2"
                      onClick={() => handleSelectApartment(apt)}
                    >
                      <div className="w-16 h-16 relative mr-4 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        <Image 
                          src={apt.defaultImage || '/apt_defaults/default.png'} 
                          alt={apt.name}
                          className="object-cover"
                          fill
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-text-primary text-lg">{apt.name}</div>
                        <div className="text-text-secondary">{apt.address}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 