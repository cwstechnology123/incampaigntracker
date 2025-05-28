import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCampaigns } from '../../contexts/CampaignsContext';
import { usePosts } from '../../contexts/PostsContext';
import { exportToCSV } from '../../utils/mockApi';
import { format, parseISO } from 'date-fns';
import { 
  ArrowLeft, 
  Heart, 
  MessageSquare, 
  Share2, 
  Download, 
  Play, 
  Clock, 
  Calendar, 
  Trash2,
  Loader,
  AlertCircle,
  Linkedin
} from 'lucide-react';
import { PostList } from '../Post/PostList';
import { EngagementChart } from '../Post/EngagementChart';

export const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCampaign, runCampaign, deleteCampaign, isLoading } = useCampaigns();
  const { getCampaignPosts, getCampaignSummary } = usePosts();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const campaign = id ? getCampaign(id) : undefined;
  const posts = id ? getCampaignPosts(id) : [];
  const summary = id ? getCampaignSummary(id) : {
    campaignId: '',
    postsCount: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    totalEngagement: 0,
    lastUpdated: new Date().toISOString(),
  };
  
  useEffect(() => {
    if (!campaign && !isLoading) {
      navigate('/campaigns');
    }
  }, [campaign, isLoading, navigate]);
  
  const handleRunCampaign = async () => {
    if (!id) return;
    
    try {
      setError(null);
      await runCampaign(id);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };
  
  const handleDeleteCampaign = async () => {
    if (!id || !confirmDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteCampaign(id);
      navigate('/campaigns');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      setIsDeleting(false);
    }
  };
  
  const handleExportCSV = () => {
    if (!campaign || !posts.length) return;
    exportToCSV(posts, campaign.title);
  };
  
  if (!campaign) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/campaigns" className="btn btn-ghost flex items-center space-x-1">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Campaigns</span>
        </Link>
        
        <div className={`ml-auto inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
          campaign.status === 'completed' ? 'bg-success-100 text-success-700' :
          campaign.status === 'running' ? 'bg-primary-100 text-primary-700' :
          campaign.status === 'failed' ? 'bg-error-100 text-error-700' :
          campaign.status === 'no_posts_found' ? 'bg-warning-100 text-warning-700' :
          'bg-neutral-100 text-neutral-700'
        }`}>
          {campaign.status === 'running' && <Loader className="mr-1 h-3 w-3 animate-spin" />}
          {campaign.status === 'no_posts_found' ? 'No Posts Found' :
            campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
        </div>
      </div>
      
      <div className="card space-y-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{campaign.title}</h1>
            <div className="mt-1 flex items-center text-sm text-neutral-500">
              <Hashtag className="mr-1 h-4 w-4" />
              <span>{campaign.hashtag}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {campaign.status !== 'running' && (
              <button
                onClick={handleRunCampaign}
                disabled={isLoading}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span>{posts.length > 0 ? 'Run Again' : 'Run Campaign'}</span>
              </button>
            )}
            
            {posts.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="btn btn-outline flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
            )}
            
            <button
              onClick={() => setConfirmDelete(true)}
              className="btn btn-ghost text-error-600 hover:bg-error-50 hover:text-error-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {error && (
          <div className="flex items-start rounded-md bg-error-50 p-3 text-error-700">
            <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {campaign.description && (
          <p className="text-neutral-600">{campaign.description}</p>
        )}
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
          <div className="flex items-center">
            <Calendar className="mr-1 h-4 w-4" />
            <span>Created on {format(parseISO(campaign.createdAt), 'MMM d, yyyy')}</span>
          </div>
          
          {campaign.lastRun && (
            <div className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              <span>Last run {format(parseISO(campaign.lastRun), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>
      </div>
      
      {confirmDelete && (
        <div className="card border-error-200 bg-error-50">
          <h3 className="mb-2 text-lg font-semibold text-error-800">Confirm Deletion</h3>
          <p className="mb-4 text-error-600">
            Are you sure you want to delete this campaign? This action cannot be undone.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => setConfirmDelete(false)}
              className="btn btn-outline"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteCampaign}
              className="btn bg-error-600 text-white hover:bg-error-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Campaign'}
            </button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="mb-4 text-xl font-semibold">Engagement Overview</h2>
          {posts.length > 0 ? (
            <div className="h-80">
              <EngagementChart posts={posts} />
            </div>
          ) : (
            <div className="flex h-80 flex-col items-center justify-center text-center">
              <MessageSquare className="mb-3 h-12 w-12 text-neutral-300" />
              <h3 className="mb-2 text-lg font-medium text-neutral-700">No data available</h3>
              <p className="text-neutral-500">Run the campaign to collect engagement data</p>
            </div>
          )}
        </div>
        
        <div className="card">
          <h2 className="mb-4 text-xl font-semibold">Campaign Stats</h2>
          <div className="space-y-4">
            <div className="rounded-md bg-neutral-50 p-4">
              <p className="text-sm text-neutral-600">Posts Tracked</p>
              <p className="text-2xl font-bold text-neutral-900">{summary.postsCount}</p>
            </div>
            
            <div className="rounded-md bg-primary-50 p-4">
              <div className="flex items-center space-x-2 text-primary-800">
                <Heart className="h-5 w-5" />
                <p className="font-medium">Total Likes</p>
              </div>
              <p className="mt-1 text-2xl font-bold text-primary-900">{summary.totalLikes}</p>
            </div>
            
            <div className="rounded-md bg-secondary-50 p-4">
              <div className="flex items-center space-x-2 text-secondary-800">
                <MessageSquare className="h-5 w-5" />
                <p className="font-medium">Total Comments</p>
              </div>
              <p className="mt-1 text-2xl font-bold text-secondary-900">{summary.totalComments}</p>
            </div>
            
            <div className="rounded-md bg-accent-50 p-4">
              <div className="flex items-center space-x-2 text-accent-800">
                <Share2 className="h-5 w-5" />
                <p className="font-medium">Total Shares</p>
              </div>
              <p className="mt-1 text-2xl font-bold text-accent-900">{summary.totalShares}</p>
            </div>
            
            <div className="rounded-md bg-success-50 p-4">
              <p className="font-medium text-success-800">Total Engagement</p>
              <p className="mt-1 text-3xl font-bold text-success-900">{summary.totalEngagement}</p>
              <p className="mt-1 text-sm text-success-700">Likes + Comments + Shares</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2 className="mb-4 text-xl font-semibold">LinkedIn Posts</h2>
        {posts.length > 0 ? (
          <PostList posts={posts} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Linkedin className="mb-3 h-12 w-12 text-neutral-300" />
            <h3 className="mb-2 text-lg font-medium text-neutral-700">No posts found</h3>
            <p className="mb-4 text-neutral-500">
              {campaign.status === 'idle' 
                ? 'Run the campaign to start tracking LinkedIn posts with this hashtag'
                : campaign.status === 'running'
                ? 'Campaign is currently running, please wait...'
                : campaign.status === 'failed'
                ? 'Campaign failed to run. Please try again.'
                : campaign.status === 'no_posts_found'
                ? `No LinkedIn posts found with the hashtag #${campaign.hashtag}`
                : 'No posts with this hashtag were found'}
            </p>
            {campaign.status !== 'running' && (
              <button
                onClick={handleRunCampaign}
                disabled={isLoading}
                className="btn btn-primary"
              >
                {campaign.status === 'completed' ? 'Run Again' : 'Run Campaign'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Hashtag: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <line x1="4" y1="9" x2="20" y2="9"></line>
    <line x1="4" y1="15" x2="20" y2="15"></line>
    <line x1="10" y1="3" x2="8" y2="21"></line>
    <line x1="16" y1="3" x2="14" y2="21"></line>
  </svg>
);