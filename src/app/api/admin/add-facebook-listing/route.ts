import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_VISION_URL = 'https://api.openai.com/v1/chat/completions';

async function extractInfoWithOpenAI({ postText, ocrTexts, links }: { postText: string, ocrTexts: string[], links: any }) {
  // Compose a prompt for OpenAI to extract structured info
  const prompt = `Extract all relevant sublease listing information from the following Facebook post and OCR text. Return a JSON object with as many of these fields as possible:
- apartment_name (required): Name of the apartment complex or building (e.g. "The Rise", "The Metropolitan")
- address (if available): Full address of the property
- price (required): Monthly rental price in numbers only (e.g. 750, not "$750/month"). If price includes "+ utilities", just extract the base price number.
- start_date (required): The earliest date the sublease is available (in format "YYYY-MM-DD" if possible)
- end_date (required): The last date the sublease is available (in format "YYYY-MM-DD" if possible)
- bedrooms (if available): Number of bedrooms as a number
- bathrooms (if available): Number of bathrooms as a number
- description (required): A detailed summary combining important information from the post, including special requirements
- amenities (if available): Array of amenities mentioned (e.g. ["Washer/Dryer", "Fully Furnished"])
- author_username (if available): Name of the person posting
- special_requirements (if available): Any specific requirements for roommates or living conditions

IMPORTANT INSTRUCTIONS:
- Look especially for patterns like "$X + utilities", "X-bedroom apartment with Y bathroom", "Month DD till Month DD"
- If exact dates aren't provided, convert text descriptions like "Summer 2023" to date ranges
- If price is listed with utilities, extract just the base rent
- Look for special requirements (e.g. "female roommates only", "pure vegetarian", "no pets")
- Include any relevant contact information

Post Text:
${postText}

OCR Texts:
${ocrTexts.join('\n---\n')}

Links:
${JSON.stringify(links)}`;

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a specialized data extraction assistant for Penn State University sublease listings. Your task is to extract precise, structured information from Facebook posts and images. Make your best inference for required fields, even if the information is not explicitly stated.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
    }),
  });
  const data = await response.json();
  // Try to parse the JSON from the response
  let parsed = {};
  try {
    parsed = JSON.parse(data.choices[0].message.content);
  } catch (e) {
    parsed = { raw: data.choices[0].message.content };
  }
  return parsed;
}

async function ocrImageWithOpenAI(imageBuffer: Buffer) {
  // Use OpenAI Vision API to extract text from image
  const response = await fetch(OPENAI_VISION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'user', content: [
          { type: 'text', text: 'Extract ALL text from this image, focusing on sublease details like price, apartment name, dates, room configuration (e.g., 1B1B, 2BR/2BA, "2 bedroom with one bathroom"), special requirements (vegetarian, gender preferences), and any contact information. Provide a comprehensive extraction of all visible text.' },
          { type: 'image_url', image_url: { url: `data:image/png;base64,${imageBuffer.toString('base64')}` } },
        ] },
      ],
      max_tokens: 1024,
    }),
  });
  const data = await response.json();
  return data.choices[0].message.content;
}

// Post-process the extracted data to ensure all required fields have values
function processExtractedData(data: any, postText: string, ocrTexts: string[]) {
  if (!data) return {};
  
  const processed = { ...data };
  const allText = [postText, ...ocrTexts].join(' ');
  
  // 1. Ensure apartment_name is present
  if (!processed.apartment_name || processed.apartment_name === 'N/A') {
    const commonApts = [
      'The Rise', 'The Station', 'The Metropolitan', 'The Legacy', 'University Gateway', 
      'The Meridian', 'The Heights', 'Park Hill', 'Lions Crossing', 'Beaver Hill', 
      'Vairo Village', 'Tremont Student Living', 'The View', 'State College Park', 
      'The Pointe', 'University Terrace', 'Nittany Crossing', 'Campus Crossing'
    ];
    
    // Check if any of the common apartment names are mentioned
    for (const apt of commonApts) {
      if (allText.toLowerCase().includes(apt.toLowerCase())) {
        processed.apartment_name = apt;
        break;
      }
    }
    
    // If still not found, default to "Penn State Sublease"
    if (!processed.apartment_name || processed.apartment_name === 'N/A') {
      processed.apartment_name = "Penn State Sublease";
    }
  }
  
  // 2. Ensure description is present
  if (!processed.description || processed.description === 'N/A') {
    let desc = '';
    if (postText) desc += `Facebook Post:\n${postText}\n\n`;
    if (ocrTexts && ocrTexts.length > 0) desc += `OCR:\n${ocrTexts.join('\n---\n')}`;
    processed.description = desc || 'No description provided';
  }
  
  // 3. Process price - make it optional
  if (processed.price === 'N/A' || processed.price === '') {
    // Leave it undefined/blank if not provided - do not set default
    processed.price = undefined;
  } else if (processed.price && typeof processed.price === 'string') {
    // Convert string price to number if needed
    processed.price = parseFloat(processed.price.replace(/,/g, ''));
  }
  
  // 4. Process dates - make them optional and handle academic year references
  const currentYear = new Date().getFullYear();
  
  // Check for academic year patterns in the text
  // Enhanced to catch more formats including "25/26 year" without spaces
  const academicYearPattern1 = allText.match(/(\d{4})\s*[-\/]\s*(\d{4})/);
  const academicYearPattern2 = allText.match(/(\d{2})\s*[-\/]\s*(\d{2})(?:\s*school\s*year|\s*academic\s*year|\s*year)/i);
  const academicYearPattern3 = /academic\s*year|school\s*year/i.test(allText);
  
  if (academicYearPattern1) {
    // Handle full year format like "2025-2026" or "2025/2026"
    const startYear = parseInt(academicYearPattern1[1]);
    const endYear = parseInt(academicYearPattern1[2]);
    processed.start_date = `${startYear}-08-01`;
    processed.end_date = `${endYear}-07-31`;
  } else if (academicYearPattern2) {
    // Handle shortened year format like "25-26 school year" or "25/26 year"
    let startYear = parseInt(academicYearPattern2[1]);
    let endYear = parseInt(academicYearPattern2[2]);
    
    // Convert 2-digit years to 4-digit years
    if (startYear < 100) {
      // Assume years are in the 2000s
      startYear = startYear < 50 ? 2000 + startYear : 1900 + startYear;
      endYear = endYear < 50 ? 2000 + endYear : 1900 + endYear;
    }
    
    processed.start_date = `${startYear}-08-01`;
    processed.end_date = `${endYear}-07-31`;
  } else if (academicYearPattern3) {
    // If it just mentions "academic year" or "school year" without specifying which one,
    // use the next academic year if we're past January
    const now = new Date();
    const thisYear = now.getFullYear();
    const nextYear = thisYear + 1;
    
    // If we're in second half of the year, assume it's for next academic year
    if (now.getMonth() >= 6) { // July or later
      processed.start_date = `${thisYear}-08-01`;
      processed.end_date = `${nextYear}-07-31`;
    } else {
      const prevYear = thisYear - 1;
      processed.start_date = `${prevYear}-08-01`;
      processed.end_date = `${thisYear}-07-31`;
    }
  }
  
  // If no dates were found but we have start_date from OpenAI, process it
  if (processed.start_date && processed.start_date !== 'N/A' && processed.start_date !== '') {
    if (!processed.start_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // If not in YYYY-MM-DD format, try to convert
      try {
        processed.start_date = new Date(processed.start_date).toISOString().split('T')[0];
      } catch (e) {
        // Leave it undefined if conversion fails
        processed.start_date = undefined;
      }
    }
  } else if (!academicYearPattern1 && !academicYearPattern2 && !academicYearPattern3) {
    // If no patterns were found and no valid date from OpenAI, leave it undefined
    processed.start_date = undefined;
  }
  
  // Similarly for end_date
  if (processed.end_date && processed.end_date !== 'N/A' && processed.end_date !== '') {
    if (!processed.end_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // If not in YYYY-MM-DD format, try to convert
      try {
        processed.end_date = new Date(processed.end_date).toISOString().split('T')[0];
      } catch (e) {
        // Leave it undefined if conversion fails
        processed.end_date = undefined;
      }
    }
  } else if (!academicYearPattern1 && !academicYearPattern2 && !academicYearPattern3) {
    // If no patterns were found and no valid date from OpenAI, leave it undefined
    processed.end_date = undefined;
  }
  
  // 5. Ensure bedrooms and bathrooms are numbers
  if (!processed.bedrooms || processed.bedrooms === 'N/A' || processed.bedrooms === 0) {
    // Handle "X-bedroom apartment" pattern
    const bedroomTextMatch = allText.match(/(\d+)[\s-]bedroom/i);
    if (bedroomTextMatch) {
      processed.bedrooms = parseInt(bedroomTextMatch[1]);
    } else {
      // Try standard patterns
      const bbMatch = allText.match(/(\d+)B(\d+)B/i) || 
                      allText.match(/(\d+)BR\s*\/?\s*(\d+)BA/i) ||
                      allText.match(/(\d+)\s*bed(?:room)?s?\s*(\d+)\s*bath(?:room)?s?/i);
      if (bbMatch) {
        processed.bedrooms = parseInt(bbMatch[1]);
      } else {
        processed.bedrooms = 1; // Default
      }
    }
  } else if (typeof processed.bedrooms === 'string') {
    processed.bedrooms = parseInt(processed.bedrooms) || 1;
  }
  
  if (!processed.bathrooms || processed.bathrooms === 'N/A' || processed.bathrooms === 0) {
    // Handle "one bathroom" or "X bathroom" pattern
    const bathroomTextMatch = allText.match(/one\s+bathroom/i) || allText.match(/(\d+)\s*bathroom/i);
    if (bathroomTextMatch) {
      processed.bathrooms = bathroomTextMatch[0].toLowerCase().includes("one") ? 1 : parseInt(bathroomTextMatch[1]);
    } else {
      // Try standard patterns
      const bbMatch = allText.match(/(\d+)B(\d+)B/i) || 
                      allText.match(/(\d+)BR\s*\/?\s*(\d+)BA/i) ||
                      allText.match(/(\d+)\s*bed(?:room)?s?\s*(\d+)\s*bath(?:room)?s?/i);
      if (bbMatch) {
        processed.bathrooms = parseInt(bbMatch[2]);
      } else {
        processed.bathrooms = 1; // Default
      }
    }
  } else if (typeof processed.bathrooms === 'string') {
    processed.bathrooms = parseFloat(processed.bathrooms) || 1;
  }
  
  // 6. Process special requirements
  if (!processed.special_requirements) {
    // Look for vegetarian, pet-free, gender requirements, etc.
    const vegetarianMatch = allText.match(/(?:pure |strict )?vegetarian/i);
    const genderMatch = allText.match(/(?:female|male|men|women|girl|boy)s? (?:only|preferred)/i);
    const noSmokingMatch = allText.match(/no smoking|non[\s-]smoking/i);
    const noPetsMatch = allText.match(/no pets|pet[\s-]free/i);
    
    let specialReqs = [];
    if (vegetarianMatch) specialReqs.push(vegetarianMatch[0]);
    if (genderMatch) specialReqs.push(genderMatch[0]);
    if (noSmokingMatch) specialReqs.push(noSmokingMatch[0]);
    if (noPetsMatch) specialReqs.push(noPetsMatch[0]);
    
    if (specialReqs.length > 0) {
      processed.special_requirements = specialReqs.join(", ");
      
      // Also add to description if not already there
      if (processed.description && !processed.description.includes(specialReqs[0])) {
        processed.description += "\n\nSpecial Requirements: " + processed.special_requirements;
      }
    }
  }
  
  // 7. Ensure amenities is an array and add common amenities if mentioned but not extracted
  if (!processed.amenities || !Array.isArray(processed.amenities)) {
    processed.amenities = [];
  }
  
  // Look for common amenities in the text that might have been missed
  const commonAmenities = {
    'clubhouse': ['club house', 'clubhouse', 'common area', 'community center'],
    'pool': ['pool', 'swimming'],
    'gym': ['gym', 'fitness center', 'workout'],
    'bus pass': ['bus pass', 'cata', 'bus route', 'transportation'],
    'laundry': ['washer', 'dryer', 'laundry', 'w/d'],
    'furnished': ['furnished', 'furniture'],
    'parking': ['parking', 'garage', 'spot', 'space'],
    'utilities included': ['utilities included', 'utilities paid', 'all utilities'],
    'wifi': ['wifi', 'internet', 'high-speed'],
    'cable': ['cable', 'tv'],
    'balcony': ['balcony', 'patio', 'terrace'],
    'dishwasher': ['dishwasher'],
    'pet friendly': ['pet friendly', 'pets allowed', 'dog', 'cat'],
    'air conditioning': ['a/c', 'air conditioning', 'central air'],
    'security': ['security', 'gated', 'surveillance']
  };
  
  // Check for each amenity
  for (const [amenity, keywords] of Object.entries(commonAmenities)) {
    // Skip if this amenity is already included
    if (processed.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()))) {
      continue;
    }
    
    // Check if any keyword is in the text
    if (keywords.some(keyword => allText.toLowerCase().includes(keyword.toLowerCase()))) {
      processed.amenities.push(amenity.charAt(0).toUpperCase() + amenity.slice(1));
    }
  }
  
  return processed;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const postText = formData.get('postText') as string;
    const facebookPostLink = formData.get('facebookPostLink') as string;
    const authorProfileLink = formData.get('authorProfileLink') as string;
    const authorUsername = formData.get('authorUsername') as string;
    const analyzeImages = formData.getAll('analyzeImages') as File[];
    const listingImages = formData.getAll('listingImages') as File[];
    
    // Check if we already have extracted info
    let parsed_listing_data: any = null;
    const extractedInfoStr = formData.get('extractedInfo') as string;
    
    if (extractedInfoStr) {
      try {
        parsed_listing_data = JSON.parse(extractedInfoStr);
        console.log('Using pre-extracted listing data');
      } catch (e) {
        console.error('Error parsing extractedInfo:', e);
      }
    }

    // Upload listing images to Supabase storage and get public URLs
    let listingImageUrls: string[] = [];
    for (const file of listingImages) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileName = `facebook-listings/${Date.now()}-${file.name}`;
      const { data, error } = await supabaseAdmin.storage.from('property-images').upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });
      if (error) throw error;
      const { data: urlData } = supabaseAdmin.storage.from('property-images').getPublicUrl(fileName);
      listingImageUrls.push(urlData.publicUrl);
    }
    // If no images uploaded, use default
    if (listingImageUrls.length === 0) {
      listingImageUrls = ['/apt_defaults/fb.png'];
    }

    // If we don't have extracted data yet, perform OCR and analysis
    let ocrTexts: string[] = [];
    if (!parsed_listing_data) {
      // OCR analyze images (not displayed publicly)
      ocrTexts = [];
      for (const file of analyzeImages) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const ocrText = await ocrImageWithOpenAI(buffer);
        ocrTexts.push(ocrText);
      }

      // Compose links for OpenAI (use only listingImageUrls for public images)
      const links = {
        facebookPostLink,
        authorProfileLink,
        authorUsername,
        facebookGroupLink: 'https://www.facebook.com/groups/pennstatehousingsubleases/',
        images: listingImageUrls,
      };

      // Extract structured info using OpenAI
      parsed_listing_data = await extractInfoWithOpenAI({ postText, ocrTexts, links });
    } else {
      // If we have extracted info, try to get ocrTexts from it if present
      ocrTexts = parsed_listing_data.ocrTexts || [];
    }

    // Post-process the extracted data to ensure all required fields have values
    parsed_listing_data = processExtractedData(parsed_listing_data, postText, ocrTexts);
    
    // Update the images in parsed_listing_data to use the listing image URLs
    if (parsed_listing_data && listingImageUrls.length > 0) {
      parsed_listing_data.images = listingImageUrls;
    }

    // Compose description if not already set by processExtractedData
    if (!parsed_listing_data.description) {
      let description = '';
      if (postText) {
        description += `Facebook Post:\n${postText}\n\n`;
      }
      if (ocrTexts && ocrTexts.length > 0) {
        description += `OCR:\n${ocrTexts.join('\n---\n')}`;
      }
      parsed_listing_data.description = description || 'No description provided';
    }

    // Extract top-level fields from parsed_listing_data
    const custom_apartment = parsed_listing_data.apartment_name || 'Penn State Sublease';
    const offer_price = parsed_listing_data.price !== undefined ? parsed_listing_data.price : null;
    const start_date = parsed_listing_data.start_date || null;
    const end_date = parsed_listing_data.end_date || null;
    const bedrooms = parsed_listing_data.bedrooms || 1;
    const bathrooms = parsed_listing_data.bathrooms || 1;
    const amenities = parsed_listing_data.amenities || [];
    const address = parsed_listing_data.address || '';
    const description = parsed_listing_data.description || 'No description provided';
    const extracted_author_username = parsed_listing_data.author_username || '';
    const special_requirements = parsed_listing_data.special_requirements || '';

    // Use the extracted username if provided, otherwise use the one from the form
    const final_author_username = authorUsername || extracted_author_username || 'Anonymous';

    // Additional fields for display when price or dates are missing
    const display_price = offer_price !== null ? offer_price : 'Contact for price';
    const display_dates = (start_date && end_date) ? `${start_date} to ${end_date}` : 'Contact for dates';

    // Insert into facebook_listings table (only listingImageUrls are public)
    const { data: inserted, error: insertError } = await supabaseAdmin.from('facebook_listings').insert({
      post_text: postText,
      images: listingImageUrls,
      date_posted: new Date(),
      facebook_post_link: facebookPostLink,
      facebook_group_link: 'https://www.facebook.com/groups/pennstatehousingsubleases/',
      author_profile_link: authorProfileLink,
      author_username: final_author_username,
      parsed_listing_data,
      custom_apartment,
      offer_price,
      start_date,
      end_date,
      bedrooms,
      bathrooms,
      amenities,
      description,
      address,
      special_requirements,
      display_price,
      display_dates,
      created_at: new Date(),
      updated_at: new Date(),
    }).select().single();
    if (insertError) throw insertError;

    return NextResponse.json({ success: true, id: inserted.id });
  } catch (error: any) {
    console.error('Error in add-facebook-listing:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
} 