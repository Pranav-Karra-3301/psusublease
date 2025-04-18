import supabase from './supabase';

// Example apartment data for seeding
const exampleApartments = [
  { name: 'Alight State College', address: '348 Blue Course Dr.', website: 'https://alight-statecollege.com/', email: 'info@alight-statecollege.com' },
  { name: 'Allen Park', address: '1013 S. Allen and Westerly Parkway', website: 'https://www.lenwoodinc.com', email: 'info@lenwoodinc.com' },
  { name: 'Ambassador', address: '421 E. Beaver Ave', website: 'https://www.arpm.com/property/ambassador/', email: 'leasing@arpm.com' },
  { name: 'Alexander Court', address: '309 E Beaver St, State College', website: 'https://www.livethecanyon.com/alexander-court', email: 'info@livethecanyon.com' },
  { name: 'Armenara Plaza', address: '131 Sowers Street - near Pollack and Beaver', website: 'https://www.arpm.com/property/armenara-plaza/', email: 'leasing@arpm.com' },
];

/**
 * Seeds the apartments table if it's empty
 * This ensures there's always valid apartment data for foreign key references
 */
export async function seedApartments() {
  try {
    // Check if apartments table is empty
    const { data: existingApartments, error: checkError } = await supabase
      .from('apartments')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking apartments table:', checkError);
      return { success: false, error: checkError };
    }
    
    // If there are already apartments, don't seed
    if (existingApartments && existingApartments.length > 0) {
      console.log('Apartments table already has data, skipping seed');
      return { success: true, seeded: false };
    }
    
    // Insert example apartments
    const { data, error } = await supabase
      .from('apartments')
      .insert(exampleApartments)
      .select();
    
    if (error) {
      console.error('Error seeding apartments:', error);
      return { success: false, error };
    }
    
    console.log('Successfully seeded apartments table with example data');
    return { success: true, seeded: true, data };
  } catch (err) {
    console.error('Unexpected error in seedApartments:', err);
    return { success: false, error: err };
  }
}

export default {
  seedApartments
}; 