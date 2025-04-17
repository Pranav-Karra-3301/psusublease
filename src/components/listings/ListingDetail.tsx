'use client';

import Image from 'next/image';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface ListingDetailProps {
  id: string;
  apartment: string;
  location: string;
  price: number;
  startDate: string;
  endDate: string;
  bedrooms: number;
  bathrooms: number;
  description?: string;
  amenities?: string[];
  hasRoommates?: boolean;
  roommatesStaying?: boolean;
  genderPreference?: string;
  images?: string[];
  contactInfo?: {
    email?: string;
    phone?: string;
    preferredContact?: string;
  };
}

export default function ListingDetail({
  id,
  apartment,
  location,
  price,
  startDate,
  endDate,
  bedrooms,
  bathrooms,
  description = '',
  amenities = [],
  hasRoommates = false,
  roommatesStaying = false,
  genderPreference = '',
  images = ['/placeholder.jpg'],
  contactInfo,
}: ListingDetailProps) {
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [showContact, setShowContact] = useState(false);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left column - Images and details */}
      <div className="lg:col-span-2 space-y-6">
        {/* Images */}
        <Card variant="glass" className="overflow-hidden p-0">
          <div className="relative h-[400px] w-full">
            <Image
              src={selectedImage}
              alt={`${apartment} listing`}
              fill
              className="object-cover"
            />
            <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-lg text-sm font-medium">
              {id}
            </div>
          </div>
          
          {images.length > 1 && (
            <div className="p-4 flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(image)}
                  className={`h-16 w-24 relative rounded overflow-hidden ${
                    selectedImage === image ? 'ring-2 ring-accent' : 'opacity-70'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </Card>
        
        {/* Main details */}
        <Card variant="glass">
          <h1 className="text-2xl font-bold text-text-primary mb-2">{apartment}</h1>
          <p className="text-text-secondary mb-4">{location}</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="flex flex-col">
              <span className="text-text-secondary text-sm">Price</span>
              <span className="text-accent text-xl font-bold">${price}/mo</span>
            </div>
            <div className="flex flex-col">
              <span className="text-text-secondary text-sm">Availability</span>
              <span className="text-text-primary">
                {new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-text-secondary text-sm">Bedrooms</span>
              <span className="text-text-primary">{bedrooms}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-text-secondary text-sm">Bathrooms</span>
              <span className="text-text-primary">{bathrooms}</span>
            </div>
          </div>
          
          <div className="border-t border-border-light pt-4 mb-4">
            <h2 className="text-lg font-semibold text-text-primary mb-2">Description</h2>
            <p className="text-text-secondary">
              {description || "No description provided for this listing."}
            </p>
          </div>
        </Card>
        
        {/* Amenities */}
        {amenities.length > 0 && (
          <Card variant="glass">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Amenities</h2>
            <div className="grid grid-cols-2 gap-3">
              {amenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-accent">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-text-primary">{amenity}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
        
        {/* Roommate information */}
        {hasRoommates && (
          <Card variant="glass">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Roommate Information</h2>
            <div className="space-y-2">
              <p className="text-text-secondary">
                <span className="text-text-primary font-medium">Current Roommates: </span>
                Yes
              </p>
              <p className="text-text-secondary">
                <span className="text-text-primary font-medium">Roommates Staying: </span>
                {roommatesStaying ? 'Yes' : 'No'}
              </p>
              {genderPreference && (
                <p className="text-text-secondary">
                  <span className="text-text-primary font-medium">Gender Preference: </span>
                  {genderPreference}
                </p>
              )}
            </div>
          </Card>
        )}
      </div>
      
      {/* Right column - Contact and actions */}
      <div className="lg:col-span-1 space-y-6">
        <Card variant="glass">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Listing Summary</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-text-secondary">Monthly Rent</span>
              <span className="text-text-primary font-medium">${price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Lease Period</span>
              <span className="text-text-primary font-medium">
                {new Date(startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 
                {new Date(endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Apartment</span>
              <span className="text-text-primary font-medium">{apartment}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Location</span>
              <span className="text-text-primary font-medium">{location}</span>
            </div>
          </div>
          
          <div className="border-t border-border-light pt-4 mb-4">
            <h3 className="text-base font-medium text-text-primary mb-2">Listing ID</h3>
            <div className="flex items-center justify-between bg-bg-secondary px-3 py-2 rounded-lg">
              <span className="text-text-primary font-mono">{id}</span>
              <button className="text-accent hover:text-accent/80 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
          
          {!showContact ? (
            <Button
              variant="primary"
              fullWidth
              onClick={() => setShowContact(true)}
            >
              Show Contact Information
            </Button>
          ) : contactInfo ? (
            <div className="space-y-4">
              <h3 className="text-base font-medium text-text-primary">Contact Information</h3>
              
              {contactInfo.email && (
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-accent">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${contactInfo.email}`} className="text-text-primary hover:text-accent transition-colors">
                    {contactInfo.email}
                  </a>
                </div>
              )}
              
              {contactInfo.phone && (
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-accent">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${contactInfo.phone}`} className="text-text-primary hover:text-accent transition-colors">
                    {contactInfo.phone}
                  </a>
                </div>
              )}
              
              {contactInfo.preferredContact && (
                <p className="text-text-secondary text-sm mt-2">
                  <span className="text-text-primary font-medium">Preferred Contact Method: </span>
                  {contactInfo.preferredContact}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center p-4 bg-bg-secondary rounded-lg">
              <p className="text-text-secondary">Login required to view contact information</p>
              <Button variant="secondary" className="mt-3" fullWidth>
                Sign In
              </Button>
            </div>
          )}
        </Card>
        
        <Card variant="outline" className="text-center p-4">
          <div className="text-sm text-text-secondary">
            <p className="mb-2">Report this listing</p>
            <button className="text-error hover:underline">
              Report suspicious activity
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
} 