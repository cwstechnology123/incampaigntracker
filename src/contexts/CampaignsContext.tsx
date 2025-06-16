import React, { createContext, useContext } from 'react';
import { Campaign, CampaignsContextType } from '../types';
import { supabase } from '../lib/supabase';
import { pollJobStatus } from '../lib/pollJobStatus';
import { useSessionStore } from '../states/stores/useSessionStore';
import { useBootstrapDataStore } from '../states/stores/useBootstrapDataStore';
import { fetchWithAuthJson } from '../utils/fetchWithAuth';

const CampaignsContext = createContext<CampaignsContextType | undefined>(undefined);

export const useCampaigns = () => {
  const context = useContext(CampaignsContext);
  if (context === undefined) {
    throw new Error('useCampaigns must be used within a CampaignsProvider');
  }
  return context;
};

export const CampaignsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
   const { session } = useSessionStore();
  const {
    user,
    campaigns,
    isLoading,
    error,
    refresh,
    updateCampaigns,
  } = useBootstrapDataStore() ?? {};

  const createCampaign = async (
    campaignData: Omit<Campaign, 'id' | 'userId' | 'created_at' | 'status'>
  ) => {
    if (!session) throw new Error('User must be logged in to create a campaign');

    const { data, error } = await supabase
      .from('campaigns')
      .insert([{
        user_id: user.id,
        title: campaignData.title,
        description: campaignData.description,
        hashtag: campaignData.hashtag,
        status: 'idle',
      }])
      .select('*')
      .single();

    if (error) throw error;

    const newCampaign: Campaign = {
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      description: data.description || '',
      hashtag: data.hashtag,
      created_at: data.created_at,
      status: data.status,
    };

    updateCampaigns(prev => [newCampaign, ...prev]);
    return newCampaign;
  };

  const getCampaign = (id: string) => campaigns.find((c: Campaign) => c.id === id);

  const runCampaign = async (id: string) => {
    if (!session) throw new Error('User must be logged in to run a campaign');
    console.log('Running campaign with ID:', session, id);
    try {
      const res = await fetchWithAuthJson(`/api/scrape`, {
        method: 'POST',
        body: JSON.stringify({ campaign_id: id }),
      }, session);

      if (res?.error) throw new Error(res.error);

      const { status, jobId } = res;
      if (!jobId) throw new Error('No job ID returned from the server');

      updateCampaigns(prev =>
        prev.map(c => (c.id === id ? { ...c, status } : c))
      );
      pollJobStatus(id, updateCampaigns, updateCampaignError, refresh);
      return jobId;
    } catch (err: any) {
      const message = err.message || 'Unexpected error occurred';
      const code = err.status || 500;

      updateCampaigns(prev =>
        prev.map(c => (c.id === id ? { ...c, status: 'failed' } : c))
      );

      if (code === 401) throw new Error('Unauthorized. Please log in again.');
      if (message === 'Integration settings not found') {
        throw new Error('Please update your integration settings before running this campaign.');
      }
      throw new Error(message);
    } finally {
      await refresh(); // Refresh campaigns from server or fallback to persisted
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!session) throw new Error('User must be logged in to delete a campaign');

    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) throw error;

    updateCampaigns(prev => prev.filter(c => c.id !== id));
  };

  const updateCampaignError = (campaignId: string, error: string | null) => {
    updateCampaigns(prev =>
      prev.map(c => (c.id === campaignId ? { ...c, error } : c))
    );
  };

  const value: CampaignsContextType = {
    campaigns,
    isLoading,
    error,
    createCampaign,
    getCampaign,
    runCampaign,
    deleteCampaign,
    updateCampaignError,
  };

  return <CampaignsContext.Provider value={value}>{children}</CampaignsContext.Provider>;
};