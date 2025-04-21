import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_VISION_URL = 'https://api.openai.com/v1/chat/completions';

async function extractInfoWithOpenAI({ postText, ocrTexts, links, authorName }: { postText: string, ocrTexts: string[], links: any, authorName?: string }) {
  // Improved detailed prompt for OpenAI to extract structured info
  const prompt = `Extract all relevant sublease listing information from the following Facebook post and OCR text. Return a JSON object with ONLY these fields:
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
- For each field marked "required", you MUST provide a value - do not leave these blank or as null
- If exact dates aren't provided, convert text descriptions like "Summer 2023" to date ranges (e.g. "2023-05-01" to "2023-08-31")
- Convert price ranges to the lower value (e.g. "$750-800" should be 750)
- If the apartment_name isn't clearly stated, try to identify it from context clues or address
- If something is unclear, make your best guess rather than leaving it blank
- If price is listed with utilities, extract just the base rent
- Look for special requirements (e.g. "female roommates only", "pure vegetarian", "no pets") and include in both description and special_requirements field
- Include all relevant contact information in the description field

When extracting dates:
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
      temperature: 0.1, // Lower temperature for more deterministic results
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
  
  // 7. Apartment Name fallback
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