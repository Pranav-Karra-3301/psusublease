import { notFound } from 'next/navigation';
import FacebookListingDetail from '@/components/facebook-listings/FacebookListingDetail';
import supabase from '@/utils/supabase';

// This is a server component
export default async function FacebookListingDetailPage({ params }: { params: { id: string } }) {
  // Directly access id from params in a server component
  const id = params.id;
  
  try {
    // Get facebook listing directly without using the hook
    const { data: facebookListing, error: facebookListingError } = await supabase
      .from('facebook_listings')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (facebookListingError) throw facebookListingError;
    
    if (!facebookListing) {
      notFound();
    }
    
    // Transform the data similar to the hook
    const parsed = facebookListing.parsed_listing_data || {};
    const transformedFacebookListing = {
      id: facebookListing.id,
      user_id: null,
      apartment_id: null,
      custom_apartment: parsed.apartment_name || '',
      apartments: { address: parsed.address || '', name: parsed.apartment_name || '' },
      floor_plan: parsed.floor_plan || '',
      bedrooms: parsed.bedrooms || 0,
      bathrooms: parsed.bathrooms || 0,
      current_rent: parsed.price || 0,
      offer_price: parsed.price || 0,
      negotiable: false,
      start_date: parsed.start_date || '',
      end_date: parsed.end_date || '',
      description: parsed.description || facebookListing.post_text || '',
      amenities: parsed.amenities || [],
      has_roommates: false,
      roommates_staying: null,
      gender_preference: null,
      images: facebookListing.images || [],
      created_at: facebookListing.created_at,
      updated_at: facebookListing.updated_at,
      is_facebook_listing: true,
      facebook_post_link: facebookListing.facebook_post_link,
      facebook_group_link: facebookListing.facebook_group_link,
      author_profile_link: facebookListing.author_profile_link,
      author_username: facebookListing.author_username,
      parsed_listing_data: parsed,
    };
    
    // Pass the listing data as props to the client component
    return <FacebookListingDetail listing={transformedFacebookListing} />;
  } catch (error) {
    console.error('Error fetching listing:', error);
    return (
      <div className="container mx-auto px-4 py-16 mt-16 flex justify-center">
        <div>Error loading listing. Please try again.</div>
      </div>
    );
  }
} 