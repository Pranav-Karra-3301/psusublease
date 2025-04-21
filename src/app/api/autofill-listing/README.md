# Listing Autofill Feature

This feature allows users to save time when creating sublease listings by using AI to extract information from:

1. Screenshots of listings they've posted on social media (Instagram, Snapchat, etc.)
2. Text messages they've shared in group chats or social media

## How It Works

1. User provides either:
   - A screenshot image (upload)
   - Text from their social media post or message
   - Or both

2. The image and/or text is sent to the OpenAI GPT-4o API
   - GPT-4o has vision capability to extract information from images
   - It can also understand and extract details from text descriptions

3. The API extracts listing information and returns structured data
   - Apartment details (name, floor plan, bedrooms, bathrooms)
   - Lease details (rent, dates, etc.)
   - Amenities
   - Roommate information

4. The form is autofilled with the extracted information
   - User can then review and modify before submission

## API Implementation

The API route (`/api/autofill-listing/route.ts`) handles:
- Processing form data with text and/or image
- Converting images to base64 for OpenAI API
- Constructing appropriate prompts for GPT-4o
- Parsing the response into structured data

## UI Implementation

The CreateListingForm component has been updated with:
- A new "Quick Autofill" step at the beginning
- UI for text input and image upload
- Error handling and loading states
- Logic to process the API response and populate form fields

## Technical Considerations

- Requires OpenAI API key in `.env.local` file
- Uses the OpenAI npm package
- GPT-4o has a context limitation, so very large images may be compressed
- The system prompt is designed to extract specific fields that match the form structure

## Future Improvements

- Improve extraction accuracy for specific apartments and amenities
- Add support for multiple images
- Implement caching to reduce API costs
- Add feedback mechanism to improve AI accuracy over time 