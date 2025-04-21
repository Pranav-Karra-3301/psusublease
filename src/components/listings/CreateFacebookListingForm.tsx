import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

export default function CreateFacebookListingForm() {
  const [postText, setPostText] = useState('');
  const [facebookPostLink, setFacebookPostLink] = useState('');
  const [authorProfileLink, setAuthorProfileLink] = useState('');
  const [authorUsername, setAuthorUsername] = useState('');
  const [analyzeImages, setAnalyzeImages] = useState<File[]>([]);
  const [listingImages, setListingImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedInfo, setExtractedInfo] = useState<any>(null);
  const [showExtractedInfo, setShowExtractedInfo] = useState(false);
  const [ocrTexts, setOcrTexts] = useState<string[]>([]);
  const [extractedPostText, setExtractedPostText] = useState<string>('');
  
  // Additional form fields for manual editing/entry
  const [apartmentName, setApartmentName] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [description, setDescription] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');

  // Common amenities
  const commonAmenities = [
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

  // Dropzone for Analyze Images
  const onDropAnalyze = useCallback((acceptedFiles: File[]) => {
    setAnalyzeImages(prev => [...prev, ...acceptedFiles]);
  }, []);
  const {
    getRootProps: getRootPropsAnalyze,
    getInputProps: getInputPropsAnalyze,
    isDragActive: isDragActiveAnalyze
  } = useDropzone({
    onDrop: onDropAnalyze,
    accept: { 'image/*': [] },
    multiple: true
  });

  // Dropzone for Listing Images
  const onDropListing = useCallback((acceptedFiles: File[]) => {
    setListingImages(prev => [...prev, ...acceptedFiles]);
  }, []);
  const {
    getRootProps: getRootPropsListing,
    getInputProps: getInputPropsListing,
    isDragActive: isDragActiveListing
  } = useDropzone({
    onDrop: onDropListing,
    accept: { 'image/*': [] },
    multiple: true
  });

  const removeAnalyzeImage = (index: number) => {
    setAnalyzeImages(analyzeImages.filter((_, i) => i !== index));
  };
  const removeListingImage = (index: number) => {
    setListingImages(listingImages.filter((_, i) => i !== index));
  };

  const handleAddAmenity = () => {
    if (newAmenity && !amenities.includes(newAmenity)) {
      setAmenities([...amenities, newAmenity]);
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setAmenities(amenities.filter(a => a !== amenity));
  };

  const handleToggleAmenity = (amenity: string) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter(a => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const handleAnalyze = async () => {
    if (analyzeImages.length === 0 && !postText) {
      setError('Please provide either post text or screenshots to analyze');
      return;
    }
    
    setAnalyzing(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('postText', postText);
      formData.append('facebookPostLink', facebookPostLink);
      formData.append('authorProfileLink', authorProfileLink);
      formData.append('authorUsername', authorUsername);
      analyzeImages.forEach((img) => formData.append('analyzeImages', img));
      
      // Create a temporary endpoint to just analyze without saving
      const res = await fetch('/api/admin/analyze-facebook-listing', {
        method: 'POST',
        body: formData,
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to analyze Facebook listing');
      
      setExtractedInfo(result.parsed_listing_data);
      setOcrTexts(result.ocrTexts || []);
      setExtractedPostText(result.postText || '');
      setShowExtractedInfo(true);

      // Fill the form fields with the extracted data
      if (result.parsed_listing_data) {
        const data = result.parsed_listing_data;
        setApartmentName(data.apartment_name || '');
        setAddress(data.address || '');
        setPrice(data.price ? data.price.toString() : '');
        setStartDate(data.start_date || '');
        setEndDate(data.end_date || '');
        setBedrooms(data.bedrooms ? data.bedrooms.toString() : '');
        setBathrooms(data.bathrooms ? data.bathrooms.toString() : '');
        setDescription(data.description || '');
        setAmenities(data.amenities || []);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append('postText', postText);
      formData.append('facebookPostLink', facebookPostLink);
      formData.append('authorProfileLink', authorProfileLink);
      formData.append('authorUsername', authorUsername);
      analyzeImages.forEach((img) => formData.append('analyzeImages', img));
      listingImages.forEach((img) => formData.append('listingImages', img));

      // If we have extracted info, include it in the form data
      if (extractedInfo) {
        // Update extracted info with manually edited values
        const updatedExtractedInfo = {
          ...extractedInfo,
          apartment_name: apartmentName,
          address: address,
          price: price ? parseFloat(price) : undefined,
          start_date: startDate,
          end_date: endDate,
          bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
          bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
          description: description,
          amenities: amenities,
        };
        formData.append('extractedInfo', JSON.stringify(updatedExtractedInfo));
      } else {
        // If no extraction was done, create a new object with form data
        const manualExtractedInfo = {
          apartment_name: apartmentName,
          address: address,
          price: price ? parseFloat(price) : undefined,
          start_date: startDate,
          end_date: endDate,
          bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
          bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
          description: description,
          amenities: amenities,
        };
        formData.append('extractedInfo', JSON.stringify(manualExtractedInfo));
      }

      const res = await fetch('/api/admin/add-facebook-listing', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to create Facebook listing');
      setSuccess(true);
      setPostText('');
      setFacebookPostLink('');
      setAuthorProfileLink('');
      setAuthorUsername('');
      setAnalyzeImages([]);
      setListingImages([]);
      setExtractedInfo(null);
      setShowExtractedInfo(false);
      setApartmentName('');
      setAddress('');
      setPrice('');
      setStartDate('');
      setEndDate('');
      setBedrooms('');
      setBathrooms('');
      setDescription('');
      setAmenities([]);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 text-text-primary">Add Facebook Listing</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Analyze for Info Dropzone - top of form, no example or extra text */}
        <div>
          <Label>Analyze for Info (Facebook post screenshot)</Label>
          <div
            {...getRootPropsAnalyze()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActiveAnalyze ? 'border-accent bg-accent/5' : 'border-border-light bg-bg-secondary'}`}
          >
            <input {...getInputPropsAnalyze()} />
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12 text-accent mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-text-primary font-medium mb-1">Drag & drop Facebook post screenshots here, or click to choose files</p>
            </div>
          </div>
          {analyzeImages.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-4">
              {analyzeImages.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24">
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`Analyze Preview ${idx + 1}`}
                    className="object-cover w-full h-full rounded-lg border border-border-light"
                  />
                  <button
                    type="button"
                    onClick={() => removeAnalyzeImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Main form fields */}
        <div>
          <Label htmlFor="postText">Facebook Post Text (optional if screenshot provided)</Label>
          <textarea
            id="postText"
            className="w-full border border-border-light rounded-lg p-4 mt-2 min-h-[120px] text-base"
            placeholder="Paste the full text from the Facebook post here..."
            value={postText}
            onChange={e => setPostText(e.target.value)}
            // Only require if no analyze image is present
            required={analyzeImages.length === 0}
          />
        </div>
        <div>
          <Label htmlFor="facebookPostLink">Facebook Post Link</Label>
          <Input
            id="facebookPostLink"
            type="url"
            placeholder="https://www.facebook.com/groups/pennstatehousingsubleases/posts/1234567890/"
            value={facebookPostLink}
            onChange={e => setFacebookPostLink(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="authorProfileLink">Author Profile Link (optional)</Label>
          <Input
            id="authorProfileLink"
            type="url"
            placeholder="https://facebook.com/author.profile"
            value={authorProfileLink}
            onChange={e => setAuthorProfileLink(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="authorUsername">Author Username (optional)</Label>
          <Input
            id="authorUsername"
            type="text"
            placeholder="facebook.username"
            value={authorUsername}
            onChange={e => setAuthorUsername(e.target.value)}
          />
        </div>

        {/* New Analyze Button */}
        <div className="pt-2">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleAnalyze} 
            disabled={analyzing || (analyzeImages.length === 0 && !postText)}
          >
            {analyzing ? 'Analyzing...' : 'Analyze with AI'}
          </Button>
        </div>

        {/* Show extracted information when available */}
        {showExtractedInfo && extractedInfo && (
          <div className="mt-6 p-4 bg-bg-secondary rounded-lg border border-border-light">
            <h3 className="text-lg font-semibold mb-3 text-text-primary">Extracted Information</h3>
            <div className="space-y-3">
              {/* Show original Facebook post text */}
              {extractedPostText && (
                <div>
                  <span className="text-text-secondary font-medium">Original Facebook Post:</span>
                  <pre className="text-text-primary whitespace-pre-wrap mt-1 bg-white/50 rounded p-2 border border-border-light">{extractedPostText}</pre>
                </div>
              )}
              {/* Show OCR results */}
              {ocrTexts && ocrTexts.length > 0 && (
                <div>
                  <span className="text-text-secondary font-medium">OCR from Uploaded Image{ocrTexts.length > 1 ? 's' : ''}:</span>
                  {ocrTexts.map((ocr, i) => (
                    <pre key={i} className="text-text-primary whitespace-pre-wrap mt-1 bg-white/50 rounded p-2 border border-border-light">{ocr}</pre>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual edit form fields - shown always, filled by the extraction if available */}
        <div className="mt-6 border-t border-border-light pt-6">
          <h3 className="text-lg font-semibold mb-4 text-text-primary">Listing Details (Edit as needed)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="apartmentName">Apartment Name *</Label>
              <Input
                id="apartmentName"
                type="text"
                placeholder="e.g. The Rise, The Metropolitan"
                value={apartmentName}
                onChange={e => setApartmentName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="e.g. 123 College Ave, State College, PA"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="price">Price ($ per month) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 750"
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 2"
                  value={bedrooms}
                  onChange={e => setBedrooms(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="e.g. 1.5"
                  value={bathrooms}
                  onChange={e => setBathrooms(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="w-full border border-border-light rounded-lg p-4 mt-2 min-h-[100px] text-base"
              placeholder="Additional details about the listing..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="mb-4">
            <Label>Amenities</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {commonAmenities.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => handleToggleAmenity(amenity)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    amenities.includes(amenity)
                      ? 'bg-accent text-white border-accent'
                      : 'bg-white text-text-secondary border-border-light'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
            <div className="flex mt-2">
              <Input
                type="text"
                placeholder="Add custom amenity..."
                value={newAmenity}
                onChange={e => setNewAmenity(e.target.value)}
                className="flex-grow"
              />
              <Button
                type="button"
                onClick={handleAddAmenity}
                disabled={!newAmenity}
                className="ml-2"
              >
                Add
              </Button>
            </div>
            {amenities.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-text-secondary mb-2">Selected Amenities:</p>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="bg-bg-secondary text-text-primary text-xs px-2 py-1 rounded-full border border-border-light flex items-center"
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(amenity)}
                        className="ml-1 text-text-secondary hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Listing Images Dropzone */}
        <div>
          <Label>Listing Images (shown on public listing, not analyzed)</Label>
          <div
            {...getRootPropsListing()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActiveListing ? 'border-accent bg-accent/5' : 'border-border-light bg-bg-secondary'}`}
          >
            <input {...getInputPropsListing()} />
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12 text-accent mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-text-primary font-medium mb-1">Drag & drop listing images here, or click to choose files</p>
              <p className="text-text-secondary text-sm">These images will be shown on the public listing</p>
            </div>
          </div>
          {listingImages.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-4">
              {listingImages.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24">
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`Listing Preview ${idx + 1}`}
                    className="object-cover w-full h-full rounded-lg border border-border-light"
                  />
                  <button
                    type="button"
                    onClick={() => removeListingImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">Facebook listing created successfully!</div>}
        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Facebook Listing'}
          </Button>
        </div>
      </form>
    </Card>
  );
} 