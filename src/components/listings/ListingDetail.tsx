'use client';

import Image from 'next/image';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { formatDate, formatDateRange } from '@/utils/formatters';

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
  roommatesStaying?: number | boolean;
  genderPreference?: string;
  images?: string[];
  contactInfo?: {
    email?: string;
    phone?: string;
    preferredContact?: string;
  };
  createdAt?: string;
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
  images = ['/apt_defaults/default.png'],
  contactInfo,
  createdAt,
}: ListingDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const selectedImage = images[selectedImageIndex] || '/apt_defaults/default.png';
  const [showContact, setShowContact] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { user } = useAuthContext();
  
  const goToNextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };
  
  const goToPrevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Lightbox modal */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative w-full max-w-4xl h-[80vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full h-full">
              <Image
                src={selectedImage}
                alt={`${apartment} image ${selectedImageIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>
            
            {images.length > 1 && (
              <>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevImage();
                  }}
                  className="absolute left-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNextImage();
                  }}
                  className="absolute right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            <button 
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <div className="bg-black/50 px-4 py-2 rounded-full text-white text-sm">
                {selectedImageIndex + 1} / {images.length}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Left column - Images and details */}
      <div className="lg:col-span-2 space-y-6">
        {/* Images */}
        <Card variant="glass" className="overflow-hidden p-0">
          <div 
            className="relative h-[400px] w-full cursor-pointer overflow-hidden group"
            onClick={() => setLightboxOpen(true)}
          >
            <Image
              src={selectedImage}
              alt={`${apartment} listing`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="bg-black/60 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
            <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-lg text-sm font-medium z-10">
              {id}
            </div>
            
            {images.length > 1 && (
              <>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-white/80 p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-gray-800">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-white/80 p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-gray-800">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
          
          {images.length > 1 && (
            <div className="p-4 flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`h-16 w-24 relative rounded overflow-hidden transition-all ${
                    selectedImageIndex === index 
                      ? 'ring-2 ring-accent scale-105' 
                      : 'opacity-70 hover:opacity-100'
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
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-text-primary">{apartment}</h1>
            {createdAt && (
              <div className="text-sm text-text-secondary">
                Posted on {formatDate(createdAt)}
              </div>
            )}
          </div>
          <p className="text-text-secondary mb-4">{location}</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="flex flex-col">
              <span className="text-text-secondary text-sm">Price</span>
              <span className="text-accent text-xl font-bold">${price}/mo</span>
            </div>
            <div className="flex flex-col">
              <span className="text-text-secondary text-sm">Availability</span>
              <span className="text-text-primary">
                {formatDate(startDate)}
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
                {typeof roommatesStaying === 'boolean' 
                  ? (roommatesStaying ? 'Yes' : 'No')
                  : (roommatesStaying > 0 ? `Yes (${roommatesStaying})` : 'No')}
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
                {formatDateRange(startDate, endDate)}
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
          ) : user ? (
            <div className="space-y-4">
              <h3 className="text-base font-medium text-text-primary">Contact Information</h3>
              
              {contactInfo?.email && (
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-accent">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${contactInfo.email}`} className="text-text-primary hover:text-accent transition-colors">
                    {contactInfo.email}
                  </a>
                </div>
              )}
              
              {contactInfo?.phone && (
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-accent">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${contactInfo.phone}`} className="text-text-primary hover:text-accent transition-colors">
                    {contactInfo.phone}
                  </a>
                </div>
              )}
              
              {contactInfo?.preferredContact && (
                <p className="text-text-secondary text-sm mt-2">
                  <span className="text-text-primary font-medium">Preferred Contact Method: </span>
                  {contactInfo.preferredContact}
                </p>
              )}
            </div>
          ) : (
            <div className="relative">
              <div className="filter blur-sm">
                <h3 className="text-base font-medium text-text-primary">Contact Information</h3>
                <div className="flex items-center gap-3 my-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-accent">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-text-primary">example@email.com</span>
                </div>
                <div className="flex items-center gap-3 my-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-accent">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-text-primary">(555) 555-5555</span>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center flex-col bg-bg-primary/60 rounded p-2">
                <p className="text-center font-medium mb-2">Login to view contact info</p>
                <Link href="/auth">
                  <Button variant="primary" size="sm">Login</Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
        
        <Card variant="default" className="text-center p-4">
          <div className="text-sm text-text-secondary">
            <p className="mb-2">Report this listing</p>
            <button className="text-error hover:underline">
              Flag as inappropriate
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
} 