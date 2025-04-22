-- Add display_price and display_dates columns to facebook_listings table
ALTER TABLE facebook_listings
ADD COLUMN display_price TEXT,
ADD COLUMN display_dates TEXT;

-- Set default values for existing records
UPDATE facebook_listings
SET display_price = CASE 
    WHEN offer_price IS NULL OR offer_price = 0 THEN 'Contact for price' 
    ELSE offer_price::TEXT 
  END,
  display_dates = CASE 
    WHEN start_date IS NULL OR end_date IS NULL THEN 'Contact for dates'
    ELSE start_date::TEXT || ' to ' || end_date::TEXT
  END; 