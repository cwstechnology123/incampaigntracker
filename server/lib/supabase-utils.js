// server/supabase-utils.ts
import { supabase } from './supabase-client.js';

export const withTimeoutAndRetry = async (fn, retries = 2, timeout = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      
      const result = await fn({ signal: controller.signal });
      
      clearTimeout(timer);
      return result;
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`Retrying attempt ${attempt} failed:`, err.message);
    }
  }
};

export const getCurrentUserId = async (token) => {
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) throw error
    return data.user?.id || null
  } catch (err) {
    console.error('Error fetching user:', err)
    return null // Prevent app crash
  }

};

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
    return null; // No settings found, return null
  } else {
    console.log('Integration settings successfully retrieved:', data);
    return data;
  }       
};

export async function upsertIntegrationSettings(userId, settings) {
  const { data, error } = await supabase
    .from('integration_settings')
    .upsert([{ user_id: userId, ...settings }], { onConflict: ['user_id'] })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export const saveToSupabasePosts = async (posts, campaign_id, hashtag) => {
  if (!posts || posts.length === 0){
    await updateCampaignStatus(campaign_id, 'no_posts_found');
    return { success: true, message: 'No posts to sync', inserted: 0, posts: [] };
}
console.log('Saving posts to Supabase:', posts);

  const mappedPosts = posts.map((post) => {
    // Extract engagement metrics using the exact field names
    const likes = parseInt(post.numLikes || '0', 10);
    const comments = parseInt(post.numComments || '0', 10);
    const shares = parseInt(post.numShares || '0', 10);

    // Handle author information which can be either a string or an object
    let authorName = 'Unknown Author';
    if (typeof post.author === 'object' && post.author !== null) {
      const { firstName, lastName } = post.author;
      authorName = `${firstName || ''} ${lastName || ''}`.trim();
    } else if (typeof post.author === 'string') {
      authorName = post.author;
    } else if (typeof post.authorInfo === 'object' && post.authorInfo !== null) {
      const { firstName, lastName } = post.authorInfo;
      authorName = `${firstName || ''} ${lastName || ''}`.trim();
    }
    return {
        campaign_id,
        post_date: new Date(post.timestamp || Date.now()).toISOString(), // You may want to ensure post.date is in ISO format
        author_name: authorName || 'Unknown Author',
        post_link: post.url || '',
        likes,
        comments,
        shares,
        hashtags: Array.isArray(post.hashtags) ? post.hashtags : [hashtag],
        content: post.text || '',
      };
  });

  const { error: insertError } = await supabase
    .from('posts')
    .insert(mappedPosts);

  if (insertError) {
    console.error('Post upsert failed:', insertError);
    await updateCampaignStatus(campaign_id, 'failed');
    throw new Error('Failed to save posts');
  }

  // Update campaign only if post sync is successful
  await updateCampaignStatus(campaign_id, 'completed');
};

// Update campaign status
export const updateCampaignStatus = async (campaign_id, status, job_id = null) => {
  const updates = { status, last_run: new Date().toISOString() };
  if (job_id) updates.job_id = job_id;
  
  const { error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', campaign_id);

  if (error) {
    console.error('Failed to update campaign:', error);
  }
};

export const fetchCampaignById = async (campaignId) => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  if (error) {
    console.error('Error fetching campaign:', error);
    throw error;
  }
  return data;
};

export const fetchJobIdByCampaignId = async (campaignId) => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('job_id')
    .eq('id', campaignId)
    .single();

  if (error) {
    console.error('Error fetching job ID:', error);
    throw error;
  }
  
  return data?.job_id || null; // Return job_id or null if not found
}

export const fetchProfile = async (userId) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return profile;
};

export const fetchCampaigns = async (userId) => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const fetchPosts = async (campaignIds) => {
  if (!campaignIds.length) return [];
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .in('campaign_id', campaignIds);

  if (error) throw error;
  return data || [];
};

// fetch all Bootstrap data needed for the application
export const getBootstrapData = async (userId) => {
  const errors = {};

  const [profileResult, settingsResult, campaignsResult] = await Promise.allSettled([
    withTimeoutAndRetry(() => fetchProfile(userId)),
    withTimeoutAndRetry(() => fetchIntegrationSettings(userId)),
    withTimeoutAndRetry(() => fetchCampaigns(userId)),
  ]);

  const profile = profileResult.status === 'fulfilled' ? profileResult.value : null;
  if (!profile) errors.profile = profileResult.reason?.message;

  const settings = settingsResult.status === 'fulfilled' ? settingsResult.value : null;
  if (!settings) errors.settings = settingsResult.reason?.message;

  const campaigns = campaignsResult.status === 'fulfilled' ? campaignsResult.value : [];
  if (!campaigns.length) errors.campaigns = campaignsResult.reason?.message;

  let posts = [];
  try {
    const campaignIds = campaigns.map(c => c.id);
    if (campaignIds.length > 0) {
      posts = await withTimeoutAndRetry(() => fetchPosts(campaignIds));
    }
  } catch (err) {
    errors.posts = err.message;
  }

  return {
    user: profile,
    settings,
    campaigns,
    posts,
    errors: Object.keys(errors).length > 0 ? errors : null,
  };
};