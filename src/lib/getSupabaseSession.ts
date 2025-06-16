// lib/getSupabaseSession.ts
import { supabase } from './supabase';
import { withTimeoutAndRetry } from '../utils/withTimeoutAndRetry';

export const getSupabaseSession = async () => {
  return await withTimeoutAndRetry(async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  });
};