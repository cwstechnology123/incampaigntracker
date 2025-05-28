export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  userId: string;
  title: string;
  description: string;
  hashtag: string;
  createdAt: string;
  lastRun?: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'no_posts_found';
}

export interface Post {
  id: string;
  campaignId: string;
  postDate: string;
  authorName: string;
  postLink: string;
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
  logout: () => void;
}

export interface CampaignsContextType {
  campaigns: Campaign[];
  isLoading: boolean;
  error: string | null;
  createCampaign: (campaign: Omit<Campaign, 'id' | 'userId' | 'createdAt' | 'status'>) => Promise<Campaign>;
  getCampaign: (id: string) => Campaign | undefined;
  runCampaign: (id: string) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
}

export interface PostsContextType {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  getCampaignPosts: (campaignId: string) => Post[];
  getCampaignSummary: (campaignId: string) => CampaignSummary;
}