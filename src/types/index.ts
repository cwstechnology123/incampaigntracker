export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Campaign {
  id: string;
  user_id: string;
  title: string;
  description: string;
  hashtag: string;
  created_at: string;
  lastRun?: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'no_posts_found';
  job_id?: string; // Optional job ID for tracking
  error?: string | null;
}

export interface Post {
  id: string;
  campaign_id: string;
  post_date: string;
  author_name: string;
  post_link: string;
  likes: number;
  comments: number;
  shares: number;
  hashtags: string[];
  content: string;
}

export interface CampaignSummary {
  campaignId: string;
  postsCount: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalEngagement: number;
  lastUpdated: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export interface CampaignsContextType {
  campaigns: Campaign[];
  isLoading: boolean;
  error: string | null;
  createCampaign: (campaign: Omit<Campaign, 'id' | 'userId' | 'createdAt' | 'status'>) => Promise<Campaign>;
  getCampaign: (id: string) => Campaign | undefined;
  runCampaign: (id: string) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  updateCampaignError?: (campaignId: string, error: string | null) => void;
}

export interface PostsContextType {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  getCampaignPosts: (campaignId: string) => Post[];
  getCampaignSummary: (campaignId: string) => CampaignSummary;
}

export interface IntegrationSettings {
  apify_api_token: string;
  li_at: string;
  jsessionid: string;
}

export type BootstrapDataType = {
  user?: any;
  settings: IntegrationSettings;
  campaigns: Campaign[];
  posts: Post[];
  isLoading: boolean;
  error: any;
  getCampaignPosts: (campaignId: string) => Post[];
  getCampaignSummary: (campaignId: string) => CampaignSummary;
  updateSettings: (newSettings: IntegrationSettings) => Promise<void>;
  updateCampaigns: (updater: (prev: Campaign[]) => Campaign[]) => void;
  refresh: () => void;
  destroyBootstrapData: () => void;
};