import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Check if the environment variables are defined
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'defined' : 'missing',
    key: supabaseAnonKey ? 'defined' : 'missing'
  });
  throw new Error('Supabase environment variables are missing');
}

// Create Supabase client with better configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'psusublease-auth',
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 1
    }
  },
  global: {
    fetch: fetch
  }
});

// Log initialization status in development
if (process.env.NODE_ENV !== 'production') {
  console.log('Supabase client initialized with URL:', supabaseUrl);
}

export default supabase; 