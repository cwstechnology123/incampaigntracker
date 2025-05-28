import { supabase } from './supabase';

export const getCurrentUserId = async (): Promise<string | null> => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
};

export const fetchIntegrationSettings = async () => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not logged in');

  const { data, error } = await supabase
    .from('integration_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // Ignore 'row not found' error
  return data;
};

export const upsertIntegrationSettings = async (settings: {
  li_at: string;
  jsessionid: string;
  apify_api_token: string;
}) => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not logged in');
  const { error } = await supabase
    .from('integration_settings')
    .upsert({ ...settings, user_id: userId }, { onConflict: 'user_id' });

  if (error) {
    console.error('Error upserting integration settings:', error);
    throw error;
  } else {
    return { success: true };
  }
};