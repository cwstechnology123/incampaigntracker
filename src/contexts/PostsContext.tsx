import React, { createContext, useContext, useState, useEffect } from 'react';
import { Post, PostsContextType, CampaignSummary } from '../types';
import { useAuth } from './AuthContext';
import { scrapeLinkedInPosts } from '../utils/mockApi';

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export const usePosts = () => {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
};

export const PostsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadPosts();
    } else {
      setPosts([]);
      setIsLoading(false);
    }
  }, [user]);

  const loadPosts = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Load posts from localStorage
      const storedPosts = localStorage.getItem(`posts_${user.id}`);
      if (storedPosts) {
        setPosts(JSON.parse(storedPosts));
      }
    } catch (err) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getCampaignPosts = (campaignId: string) => {
    return posts.filter(post => post.campaignId === campaignId);
  };

  const getCampaignSummary = (campaignId: string): CampaignSummary => {
    const campaignPosts = getCampaignPosts(campaignId);
    
    const totalLikes = campaignPosts.reduce((sum, post) => sum + post.likes, 0);
    const totalComments = campaignPosts.reduce((sum, post) => sum + post.comments, 0);
    const totalShares = campaignPosts.reduce((sum, post) => sum + post.shares, 0);
    const totalEngagement = totalLikes + totalComments + totalShares;
    
    return {
      campaignId,
      postsCount: campaignPosts.length,
      totalLikes,
      totalComments,
      totalShares,
      totalEngagement,
      lastUpdated: new Date().toISOString(),
    };
  };

  const value = {
    posts,
    isLoading,
    error,
    getCampaignPosts,
    getCampaignSummary,
  };

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
};