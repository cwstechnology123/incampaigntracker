// server/supabase-utils.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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

export const fetchIntegrationSettings = async (userId) => {
  console.log('Fetching integration settings for user:', userId);
  const { data, error } = await supabase
      .from('integration_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
  console.log('Integration settings fetched:', data);
  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error('Error fetching integration settings:', error);
    throw error;
  } else if (error) {
    console.warn('No integration settings found for user:', userId);
  } else {
    console.log('Integration settings successfully retrieved:', data);
  }       
  //return data;
};