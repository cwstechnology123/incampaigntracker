import React, { useMemo } from 'react';
import { Hash as Hashtag, Heart, MessageSquare, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Campaign, CampaignSummary } from '../../types';
import { useBootstrapDataStore } from '../../states/stores/useBootstrapDataStore';

export const DashboardSummary: React.FC = () => {
  const { campaigns, getCampaignSummary, isLoading } = useBootstrapDataStore() ?? {};
  
  const stats = useMemo(() => {
    if (!campaigns.length) {
      return {
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalPosts: 0,
        totalEngagement: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
      };
    }

    const summaries = campaigns.map((campaign: Campaign) => getCampaignSummary(campaign.id));

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c: Campaign) => c.status === 'completed').length,
      totalPosts: summaries.reduce((sum: number, s: CampaignSummary) => sum + s.postsCount, 0),
      totalEngagement: summaries.reduce((sum: number, s: CampaignSummary) => sum + s.totalEngagement, 0),
      totalLikes: summaries.reduce((sum: number, s: CampaignSummary) => sum + s.totalLikes, 0),
      totalComments: summaries.reduce((sum: number, s: CampaignSummary) => sum + s.totalComments, 0),
      totalShares: summaries.reduce((sum: number, s: CampaignSummary) => sum + s.totalShares, 0),
    };
  }, [campaigns, getCampaignSummary]);

  if (isLoading) {
    return <div className="card p-6 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card flex items-center space-x-4">
          <div className="rounded-full bg-primary-100 p-3">
            <Hashtag className="h-6 w-6 text-primary-500" />
          </div>
          <div>
            <p className="text-sm text-neutral-600">Total Campaigns</p>
            <p className="text-2xl font-bold text-neutral-900">{stats.totalCampaigns}</p>
          </div>
        </div>

        <div className="card flex items-center space-x-4">
          <div className="rounded-full bg-secondary-100 p-3">
            <BarChart2 className="h-6 w-6 text-secondary-500" />
          </div>
          <div>
            <p className="text-sm text-neutral-600">Total Posts</p>
            <p className="text-2xl font-bold text-neutral-900">{stats.totalPosts}</p>
          </div>
        </div>

        <div className="card flex items-center space-x-4">
          <div className="rounded-full bg-accent-100 p-3">
            <Heart className="h-6 w-6 text-accent-500" />
          </div>
          <div>
            <p className="text-sm text-neutral-600">Total Likes</p>
            <p className="text-2xl font-bold text-neutral-900">{stats.totalLikes}</p>
          </div>
        </div>

        <div className="card flex items-center space-x-4">
          <div className="rounded-full bg-success-100 p-3">
            <MessageSquare className="h-6 w-6 text-success-500" />
          </div>
          <div>
            <p className="text-sm text-neutral-600">Total Engagement</p>
            <p className="text-2xl font-bold text-neutral-900">{stats.totalEngagement}</p>
          </div>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <Hashtag className="mb-3 h-12 w-12 text-neutral-300" />
          <h3 className="mb-2 text-lg font-medium text-neutral-700">No campaigns yet</h3>
          <p className="mb-4 text-neutral-500">Create your first campaign to start tracking LinkedIn engagement</p>
          <Link to="/campaigns/new" className="btn btn-primary">
            Create Campaign
          </Link>
        </div>
      ) : (
        <div className="card">
          <h3 className="mb-4 text-lg font-medium text-neutral-800">Recent Campaigns</h3>
          <div className="divide-y divide-neutral-200">
            {campaigns.slice(0, 5).map((campaign: Campaign) => (
              <div key={campaign.id} className="flex items-center justify-between py-3">
                <div>
                  <Link 
                    to={`/campaigns/${campaign.id}`} 
                    className="font-medium text-primary-600 hover:text-primary-700"
                  >
                    {campaign.title}
                  </Link>
                  <p className="text-sm text-neutral-500">#{campaign.hashtag}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-neutral-700">
                      {getCampaignSummary(campaign.id).postsCount} posts
                    </p>
                    <p className="text-sm text-neutral-500">
                      {getCampaignSummary(campaign.id).totalEngagement} engagements
                    </p>
                  </div>
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    campaign.status === 'completed' ? 'bg-success-100 text-success-700' :
                    campaign.status === 'running' ? 'bg-primary-100 text-primary-700' :
                    campaign.status === 'failed' ? 'bg-error-100 text-error-700' :
                    'bg-neutral-100 text-neutral-700'
                  }`}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {campaigns.length > 5 && (
            <div className="mt-4 text-center">
              <Link to="/campaigns" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                View all campaigns
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};