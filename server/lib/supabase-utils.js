// server/supabase-utils.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yapvmjltethfqqyybidz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhcHZtamx0ZXRoZnFxeXliaWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNzA0NzgsImV4cCI6MjA2MjY0NjQ3OH0.SMaCLJWcJXJ6tzCqkCC4mwAjMSNj4HlTE60nE6qIhG4';

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
  const { data, error } = await supabase
      .from('integration_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

  if (error) throw error;
  return data;
};