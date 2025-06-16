import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  }
});

// Test the connection and log detailed errors
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Failed to connect to Supabase:', {
      message: error.message,
      status: error.status,
      name: error.name
    });
    throw error;
  }
  
  // Test database access
  supabase
    .from('profiles')
    .select('count')
    .then(({ error: dbError }) => {
      if (dbError) {
        console.error('Database access error:', dbError);
        throw dbError;
      }
      console.log('Successfully connected to Supabase and verified database access');
    });
}).catch(error => {
  console.error('Unexpected error connecting to Supabase:', error);
  throw error;
});