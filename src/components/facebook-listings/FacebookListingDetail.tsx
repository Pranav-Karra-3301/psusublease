"use client";

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

// Client component for displaying Facebook listing details
export default function FacebookListingDetail({ listing }: { listing: any }) {
  return (
    <div className="container mx-auto px-4 py-16 mt-16">
      <div className="max-w-3xl mx-auto">
        <Card className="p-8">
          <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center">
            <h1 className="text-2xl font-bold text-text-primary mb-2 md:mb-0">{listing.custom_apartment || 'Facebook Listing'}</h1>
            <span className="text-sm text-text-secondary">Posted on {listing.created_at ? new Date(listing.created_at).toLocaleDateString() : ''}</span>
          </div>
          
          {listing.apartments?.address && (
            <div className="mb-4 text-text-secondary">{listing.apartments.address}</div>
          )}
          
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="mb-2 text-text-secondary text-sm">Price</div>
              <div className="text-xl font-bold text-accent">${listing.offer_price || 'N/A'}</div>
            </div>
            <div>
              <div className="mb-2 text-text-secondary text-sm">Lease Dates</div>
              <div className="text-text-primary font-medium">
                {listing.start_date ? new Date(listing.start_date).toLocaleDateString() : 'N/A'} - {listing.end_date ? new Date(listing.end_date).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
          
          <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-border-light pt-6">
            <div>
              <div className="mb-2 text-text-secondary text-sm">Bedrooms</div>
              <div className="text-text-primary font-medium">{listing.bedrooms || 'N/A'}</div>
            </div>
            <div>
              <div className="mb-2 text-text-secondary text-sm">Bathrooms</div>
              <div className="text-text-primary font-medium">{listing.bathrooms || 'N/A'}</div>
            </div>
            <div>
              <div className="mb-2 text-text-secondary text-sm">Apartment</div>
              <div className="text-text-primary font-medium">{listing.custom_apartment || 'N/A'}</div>
            </div>
            <div>
              <div className="mb-2 text-text-secondary text-sm">Posted By</div>
              <div className="text-text-primary font-medium">{listing.author_username || 'Anonymous'}</div>
            </div>
          </div>
          
          {/* Special Requirements section (if present) */}
          {(listing.special_requirements || listing.parsed_listing_data?.special_requirements) && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-text-primary mb-3">Special Requirements</h2>
              <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                <p className="text-text-primary font-medium">
                  {listing.special_requirements || listing.parsed_listing_data?.special_requirements}
                </p>
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-3">Description</h2>
            <div className="bg-bg-secondary rounded-lg p-5 border border-border-light">
              <p className="text-text-secondary whitespace-pre-line">{listing.description}</p>
            </div>
          </div>
          
          {listing.amenities && listing.amenities.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-text-primary mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((a: string, i: number) => (
                  <span key={i} className="bg-bg-secondary text-text-secondary text-xs px-3 py-1.5 rounded-full border border-border-light">{a}</span>
                ))}
              </div>
            </div>
          )}
          
          {listing.images && listing.images.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-text-primary mb-3">Images</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {listing.images.map((img: string, idx: number) => (
                  <img key={idx} src={img} alt={`Listing Image ${idx + 1}`} className="rounded-lg object-cover w-full h-60 border border-border-light hover:shadow-lg transition-shadow" />
                ))}
              </div>
            </div>
          )}
          
          <div className="border-t border-border-light pt-6 mt-6">
            <h2 className="text-lg font-semibold text-text-primary mb-3">Facebook Source</h2>
            <div className="space-y-3">
              {listing.facebook_group_link && (
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary">Facebook Group:</span>
                  <a href={listing.facebook_group_link} target="_blank" rel="noopener noreferrer" className="text-accent underline">View Group</a>
                </div>
              )}
              {listing.facebook_post_link && (
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary">Original Post:</span>
                  <a href={listing.facebook_post_link} target="_blank" rel="noopener noreferrer" className="text-accent underline">View Post</a>
                </div>
              )}
              {listing.author_profile_link && (
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary">Author Profile:</span>
                  <a href={listing.author_profile_link} target="_blank" rel="noopener noreferrer" className="text-accent underline">View Profile</a>
                </div>
              )}
              {listing.author_username && (
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary">Author Username:</span>
                  <span className="text-text-primary">{listing.author_username}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border-light flex justify-center">
            <Button 
              onClick={() => window.history.back()}
              variant="secondary"
              className="mr-4"
            >
              Back to Listings
            </Button>
            {listing.facebook_post_link && (
              <Button 
                as="a"
                href={listing.facebook_post_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Facebook
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 