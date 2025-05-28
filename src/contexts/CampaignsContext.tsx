import React, { createContext, useContext, useState, useEffect } from 'react';
import { Campaign, CampaignsContextType } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { scrapeLinkedInPosts } from '../utils/apifyClient';

const CampaignsContext = createContext<CampaignsContextType | undefined>(undefined);

export const useCampaigns = () => {
  const context = useContext(CampaignsContext);
  if (context === undefined) {
    throw new Error('useCampaigns must be used within a CampaignsProvider');
  }
  return context;
};

export const CampaignsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadUserCampaigns();
    } else {
      setCampaigns([]);
      setIsLoading(false);
    }
  }, [user]);

  const loadUserCampaigns = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCampaigns(data.map(campaign => ({
        id: campaign.id,
        userId: campaign.user_id,
        title: campaign.title,
        description: campaign.description || '',
        hashtag: campaign.hashtag,
        createdAt: campaign.created_at,
        lastRun: campaign.last_run,
        status: campaign.status,
      })));
    } catch (err) {
      console.error('Error loading campaigns:', err);
      setError('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const createCampaign = async (campaignData: Omit<Campaign, 'id' | 'userId' | 'createdAt' | 'status'>) => {
    if (!user) throw new Error('User must be logged in to create a campaign');
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          user_id: user.id,
          title: campaignData.title,
          description: campaignData.description,
          hashtag: campaignData.hashtag,
          status: 'idle'
        })
        .select('*')
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('No data returned from campaign creation');
      }

      const newCampaign: Campaign = {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        description: data.description || '',
        hashtag: data.hashtag,
        createdAt: data.created_at,
        status: data.status,
      };
      
      setCampaigns(prevCampaigns => [newCampaign, ...prevCampaigns]);
      return newCampaign;
    } catch (err) {
      console.error('Error creating campaign:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create campaign';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getCampaign = (id: string) => {
    return campaigns.find(campaign => campaign.id === id);
  };

  const runCampaign = async (id: string) => {
    if (!user) throw new Error('User must be logged in to run a campaign');
    
    setIsLoading(true);
    try {
      // Update campaign status to running
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({ status: 'running' })
        .eq('id', id);

      if (updateError) throw updateError;

      setCampaigns(prev => 
        prev.map(c => c.id === id ? { ...c, status: 'running' } : c)
      );

      const campaign = getCampaign(id);
      if (!campaign) throw new Error('Campaign not found');
      
      // Use Apify to scrape LinkedIn posts
      const posts = await scrapeLinkedInPosts(campaign.hashtag);
      
      if (!posts || posts.length === 0) {
        const { error: noPostsError } = await supabase
          .from('campaigns')
          .update({ 
            status: 'no_posts_found',
            last_run: new Date().toISOString()
          })
          .eq('id', id);

        if (noPostsError) throw noPostsError;

        setCampaigns(prev => 
          prev.map(c => c.id === id ? { 
            ...c, 
            status: 'no_posts_found',
            lastRun: new Date().toISOString()
          } : c)
        );
        return;
      }
      
      // Insert posts into database
      const { error: postsError } = await supabase
        .from('posts')
        .insert(
          posts.map(post => ({
            campaign_id: id,
            post_date: post.postDate,
            author_name: post.authorName,
            post_link: post.postLink,
            likes: post.likes,
            comments: post.comments,
            shares: post.shares,
            hashtags: post.hashtags,
            content: post.content,
          }))
        );

      if (postsError) throw postsError;
      
      // Update campaign status to completed
      const { error: completeError } = await supabase
        .from('campaigns')
        .update({ 
          status: 'completed',
          last_run: new Date().toISOString()
        })
        .eq('id', id);

      if (completeError) throw completeError;

      setCampaigns(prev => 
        prev.map(c => c.id === id ? { 
          ...c, 
          status: 'completed',
          lastRun: new Date().toISOString()
        } : c)
      );
    } catch (err) {
      console.error('Error running campaign:', err);
      
      // Update campaign status to failed
      const { error: failError } = await supabase
        .from('campaigns')
        .update({ status: 'failed' })
        .eq('id', id);

      if (failError) console.error('Failed to update campaign status:', failError);

      setCampaigns(prev => 
        prev.map(c => c.id === id ? { ...c, status: 'failed' } : c)
      );
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to run campaign';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!user) throw new Error('User must be logged in to delete a campaign');
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete campaign';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    campaigns,
    isLoading,
    error,
    createCampaign,
    getCampaign,
    runCampaign,
    deleteCampaign,
  };

  return <CampaignsContext.Provider value={value}>{children}</CampaignsContext.Provider>;
};