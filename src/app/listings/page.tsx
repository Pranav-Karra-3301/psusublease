'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import ListingGrid from '@/components/listings/ListingGrid';

// Mock data for listings (will be replaced with real data from Supabase)
const mockListings = [
  {
    id: 'BLUE-723',
    apartment: 'The Rise',
    location: 'Downtown State College',
    price: 750,
    startDate: '2023-08-01',
    endDate: '2024-07-31',
    bedrooms: 2,
    bathrooms: 2,
    image: '/placeholder.jpg'
  },
  {
    id: 'LION-491',
    apartment: 'The Metropolitan',
    location: 'Downtown State College',
    price: 850,
    startDate: '2023-08-01',
    endDate: '2024-07-31',
    bedrooms: 1,
    bathrooms: 1,
    image: '/placeholder.jpg'
  },
  {
    id: 'NITT-382',
    apartment: 'The Legacy',
    location: 'South State College',
    price: 700,
    startDate: '2023-08-01',
    endDate: '2024-07-31',
    bedrooms: 3,
    bathrooms: 2,
    image: '/placeholder.jpg'
  },
  {
    id: 'PENN-654',
    apartment: 'Calder Commons',
    location: 'North State College',
    price: 600,
    startDate: '2023-08-01',
    endDate: '2024-07-31',
    bedrooms: 1,
    bathrooms: 1,
    image: '/placeholder.jpg'
  },
  {
    id: 'VALE-289',
    apartment: 'The Station',
    location: 'East State College',
    price: 900,
    startDate: '2023-08-01',
    endDate: '2024-07-31',
    bedrooms: 2,
    bathrooms: 2,
    image: '/placeholder.jpg'
  },
  {
    id: 'STAT-107',
    apartment: 'Here State College',
    location: 'West State College',
    price: 800,
    startDate: '2023-08-01',
    endDate: '2024-07-31',
    bedrooms: 3,
    bathrooms: 3,
    image: '/placeholder.jpg'
  }
];

export default function ListingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState(mockListings);
  const [filteredListings, setFilteredListings] = useState(mockListings);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter states
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  
  // Mock loading effect
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Apply filters and sorting
  useEffect(() => {
    let result = [...listings];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(listing => 
        listing.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.apartment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply price filter
    if (priceRange.min) {
      result = result.filter(listing => listing.price >= Number(priceRange.min));
    }
    if (priceRange.max) {
      result = result.filter(listing => listing.price <= Number(priceRange.max));
    }
    
    // Apply bedroom filter
    if (bedrooms) {
      result = result.filter(listing => listing.bedrooms === Number(bedrooms));
    }
    
    // Apply bathroom filter
    if (bathrooms) {
      result = result.filter(listing => listing.bathrooms === Number(bathrooms));
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'price_low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'start_date':
        result.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        break;
      case 'latest':
      default:
        // In real app, we'd sort by creation date
        result = result;
        break;
    }
    
    setFilteredListings(result);
  }, [searchQuery, listings, priceRange, bedrooms, bathrooms, sortBy]);
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setPriceRange({ min: '', max: '' });
    setBedrooms('');
    setBathrooms('');
    setSortBy('latest');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-text-primary mb-8">Browse Listings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters sidebar */}
        <div className="lg:col-span-1">
          <Card variant="glass" className="sticky top-24">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Filters</h2>
            
            <div className="space-y-6">
              <div>
                <Input
                  label="Search"
                  placeholder="Listing ID, apartment, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-primary mb-2 block">
                  Price Range
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-1/2"
                  />
                  <span className="text-text-secondary">-</span>
                  <Input
                    placeholder="Max"
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-1/2"
                  />
                </div>
              </div>
              
              <div>
                <Select
                  label="Bedrooms"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  options={[
                    { value: '', label: 'Any' },
                    { value: '1', label: '1 Bedroom' },
                    { value: '2', label: '2 Bedrooms' },
                    { value: '3', label: '3 Bedrooms' },
                    { value: '4', label: '4+ Bedrooms' },
                  ]}
                />
              </div>
              
              <div>
                <Select
                  label="Bathrooms"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  options={[
                    { value: '', label: 'Any' },
                    { value: '1', label: '1 Bathroom' },
                    { value: '2', label: '2 Bathrooms' },
                    { value: '3', label: '3+ Bathrooms' },
                  ]}
                />
              </div>
              
              <Button
                variant="secondary"
                onClick={resetFilters}
                fullWidth
              >
                Reset Filters
              </Button>
            </div>
          </Card>
        </div>
        
        {/* Listings content */}
        <div className="lg:col-span-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <p className="text-text-secondary">
              Showing {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'}
            </p>
            
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'latest', label: 'Latest' },
                { value: 'price_low', label: 'Price: Low to High' },
                { value: 'price_high', label: 'Price: High to Low' },
                { value: 'start_date', label: 'Start Date' },
              ]}
              className="w-full md:w-48"
            />
          </div>
          
          <ListingGrid listings={filteredListings} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
} 