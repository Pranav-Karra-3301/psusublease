'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import RequestGrid from '@/components/requests/RequestGrid';
import { useSubleaseRequests } from '@/hooks/useSubleaseRequests';
import { useAuthContext } from '@/components/auth/AuthProvider';

export default function RequestsPage() {
  const { user } = useAuthContext();
  const { getRequests } = useSubleaseRequests();
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  
  // Fetch requests from Supabase
  useEffect(() => {
    let isMounted = true;
    
    async function fetchRequests() {
      if (!isMounted) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await getRequests();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('Error fetching requests:', error);
          if (isMounted) {
            setRequests([]);
            setFilteredRequests([]);
          }
          return;
        }
        
        if (data && data.length > 0) {
          if (isMounted) {
            setRequests(data);
            setFilteredRequests(data);
          }
        } else {
          if (isMounted) {
            setRequests([]);
            setFilteredRequests([]);
          }
        }
      } catch (err) {
        console.error('Error in fetchRequests:', err);
        if (isMounted) {
          setRequests([]);
          setFilteredRequests([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    fetchRequests();
    
    return () => {
      isMounted = false;
    };
  }, [getRequests]);
  
  // Apply filters and sorting
  useEffect(() => {
    let result = [...requests];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(request => 
        request.area_preference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (request.preferred_apartments && request.preferred_apartments.some((apt: string) => 
          apt.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );
    }
    
    // Apply price filter for minimum budget
    if (priceRange.min) {
      result = result.filter(request => request.budget_min >= Number(priceRange.min));
    }
    
    // Apply price filter for maximum budget
    if (priceRange.max) {
      result = result.filter(request => request.budget_max <= Number(priceRange.max));
    }
    
    // Apply bedroom filter
    if (bedrooms) {
      result = result.filter(request => request.bedrooms === Number(bedrooms));
    }
    
    // Apply bathroom filter
    if (bathrooms) {
      result = result.filter(request => request.bathrooms === Number(bathrooms));
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'budget_low':
        result.sort((a: any, b: any) => a.budget_min - b.budget_min);
        break;
      case 'budget_high':
        result.sort((a: any, b: any) => b.budget_max - a.budget_max);
        break;
      case 'start_date':
        result.sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
        break;
      case 'latest':
      default:
        result.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }
    
    setFilteredRequests(result);
  }, [searchQuery, requests, priceRange, bedrooms, bathrooms, sortBy]);
  
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-text-primary">Browse Sublease Requests</h1>
        <Link href="/requests/create">
          <Button variant="primary">Post a Request</Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters sidebar */}
        <div className="lg:col-span-1">
          <Card variant="glass" className="sticky top-24">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Filters</h2>
            
            <div className="space-y-6">
              <div>
                <Input
                  label="Search"
                  placeholder="Area, apartment name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-primary mb-2 block">
                  Budget Range
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
        
        {/* Requests content */}
        <div className="lg:col-span-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <p className="text-text-secondary">
              Showing {filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'}
            </p>
            
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'latest', label: 'Latest' },
                { value: 'budget_low', label: 'Budget: Low to High' },
                { value: 'budget_high', label: 'Budget: High to Low' },
                { value: 'start_date', label: 'Start Date' },
              ]}
              className="w-full md:w-48"
            />
          </div>
          
          <RequestGrid
            requests={filteredRequests}
            isLoading={isLoading}
            currentUserId={user?.id}
          />
        </div>
      </div>
    </div>
  );
} 