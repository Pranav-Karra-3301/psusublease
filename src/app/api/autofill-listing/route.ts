import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const text = formData.get('text') as string || '';
    const imageFile = formData.get('image') as File | null;

    // Prepare messages for OpenAI
    const messages: any[] = [
      {
        role: 'system',
        content: `You are an assistant that helps extract apartment listing information from text and images.
Extract the following fields if present:
- Apartment name and address (if available)
- Floor plan name (if available)
- Number of bedrooms
- Number of bathrooms
- Whether it has a private bathroom
- Current monthly rent
- Offer price for sublease
- Whether the price is negotiable
- Lease start date
- Lease end date
- Description of the apartment
- Amenities (from this list: ${[
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
].join(', ')})
- Whether there are roommates
- If roommates are staying during sublease
- Gender preference for roommates (if any)

Return the data in JSON format with these exact keys:
{
  "apartmentId": "",
  "customApartment": "",
  "floorPlan": "",
  "bedrooms": "",
  "bathrooms": "",
  "privateRoom": false,
  "currentRent": "",
  "offerPrice": "",
  "negotiable": false,
  "startDate": "",
  "endDate": "",
  "description": "",
  "amenities": [],
  "hasRoommates": false,
  "roommatesStaying": false,
  "genderPreference": ""
}

For dates, use YYYY-MM-DD format. For bedrooms and bathrooms, extract the number only.
If an apartment name matches one of the common apartments in State College, PA, identify it. If not, put the name in customApartment.
For missing information, leave the field empty or use appropriate default values.`
      },
      {
        role: 'user',
        content: [],
      },
    ];

    // Add text content if provided
    if (text && text.trim()) {
      messages[1].content.push({
        type: 'text',
        text: text,
      });
    }

    // Add image content if provided
    if (imageFile) {
      const imageBuffer = await imageFile.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      const mimeType = imageFile.type;

      messages[1].content.push({
        type: 'image_url',
        image_url: {
          url: `data:${mimeType};base64,${base64Image}`,
        },
      });
    }

    // Return error if neither text nor image is provided
    if (messages[1].content.length === 0) {
      return NextResponse.json(
        { error: 'Please provide either text or an image' },
        { status: 400 }
      );
    }

    // Make request to OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      max_tokens: 1000,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    // Parse the response
    const content = response.choices[0]?.message?.content || '{}';
    const parsedData = JSON.parse(content);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Error in autofill API:', error);
    return NextResponse.json(
      { error: 'Failed to process the autofill request' },
      { status: 500 }
    );
  }
} 