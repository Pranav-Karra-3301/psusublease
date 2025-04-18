'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import supabase from '@/utils/supabase';
import ApartmentSearchInput from '@/components/ui/ApartmentSearchInput';
import { useApartments } from '@/hooks/useApartments';
import { useListings } from '@/hooks/useListings';

// Default apartments for fallback
const defaultApartments = [
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Alight State College', address: '348 Blue Course Dr.', website: 'https://alight-statecollege.com/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', name: 'Allen Park', address: '1013 S. Allen and Westerly Parkway', website: 'https://www.lenwoodinc.com', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', name: 'Ambassador', address: '421 E. Beaver Ave', website: 'https://www.arpm.com/property/ambassador/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', name: 'Alexander Court', address: '309 E Beaver St, State College', website: 'https://www.livethecanyon.com/alexander-court', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', name: 'Armenara Plaza', address: '131 Sowers Street - near Pollack and Beaver', website: 'https://www.arpm.com/property/armenara-plaza/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', name: 'Barcroft', address: '522 E. College Ave, across from campus on College Ave', website: 'https://www.arpm.com/property/barcroft/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', name: 'Beaver Hill Apartments', address: '340 East Beaver Avenue', website: 'https://www.risestatecollege.com', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', name: 'Beaver Plaza', address: '222 W Beaver Ave', website: 'https://www.arpm.com/property/beaver-plaza/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', name: 'Beaver Terrace', address: '456 E. Beaver', website: 'https://www.arpm.com/property/beaver-terrace/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', name: 'Blue Course Commons', address: '446 Blue Course Dr, Near Giant shopping Center', website: 'https://www.offcampushousingstatecollege.com/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', name: 'Bryce Jordan Towers', address: '463 E. Beaver Ave', website: 'https://www.arpm.com/property/bryce-jordan-tower/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', name: 'Bryn, the', address: '601 Vairo Boulevard', website: 'https://livethebryn.com/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', name: 'Burrowes Corner', address: '119 S Burrowes St', website: 'https://www.gnrealty.com/burrowes-corner', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', name: 'Calder Commons', address: '520 E Calder Way # A', website: 'https://www.caldercommons.com/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', name: 'Campus Tower', address: '419 Beaver Ave', website: 'https://campustowersc.com/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', name: 'Campus View', address: '106 E. College Ave', website: 'https://www.arpm.com/property/campus-view/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27', name: 'Carlton Apartments', address: '325 South Garner St', website: 'https://www.apartmentstore.com/building/state-college/carlton-apartments', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a28', name: 'Cedarbrook', address: '320 E Beaver Ave', website: 'https://www.livethecanyon.com', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a29', name: 'Centre Court', address: '141 S. Garner St.', website: 'http://www.centrecourtsc.com/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a30', name: 'Cliffside Apartments', address: '723 S. Atherton', website: 'https://www.arpm.com/property/cliffside-apartments/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', name: 'College Avenue Apartments', address: '536 West College Ave.', website: 'https://www.apartmentstore.com/building/state-college/college-avenue-apartments', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', name: 'College Park', address: '415 W. College Ave, College Ave and Atherton St, less than 1 block from IST bldg', website: 'https://www.lenwoodinc.com', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', name: 'Collegian', address: '217 S Atherton St', website: 'https://www.arpm.com/property/collegian/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', name: 'Collegiate Arms', address: '218 Sparks St.', website: 'https://www.apartmentstore.com/building/state-college/collegiate-arms', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a35', name: 'Crestmont Apartments', address: '901 S. Allen St', website: 'https://www.arpm.com/property/crestmont-apartments/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a36', name: 'Diplomat, The', address: '329 E Beaver', website: 'https://www.livethecanyon.com', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a37', name: 'East Side', address: '736 East Foster Avenue', website: 'https://www.gnrealty.com/east-side-apartments', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a38', name: 'Fairmount Hills Apartments', address: '215 W. Fairmount Ave., W. Fairmount Ave and Fraser Street - by memorial field.', website: 'https://www.arpm.com/property/fairmount-hills', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a39', name: 'Fromm Building', address: '112-118 E. College Ave', website: 'https://www.rentpfe.com/listings/rent-student-apartments-fromm-building/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a40', name: 'Garner Court', address: '228 S Garner St', website: 'https://www.livethecanyon.com', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', name: 'GN Centre', address: '142 S. Allen', website: 'https://www.gnrealty.com/gn-centre', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42', name: 'Graduate, The', address: '138 South Atherton Street', website: 'https://www.gnrealty.com/the-graduate', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a43', name: 'Hamilton Apartments', address: '204 & 220 E. Hamilton Ave', website: 'https://hamiltonaveapartments.rentpmi.com/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', name: 'Heights, The', address: '201 Northwick Blvd, next to PSU golf course', website: 'https://www.heightsatstatecollege.com/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a45', name: 'Hetzel Plaza', address: '500 E. College Ave', website: 'https://www.arpm.com/property/hetzel-plaza/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a46', name: 'Highland Tower', address: '226 Highland Ave', website: 'https://www.apartmentsstatecollege.com/highland-towers-apartments', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a47', name: 'Holly House', address: '825 S. Allen St', website: 'https://www.arpm.com/property/holly-house/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a48', name: 'Ivy Place', address: '236 S Fraser St', website: 'https://www.arpm.com/property/ivy-place/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a49', name: 'Keystone Apartments', address: '728 W College Ave', website: 'https://720collegeavenue.rentpmi.com/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a50', name: 'Laurel Terrace', address: '317 E Beaver', website: 'https://laurelterrace.rentpmi.com/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51', name: 'Legacy, The', address: '478 E Calder Way', website: 'https://www.thelegacystatecollege.com', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a52', name: 'Legend, The', address: '246 Highland Ave', website: 'https://www.arpm.com/property/legend/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a53', name: 'Lennwood Place', address: '917 S. Allen Street', website: 'https://www.lenwoodinc.com', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a54', name: 'Lexington House Apartments', address: '518 University Drive - by Burger King', website: 'https://www.apartmentstore.com/building/state-college/lexington-house', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', name: 'Lion, The', address: '245 South Atherton Street', website: 'https://www.gnrealty.com/the-lion/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a56', name: 'Maxxen, The', address: '131 Heister', website: 'https://www.themaxxen.com', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a57', name: 'Meridian', address: '646 E. College Ave (at University Dr)', website: 'https://meridianoncollegeavenue.com', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a58', name: 'Metropolitan, The', address: 'center of town', website: 'https://www.themetstatecollege.com', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a59', name: 'Mount Nittany', address: '1006 S Pugh St (S. Pugh Street and Westerly Parkway)', website: 'https://www.lenwoodinc.com', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a60', name: 'Nicholas Tower', address: '301 S. Pugh St', website: 'https://www.apartmentstore.com/building/state-college/nicholas-tower', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a61', name: 'Nittany Garden Apartments', address: '445 Waupelani Dr - closer to high school', website: 'https://www.apartmentstore.com/building/state-college/nittany-gardens', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a62', name: 'Nittany View Apartments', address: '804 South Allen Street', website: 'https://www.arpm.com/property/nittany-view/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a63', name: 'O\'Brien Place', address: '300 S. Pugh St', website: 'https://www.arpm.com/property/obrien-place/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a64', name: 'Palmerton', address: '316 W. Beaver Avenue, West Beaver and Atherton', website: 'https://statecollege.apartmentstore.com/state-college/palmerton/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a65', name: 'Park Crest Terrace', address: '1400 Martin St., by Tudek park.', website: 'https://calibreresidential.com/properties/student-housing-state-college-park-crest-terrace/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', name: 'Park Hill', address: '478 E Beaver Ave', website: 'https://www.liveparkhill.com/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a67', name: 'Park Place', address: '224 S. Burrowes St', website: 'https://www.gnrealty.com/park-place', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a68', name: 'Parkway Plaza', address: '1000 Plaza Drive', website: 'https://www.liveparkwayplaza.com', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a69', name: 'Penn Tower', address: '255 East Beaver Avenue', website: 'https://www.arpm.com/property/penn-tower/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a70', name: 'Penn State Apartments', address: '525 West Foster Ave', website: 'https://www.apartmentstore.com/locations/state-college/penn-state-apartments', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a71', name: 'Peppermill Condos', address: '710 S Atherton St', website: 'http://www.peppermillcoa.com/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a72', name: 'Phoenix, The', address: '501 E. Beaver Ave', website: 'https://www.arpm.com/property/phoenix/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a73', name: 'Pointe, The', address: '501 Vairo Blvd, Behind Walmart shopping plaza', website: 'https://www.pointestatecollege.com', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a74', name: 'Pugh Centre', address: '150 E. Beaver Avenue', website: 'https://www.arpm.com/property/pugh-centre/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a75', name: 'Pugh St Assoc Apartments', address: 'Above Sheetz on Pugh', website: 'https://www.hawbakerengineering.com/experience/pugh-street-associates-apartments/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a76', name: 'Retreat, The', address: '300 Waupelani Dr', website: 'https://www.retreatstatecollege.com', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', name: 'Rise, the', address: '532 E College Ave', website: '', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a78', name: 'Standard, The', address: '330 W College Ave', website: 'https://www.thestandardstatecollege.com', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a79', name: 'State College Collective', address: '4 communities', website: 'https://www.statecollegecollective.com/', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a80', name: 'Sutton Court Apartments', address: '674 E Prospect Ave', website: 'https://www.apartmentstore.com/building/state-college/sutton-court', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a81', name: 'The Americana', address: '119 Locust Lane', website: 'https://americanahouse.rentpmi.com', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a82', name: 'Town Square', address: '119 S Burrowes St', website: 'https://www.gnrealty.com/town-square', defaultImage: '/apt_defaults/default.png' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a83', name: 'Towneview Apartments', address: 'South Pugh & Bradley', website: 'https://www.lenwoodinc.com', defaultImage: '/apt_defaults/default.png' },
];

// Amenities options
const amenityOptions = [
  'In-unit Washer/Dryer',
  'Fully Furnished',
  'Gym Access',
  'Pool',
  'High-Speed Internet',
  'Parking Included',
  'Cable TV Included',
  'Utilities Included',
  'Pet Friendly',
  'Balcony/Patio',
  'Air Conditioning',
  'Dishwasher',
  'Security System',
  'Study Room',
  'Bus Route',
];

// Define the component props to include initialData and isEditMode
interface CreateListingFormProps {
  initialData?: any;
  isEditMode?: boolean;
}

export default function CreateListingForm({ initialData, isEditMode = false }: CreateListingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [apartments, setApartments] = useState(defaultApartments);
  const { getApartments } = useApartments();
  const { updateListing } = useListings();

  // Debug the initialData
  useEffect(() => {
    if (initialData && isEditMode) {
      console.log('Edit mode with initialData:', initialData);
    }
  }, [initialData, isEditMode]);

  // Fetch apartments from database
  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const { data, error } = await getApartments();
        if (error) {
          console.error('Error fetching apartments:', error);
          // Fallback to default apartments on error
          setApartments(defaultApartments);
          return;
        }
        
        if (data && data.length > 0) {
          // Transform data to include defaultImage and ensure type compatibility
          const transformedData = data.map(apt => ({
            id: apt.id || `fallback-${apt.name}`,  // Ensure id exists
            name: apt.name || 'Unknown',  // Ensure name exists
            address: apt.address || '',  // Ensure address exists
            website: apt.website || '',  // Ensure website exists
            defaultImage: '/apt_defaults/default.png'
          }));
          setApartments(transformedData);
        } else {
          // Fallback to default apartments if no data returned
          setApartments(defaultApartments);
        }
      } catch (err) {
        console.error('Error in fetchApartments:', err);
        // Fallback to default apartments on any error
        setApartments(defaultApartments);
      }
    };

    fetchApartments();
  }, [getApartments]);

  // Form state - initialize with initialData if provided
  const [listingData, setListingData] = useState({
    apartmentId: initialData ? (initialData.apartment_id || 'custom') : '',
    customApartment: initialData ? (initialData.custom_apartment || '') : '',
    floorPlan: initialData ? (initialData.floor_plan || '') : '',
    bedrooms: initialData ? initialData.bedrooms.toString() : '1',
    bathrooms: initialData ? initialData.bathrooms.toString() : '1',
    privateRoom: initialData ? !!initialData.private_bathroom : false,
    currentRent: initialData ? initialData.current_rent.toString() : '',
    offerPrice: initialData ? initialData.offer_price.toString() : '',
    negotiable: initialData ? initialData.negotiable : false,
    startDate: initialData ? initialData.start_date : '',
    endDate: initialData ? initialData.end_date : '',
    description: initialData ? (initialData.description || '') : '',
    amenities: initialData ? (initialData.amenities || []) : [] as string[],
    hasRoommates: initialData ? initialData.has_roommates : false,
    roommatesStaying: initialData ? initialData.roommates_staying : false,
    genderPreference: initialData ? (initialData.gender_preference || '') : '',
    images: [] as File[],
  });

  // Add a state for error messages
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [confirmed, setConfirmed] = useState<boolean>(false);

  // Add a state to track existing images in edit mode
  const [existingImages, setExistingImages] = useState<string[]>(
    initialData && initialData.images ? initialData.images : []
  );

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      setListingData({
        ...listingData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setListingData({
        ...listingData,
        [name]: value,
      });
    }
  };

  // Handle amenity selection
  const handleAmenityToggle = (amenity: string) => {
    setListingData({
      ...listingData,
      amenities: listingData.amenities.includes(amenity)
        ? listingData.amenities.filter((a: string) => a !== amenity)
        : [...listingData.amenities, amenity],
    });
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      setListingData({
        ...listingData,
        images: [...listingData.images, ...fileArray],
      });
    }
  };

  // Remove uploaded image
  const removeImage = (index: number) => {
    setListingData({
      ...listingData,
      images: listingData.images.filter((_, i) => i !== index),
    });
  };

  // Move to next step
  const nextStep = () => {
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  // Move to previous step
  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  // Submit the form - modified to handle both create and edit operations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Get the authenticated user
      let user;
      try {
        const { data, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw new Error('Authentication error: ' + userError.message);
        }
        
        user = data.user;
        if (!user) {
          throw new Error('You must be signed in to create a listing');
        }
      } catch (authError) {
        console.error('Authentication error:', authError);
        setError('Authentication failed. Please sign in again and retry.');
        setIsLoading(false);
        return;
      }
      
      // Validate required fields
      if (!listingData.apartmentId) {
        throw new Error('Please select an apartment');
      }
      
      if (listingData.apartmentId === 'custom' && !listingData.customApartment) {
        throw new Error('Please enter an apartment name');
      }
      
      if (!listingData.startDate || !listingData.endDate) {
        throw new Error('Please enter lease start and end dates');
      }
      
      // Validate numeric fields
      const currentRent = parseFloat(listingData.currentRent);
      if (isNaN(currentRent) || currentRent <= 0) {
        throw new Error('Please enter a valid current rent amount');
      }
      
      const offerPrice = parseFloat(listingData.offerPrice);
      if (isNaN(offerPrice) || offerPrice <= 0) {
        throw new Error('Please enter a valid offer price');
      }
      
      // Prepare the listing data for upload
      const listingToUpload: any = {
        user_id: user.id,
        apartment_id: listingData.apartmentId === 'custom' ? null : listingData.apartmentId,
        custom_apartment: listingData.apartmentId === 'custom' ? listingData.customApartment : null,
        floor_plan: listingData.floorPlan || '',
        bedrooms: parseInt(listingData.bedrooms),
        bathrooms: parseFloat(listingData.bathrooms),
        private_bathroom: listingData.privateRoom,
        current_rent: currentRent,
        offer_price: offerPrice,
        negotiable: listingData.negotiable,
        start_date: listingData.startDate,
        end_date: listingData.endDate,
        description: listingData.description,
        amenities: listingData.amenities.length > 0 ? listingData.amenities : null,
        has_roommates: listingData.hasRoommates,
        roommates_staying: listingData.hasRoommates ? listingData.roommatesStaying : null,
        gender_preference: listingData.hasRoommates && listingData.genderPreference ? listingData.genderPreference : null,
        updated_at: new Date().toISOString(),
      };

      // If not in edit mode, add created_at field
      if (!isEditMode) {
        listingToUpload.created_at = new Date().toISOString();
      }
      
      // Initialize images with existing images in edit mode
      const finalImages = [...existingImages];
      
      // Upload new images if present
      if (listingData.images.length > 0) {
        try {
          const imageUrls = [];
          
          for (const image of listingData.images) {
            // Generate a unique file name
            const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${image.name.split('.').pop()}`;
            
            // Upload the image to storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('listing-images')
              .upload(fileName, image);
            
            if (uploadError) {
              console.error('Error uploading image:', uploadError);
              continue; // Skip this image if upload fails
            }
            
            // Get the public URL
            const { data: urlData } = await supabase.storage
              .from('listing-images')
              .getPublicUrl(fileName);
            
            if (urlData && urlData.publicUrl) {
              imageUrls.push(urlData.publicUrl);
            }
          }
          
          // Combine new images with existing ones
          finalImages.push(...imageUrls);
        } catch (imageError) {
          console.error('Error processing images:', imageError);
        }
      }
      
      // Add images to the listing data
      listingToUpload.images = finalImages.length > 0 ? finalImages : [];
      
      // Insert or update the listing in the database
      try {
        let result;
        
        if (isEditMode && initialData) {
          // Update existing listing
          const { data: updateData, error: updateError } = await updateListing(
            initialData.id,
            listingToUpload
          );
          
          if (updateError) {
            throw new Error(`Error updating listing: ${updateError}`);
          }
          
          result = updateData;
        } else {
          // Insert new listing
          const { data: insertData, error: insertError } = await supabase
            .from('listings')
            .insert(listingToUpload)
            .select()
            .single();
          
          if (insertError) {
            throw new Error(`Error creating listing: ${insertError.message}`);
          }
          
          result = insertData;
        }
        
        setSuccess(true);
        
        // Redirect after a short delay
        setTimeout(() => {
          if (isEditMode) {
            router.push(`/listings/${initialData.id}`);
          } else {
            router.push('/profile');
          }
        }, 2000);
      } catch (dbError) {
        console.error('Database operation error:', dbError);
        throw new Error('Failed to save listing. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
      console.error('Form submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove existing image in edit mode
  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h2 className="text-2xl font-bold text-text-primary mb-6">Apartment Details</h2>
            
            <div className="space-y-6">
              <div>
                <ApartmentSearchInput
                  label="Select Your Apartment"
                  value={listingData.apartmentId}
                  onChange={(id, apartment) => {
                    setListingData({
                      ...listingData,
                      apartmentId: id,
                      // Clear custom apartment field if not a custom listing
                      customApartment: id === 'custom' ? listingData.customApartment : '',
                    });
                  }}
                  apartments={apartments}
                  customOption={true}
                />
              </div>
              
              {listingData.apartmentId === 'custom' && (
                <div className="space-y-4">
                  <Input
                    label="Apartment Name"
                    name="customApartment"
                    placeholder="e.g. The Heights"
                    value={listingData.customApartment}
                    onChange={handleInputChange}
                  />
                  
                  <Input
                    label="Address"
                    name="address"
                    placeholder="e.g. 123 College Ave, State College, PA"
                    onChange={handleInputChange}
                  />
                </div>
              )}
              
              <div>
                <Input
                  label="Floor Plan Name (if applicable)"
                  name="floorPlan"
                  placeholder="e.g. 2BR Deluxe"
                  value={listingData.floorPlan}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Bedrooms"
                  name="bedrooms"
                  value={listingData.bedrooms}
                  onChange={handleInputChange}
                  options={[
                    { value: '1', label: '1 Bedroom' },
                    { value: '2', label: '2 Bedrooms' },
                    { value: '3', label: '3 Bedrooms' },
                    { value: '4', label: '4 Bedrooms' },
                    { value: '5', label: '5+ Bedrooms' },
                  ]}
                />
                
                <Select
                  label="Bathrooms"
                  name="bathrooms"
                  value={listingData.bathrooms}
                  onChange={handleInputChange}
                  options={[
                    { value: '1', label: '1 Bathroom' },
                    { value: '1.5', label: '1.5 Bathrooms' },
                    { value: '2', label: '2 Bathrooms' },
                    { value: '2.5', label: '2.5 Bathrooms' },
                    { value: '3', label: '3 Bathrooms' },
                    { value: '3.5', label: '3.5+ Bathrooms' },
                  ]}
                />
              </div>
              
              <div className="mt-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="private-bathroom"
                    name="privateRoom"
                    checked={listingData.privateRoom}
                    onChange={(e) => {
                      setListingData({
                        ...listingData,
                        privateRoom: e.target.checked,
                      });
                    }}
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="private-bathroom" className="ml-2 block text-sm text-text-primary">
                    Private Bathroom
                  </label>
                </div>
                <span className="text-xs text-text-secondary mt-1 block">
                  Check if the room being subleased has its own private bathroom
                </span>
              </div>
            </div>
          </>
        );
        
      case 2:
        return (
          <>
            <h2 className="text-2xl font-bold text-text-primary mb-6">Lease Details</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Current Monthly Rent ($)"
                  name="currentRent"
                  placeholder="e.g. 800"
                  value={listingData.currentRent}
                  onChange={handleInputChange}
                />
                
                <Input
                  type="number"
                  label="Your Offer Price ($)"
                  name="offerPrice"
                  placeholder="e.g. 700"
                  value={listingData.offerPrice}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="negotiable"
                  name="negotiable"
                  checked={listingData.negotiable}
                  onChange={handleInputChange}
                  className="w-4 h-4 accent-accent"
                />
                <label htmlFor="negotiable" className="text-text-primary">
                  Price is negotiable
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="date"
                  label="Lease Start Date"
                  name="startDate"
                  value={listingData.startDate}
                  onChange={handleInputChange}
                />
                
                <Input
                  type="date"
                  label="Lease End Date"
                  name="endDate"
                  value={listingData.endDate}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-primary block mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={listingData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your apartment, highlight special features, explain why you're subleasing, etc."
                  className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-accent transition-all duration-200"
                />
              </div>
            </div>
          </>
        );
        
      case 3:
        return (
          <>
            <h2 className="text-2xl font-bold text-text-primary mb-6">Amenities & Features</h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-text-primary block mb-2">
                  Select all amenities that apply
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {amenityOptions.map((amenity: string) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={amenity}
                        checked={listingData.amenities.includes(amenity)}
                        onChange={() => handleAmenityToggle(amenity)}
                        className="w-4 h-4 accent-accent"
                      />
                      <label htmlFor={amenity} className="text-text-primary">
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-border-light pt-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Roommate Situation</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hasRoommates"
                      name="hasRoommates"
                      checked={listingData.hasRoommates}
                      onChange={handleInputChange}
                      className="w-4 h-4 accent-accent"
                    />
                    <label htmlFor="hasRoommates" className="text-text-primary">
                      This apartment has current roommates
                    </label>
                  </div>
                  
                  {listingData.hasRoommates && (
                    <>
                      <div className="flex items-center space-x-2 ml-6">
                        <input
                          type="checkbox"
                          id="roommatesStaying"
                          name="roommatesStaying"
                          checked={listingData.roommatesStaying}
                          onChange={handleInputChange}
                          className="w-4 h-4 accent-accent"
                        />
                        <label htmlFor="roommatesStaying" className="text-text-primary">
                          Roommates will be staying during the sublease period
                        </label>
                      </div>
                      
                      <div className="ml-6">
                        <Select
                          label="Gender Preference (if applicable)"
                          name="genderPreference"
                          value={listingData.genderPreference}
                          onChange={handleInputChange}
                          options={[
                            { value: '', label: 'No preference' },
                            { value: 'Male', label: 'Male' },
                            { value: 'Female', label: 'Female' },
                          ]}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        );
        
      case 4:
        return (
          <>
            <h2 className="text-2xl font-bold text-text-primary mb-6">Listing Images</h2>
            
            <div className="space-y-6">
              {existingImages.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Existing Images</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {existingImages.map((imageUrl, index) => (
                      <div key={`existing-${index}`} className="relative group">
                        <div className="h-24 bg-bg-secondary rounded-lg overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-1 right-1 bg-bg-secondary bg-opacity-75 rounded-full p-1 text-error opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <p className="text-text-secondary mb-4">
                  Upload photos of your apartment to attract more interest. Include images of the bedroom, bathroom, living area, and any special features.
                </p>
                
                <Card variant="default" className="p-8 text-center">
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label htmlFor="images" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12 text-accent mb-4">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-text-primary font-medium mb-1">Click to upload images</p>
                      <p className="text-text-secondary text-sm">Or drag and drop files here</p>
                    </div>
                  </label>
                </Card>
              </div>
              
              {listingData.images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">New Uploaded Images</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {listingData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="h-24 bg-bg-secondary rounded-lg overflow-hidden">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-bg-secondary bg-opacity-75 rounded-full p-1 text-error opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        );
        
      case 5:
        return (
          <>
            <h2 className="text-2xl font-bold text-text-primary mb-6">Review & Submit</h2>
            
            <div className="space-y-6">
              <Card variant="glass">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Apartment Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Apartment:</span>
                    <span className="text-text-primary">
                      {listingData.apartmentId === 'custom' 
                        ? listingData.customApartment 
                        : apartments.find(a => a.id === listingData.apartmentId)?.name || 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Floor Plan:</span>
                    <span className="text-text-primary">{listingData.floorPlan || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Bedrooms:</span>
                    <span className="text-text-primary">{listingData.bedrooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Bathrooms:</span>
                    <span className="text-text-primary">{listingData.bathrooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Private Bathroom:</span>
                    <span className="text-text-primary">{listingData.privateRoom ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </Card>
              
              <Card variant="glass">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Lease Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Current Rent:</span>
                    <span className="text-text-primary">${listingData.currentRent}/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Offer Price:</span>
                    <span className="text-accent font-semibold">${listingData.offerPrice}/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Negotiable:</span>
                    <span className="text-text-primary">{listingData.negotiable ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Lease Period:</span>
                    <span className="text-text-primary">
                      {listingData.startDate && listingData.endDate 
                        ? `${new Date(listingData.startDate).toLocaleDateString()} - ${new Date(listingData.endDate).toLocaleDateString()}`
                        : 'Not specified'}
                    </span>
                  </div>
                </div>
                {listingData.description && (
                  <div className="mt-4 pt-4 border-t border-border-light">
                    <span className="text-text-secondary block mb-2">Description:</span>
                    <p className="text-text-primary text-sm">{listingData.description}</p>
                  </div>
                )}
              </Card>
              
              {listingData.amenities.length > 0 && (
                <Card variant="glass">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Amenities</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {listingData.amenities.map((amenity: string) => (
                      <div key={amenity} className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 text-accent">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-text-primary text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              
              {listingData.hasRoommates && (
                <Card variant="glass">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Roommate Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Roommates Staying:</span>
                      <span className="text-text-primary">{listingData.roommatesStaying ? 'Yes' : 'No'}</span>
                    </div>
                    {listingData.genderPreference && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Gender Preference:</span>
                        <span className="text-text-primary">{listingData.genderPreference}</span>
                      </div>
                    )}
                  </div>
                </Card>
              )}
              
              <Card variant="glass">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Images</h3>
                {(existingImages.length > 0 || listingData.images.length > 0) ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {existingImages.map((imageUrl, index) => (
                      <div key={`existing-${index}`} className="h-24 bg-bg-secondary rounded-lg overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={`Existing ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {listingData.images.map((image, index) => (
                      <div key={`new-${index}`} className="h-24 bg-bg-secondary rounded-lg overflow-hidden">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary">No images uploaded</p>
                )}
              </Card>
              
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="confirm"
                    className="w-4 h-4 accent-accent mt-1"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                  />
                  <label htmlFor="confirm" className="text-text-secondary text-sm">
                    I confirm that all information provided is accurate and I am authorized to sublease this apartment. I understand that PSU Sublease is only a listing platform and does not handle any financial transactions or legal agreements between parties.
                  </label>
                </div>
              </div>
            </div>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
          <p className="font-medium mb-1">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md">
          <p className="font-medium mb-1">Success!</p>
          <p>Your listing was created successfully. Redirecting to your profile...</p>
        </div>
      )}
      
      <Card variant="default" className="mb-8">
        {renderStepContent()}
      </Card>
      
      <div className="flex justify-between mt-8">
        {step > 1 && (
          <Button
            type="button"
            variant="secondary"
            onClick={prevStep}
            disabled={isLoading}
          >
            Previous
          </Button>
        )}
        
        {step < 5 ? (
          <Button
            type="button"
            onClick={nextStep}
            className="ml-auto"
            disabled={
              (step === 1 && !listingData.apartmentId) ||
              (step === 2 && (!listingData.currentRent || !listingData.offerPrice || !listingData.startDate || !listingData.endDate))
            }
          >
            Next
          </Button>
        ) : (
          <Button
            type="submit"
            isLoading={isLoading}
            className="ml-auto"
            disabled={!confirmed}
          >
            {isEditMode ? 'Update Listing' : 'Submit Listing'}
          </Button>
        )}
      </div>
      
      <div className="flex justify-center mt-6">
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`w-3 h-3 rounded-full ${
                step === stepNumber
                  ? 'bg-accent'
                  : step > stepNumber
                  ? 'bg-accent/50'
                  : 'bg-border-light'
              }`}
            />
          ))}
        </div>
      </div>
    </form>
  );
} 