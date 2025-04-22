import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_VISION_URL = 'https://api.openai.com/v1/chat/completions';

async function extractInfoWithOpenAI({ postText, ocrTexts, links, authorName }: { postText: string, ocrTexts: string[], links: any, authorName?: string }) {
  // Improved detailed prompt for OpenAI to extract structured info
  const prompt = `Extract all relevant sublease listing information from the following Facebook post and OCR text. Return a JSON object with ONLY these fields:
- apartment_name (required): Name of the apartment complex or building (e.g. "The Rise", "The Metropolitan")
- address (if available): Full address of the property
- price (if available): Monthly rental price in numbers only (e.g. 750, not "$750/month"). If price includes "+ utilities", just extract the base price number. If no price is specified, leave blank.
- start_date (if available): The earliest date the sublease is available (in format "YYYY-MM-DD" if possible)
- end_date (if available): The last date the sublease is available (in format "YYYY-MM-DD" if possible)
- bedrooms (if available): Number of bedrooms as a number
- bathrooms (if available): Number of bathrooms as a number
- description (required): A detailed summary combining important information from the post, including special requirements
- amenities (if available): Array of amenities mentioned (e.g. ["Washer/Dryer", "Fully Furnished", "Gym", "Pool"])
- author_username (if available): Name of the person posting
- special_requirements (if available): Any specific requirements for roommates or living conditions

IMPORTANT INSTRUCTIONS:
- Look especially for patterns like "$X + utilities", "X-bedroom apartment with Y bathroom", "Month DD till Month DD"
- For each field marked "required", you MUST provide a value - do not leave these blank or as null
- For price and dates, if not provided, leave these fields empty or null - do NOT invent or guess values
- Convert price ranges to the lower value (e.g. "$750-800" should be 750)
- If the apartment_name isn't clearly stated, try to identify it from context clues or address
- If something is unclear, make your best guess rather than leaving it blank
- If price is listed with utilities, extract just the base rent
- Look for special requirements (e.g. "female roommates only", "pure vegetarian", "no pets") and include in both description and special_requirements field
- Include all relevant contact information in the description field
- ALWAYS extract ALL amenities mentioned in the text (e.g., "clubhouse", "pool", "gym", "free bus pass", etc.) and include them in the amenities array

When extracting dates:
- If you see mentions of academic years like "2025-2026", "25-26 school year", "25/26 year", "academic year", "next academic year", or similar, convert these to standard lease dates of August 1 of the first year to July 31 of the second year (e.g., "2025-2026" or "25/26 year" becomes "2025-08-01" to "2026-07-31")
- For years expressed in shorthand like "25/26" or "25-26", interpret as 2025-2026
- Convert text like "May-August" to YYYY-MM-DD format (use current year unless specified)
- For "May 01 till July 31" format, use current year if not specified
- For Fall/Spring semester references, use standard academic dates (Fall: Aug-Dec, Spring: Jan-May)
- If only months are given (e.g., "May to July"), use the 1st day of start month and last day of end month

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
      temperature: 0.3, // Lower temperature for more deterministic results
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
  
  // Combine all text data for better patterns matching
  const allText = [postText, ...ocrTexts].join(' ');
  
  // Fallbacks and post-processing
  // 1. Author username fallback
  if ((!parsed.author_username || parsed.author_username === 'N/A') && authorName) {
    parsed.author_username = authorName;
  }
  
  // 2. Description fallback
  if (!parsed.description || parsed.description === 'N/A') {
    let desc = '';
    if (postText) desc += `Facebook Post:\n${postText}\n\n`;
    if (ocrTexts && ocrTexts.length > 0) desc += `OCR:\n${ocrTexts.join('\n---\n')}`;
    parsed.description = desc;
  }
  
  // 3. Price fallback - improved patterns
  if (!parsed.price || parsed.price === 'N/A' || parsed.price === 0) {
    // Handle "$X + utilities" pattern
    const priceUtilitiesMatch = allText.match(/\$(\d+)\s*\+\s*utilities/i);
    if (priceUtilitiesMatch) {
      parsed.price = parseInt(priceUtilitiesMatch[1]);
    } else {
      // Try the standard price pattern
      const priceMatch = allText.match(/\$([0-9,.]+)/);
      if (priceMatch) parsed.price = parseFloat(priceMatch[1].replace(/,/g, ''));
    }
  }
  
  // 4. Dates fallback - improved patterns
  if (!parsed.start_date || !parsed.end_date || parsed.start_date === 'N/A' || parsed.end_date === 'N/A') {
    // Handle academic year patterns first
    const academicYearPattern1 = allText.match(/(\d{4})\s*[-\/]\s*(\d{4})/);
    const academicYearPattern2 = allText.match(/(\d{2})\s*[-\/]\s*(\d{2})(?:\s*school\s*year|\s*academic\s*year|\s*year)/i);
    const academicYearPattern3 = /academic\s*year|school\s*year/i.test(allText);
    
    if (academicYearPattern1) {
      // Handle full year format like "2025-2026" or "2025/2026"
      const startYear = parseInt(academicYearPattern1[1]);
      const endYear = parseInt(academicYearPattern1[2]);
      parsed.start_date = `${startYear}-08-01`;
      parsed.end_date = `${endYear}-07-31`;
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
      
      parsed.start_date = `${startYear}-08-01`;
      parsed.end_date = `${endYear}-07-31`;
    } else if (academicYearPattern3) {
      // If it just mentions "academic year" or "school year" without specifying which one,
      // use the next academic year if we're past January
      const now = new Date();
      const thisYear = now.getFullYear();
      const nextYear = thisYear + 1;
      
      // If we're in second half of the year, assume it's for next academic year
      if (now.getMonth() >= 6) { // July or later
        parsed.start_date = `${thisYear}-08-01`;
        parsed.end_date = `${nextYear}-07-31`;
      } else {
        const prevYear = thisYear - 1;
        parsed.start_date = `${prevYear}-08-01`;
        parsed.end_date = `${thisYear}-07-31`;
      }
    } else {
      // Handle "Month DD till Month DD" pattern without year
      const simpleDateRangeMatch = allText.match(/([A-Za-z]+)\s+(\d{1,2})\s+till\s+([A-Za-z]+)\s+(\d{1,2})/i);
      if (simpleDateRangeMatch) {
        const currentYear = new Date().getFullYear();
        const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        
        const startMonth = months.findIndex(m => m.toLowerCase().startsWith(simpleDateRangeMatch[1].toLowerCase()));
        const startDay = parseInt(simpleDateRangeMatch[2]);
        const endMonth = months.findIndex(m => m.toLowerCase().startsWith(simpleDateRangeMatch[3].toLowerCase()));
        const endDay = parseInt(simpleDateRangeMatch[4]);
        
        if (startMonth !== -1 && endMonth !== -1) {
          parsed.start_date = `${currentYear}-${String(startMonth + 1).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
          parsed.end_date = `${currentYear}-${String(endMonth + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
        }
      } else {
        // Try standard date formats
        // Format: Month DD, YYYY - Month DD, YYYY
        const dateRange = allText.match(/(\w+ \d{1,2},? \d{4}) ?[–-] ?(\w+ \d{1,2},? \d{4})/i);
        if (dateRange) {
          parsed.start_date = new Date(dateRange[1]).toISOString().split('T')[0];
          parsed.end_date = new Date(dateRange[2]).toISOString().split('T')[0];
        } else {
          // Format: Month - Month
          const monthRange = allText.match(/(\w+) ?[–-] ?(\w+)/i);
          if (monthRange) {
            const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
            const startMonth = months.findIndex(m => m.toLowerCase().startsWith(monthRange[1].toLowerCase()));
            const endMonth = months.findIndex(m => m.toLowerCase().startsWith(monthRange[2].toLowerCase()));
            if (startMonth !== -1 && endMonth !== -1) {
              const currentYear = new Date().getFullYear();
              parsed.start_date = `${currentYear}-${String(startMonth + 1).padStart(2, '0')}-01`;
              // Last day of end month
              const lastDay = new Date(currentYear, endMonth + 1, 0).getDate();
              parsed.end_date = `${currentYear}-${String(endMonth + 1).padStart(2, '0')}-${lastDay}`;
            }
          }
        }
      }
    }
  }
  
  // 5. Bedrooms/Bathrooms fallback - improved patterns
  if (!parsed.bedrooms || parsed.bedrooms === 'N/A' || parsed.bedrooms === 0) {
    // Handle "X-bedroom apartment" pattern
    const bedroomTextMatch = allText.match(/(\d+)[\s-]bedroom/i);
    if (bedroomTextMatch) {
      parsed.bedrooms = parseInt(bedroomTextMatch[1]);
    } else {
      // Try standard patterns
      const bbMatch = allText.match(/(\d+)B(\d+)B/i) || 
                      allText.match(/(\d+)BR\s*\/?\s*(\d+)BA/i) ||
                      allText.match(/(\d+)\s*bed(?:room)?s?\s*(\d+)\s*bath(?:room)?s?/i);
      if (bbMatch) {
        parsed.bedrooms = parseInt(bbMatch[1]);
      }
    }
  }
  
  if (!parsed.bathrooms || parsed.bathrooms === 'N/A' || parsed.bathrooms === 0) {
    // Handle "one bathroom" or "X bathroom" pattern
    const bathroomTextMatch = allText.match(/one\s+bathroom/i) || allText.match(/(\d+)\s*bathroom/i);
    if (bathroomTextMatch) {
      parsed.bathrooms = bathroomTextMatch[0].toLowerCase().includes("one") ? 1 : parseInt(bathroomTextMatch[1]);
    } else {
      // Try standard patterns
      const bbMatch = allText.match(/(\d+)B(\d+)B/i) || 
                      allText.match(/(\d+)BR\s*\/?\s*(\d+)BA/i) ||
                      allText.match(/(\d+)\s*bed(?:room)?s?\s*(\d+)\s*bath(?:room)?s?/i);
      if (bbMatch) {
        parsed.bathrooms = parseInt(bbMatch[2]);
      }
    }
  }
  
  // 6. Special requirements processing
  if (!parsed.special_requirements) {
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
      parsed.special_requirements = specialReqs.join(", ");
      
      // Also add to description if not already there
      if (parsed.description && !parsed.description.includes(specialReqs[0])) {
        parsed.description += "\n\nSpecial Requirements: " + parsed.special_requirements;
      }
    }
  }
  
  // 7. Ensure amenities is an array and add common amenities if mentioned but not extracted
  if (!parsed.amenities || !Array.isArray(parsed.amenities)) {
    parsed.amenities = [];
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
    if (parsed.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()))) {
      continue;
    }
    
    // Check if any keyword is in the text
    if (keywords.some(keyword => allText.toLowerCase().includes(keyword.toLowerCase()))) {
      parsed.amenities.push(amenity.charAt(0).toUpperCase() + amenity.slice(1));
    }
  }
  
  // 8. Apartment Name fallback
  if (!parsed.apartment_name || parsed.apartment_name === 'N/A') {
    const commonApts = [
      'The Rise', 'The Station', 'The Metropolitan', 'The Legacy', 'University Gateway', 
      'The Meridian', 'The Heights', 'Park Hill', 'Lions Crossing', 'Beaver Hill', 
      'Vairo Village', 'Tremont Student Living', 'The View', 'State College Park', 
      'The Pointe', 'University Terrace', 'Nittany Crossing', 'Campus Crossing'
    ];
    
    // Check if any of the common apartment names are mentioned
    for (const apt of commonApts) {
      if (allText.toLowerCase().includes(apt.toLowerCase())) {
        parsed.apartment_name = apt;
        break;
      }
    }
    
    // If still not found, default to "Penn State Sublease"
    if (!parsed.apartment_name || parsed.apartment_name === 'N/A') {
      parsed.apartment_name = "Penn State Sublease";
    }
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

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const postText = formData.get('postText') as string;
    const facebookPostLink = formData.get('facebookPostLink') as string;
    const authorProfileLink = formData.get('authorProfileLink') as string;
    const authorUsername = formData.get('authorUsername') as string;
    const analyzeImages = formData.getAll('analyzeImages') as File[];

    // OCR analyze images
    const ocrTexts: string[] = [];
    for (const file of analyzeImages) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const ocrText = await ocrImageWithOpenAI(buffer);
      ocrTexts.push(ocrText);
    }

    // Compose links for OpenAI
    const links = {
      facebookPostLink,
      authorProfileLink,
      authorUsername,
      facebookGroupLink: 'https://www.facebook.com/groups/pennstatehousingsubleases/',
    };

    // Try to extract author name from postText if possible and pass to extractInfoWithOpenAI
    let authorName = null;
    if (postText) {
      const lines = postText.split('\n');
      if (lines.length > 0) {
        // Heuristic: first non-empty line is likely the author
        authorName = lines[0].trim();
        if (authorName.match(/\d+h/)) authorName = null; // skip if it's a timestamp
      }
    }

    // Extract structured info using OpenAI
    const parsed_listing_data = await extractInfoWithOpenAI({ postText, ocrTexts, links, authorName });

    return NextResponse.json({ 
      success: true, 
      parsed_listing_data,
      ocrTexts,
      postText
    });
  } catch (error: any) {
    console.error('Error in analyze-facebook-listing:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
} 