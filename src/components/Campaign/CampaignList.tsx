import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Calendar, ArrowUpDown, Loader } from 'lucide-react';
import { useCampaigns } from '../../contexts/CampaignsContext';
import { usePosts } from '../../contexts/PostsContext';
import { format, parseISO } from 'date-fns';

export const CampaignList: React.FC = () => {
  const { campaigns, isLoading } = useCampaigns();
  const { getCampaignSummary } = usePosts();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'date' | 'title' | 'engagement'>('date');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');

  // Filter campaigns by search term
  const filteredCampaigns = React.useMemo(() => {
    if (!searchTerm) return campaigns;
    
    const term = searchTerm.toLowerCase();
    return campaigns.filter(campaign => 
      campaign.title.toLowerCase().includes(term) ||
      campaign.description.toLowerCase().includes(term) ||
      campaign.hashtag.toLowerCase().includes(term)
    );
  }, [campaigns, searchTerm]);

  // Sort campaigns
  const sortedCampaigns = React.useMemo(() => {
    return [...filteredCampaigns].sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'engagement') {
        const engagementA = getCampaignSummary(a.id).totalEngagement;
        const engagementB = getCampaignSummary(b.id).totalEngagement;
        comparison = engagementA - engagementB;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredCampaigns, sortBy, sortDirection, getCampaignSummary]);

  const toggleSort = (field: 'date' | 'title' | 'engagement') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold">Your Campaigns</h1>
        <Link to="/campaigns/new" className="btn btn-primary flex items-center justify-center space-x-2">
          <PlusCircle className="h-4 w-4" />
          <span>New Campaign</span>
        </Link>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search campaigns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input w-full pl-10"
        />
      </div>
      
      {isLoading ? (
        <div className="card flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : sortedCampaigns.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <h3 className="mb-2 text-lg font-medium text-neutral-700">No campaigns found</h3>
          {searchTerm ? (
            <p className="text-neutral-500">Try adjusting your search query</p>
          ) : (
            <>
              <p className="mb-4 text-neutral-500">Create your first campaign to start tracking LinkedIn engagement</p>
              <Link to="/campaigns/new" className="btn btn-primary">
                Create Campaign
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600">
                    <button
                      className="flex items-center space-x-1"
                      onClick={() => toggleSort('title')}
                    >
                      <span>Campaign</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600">
                    Hashtag
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600">
                    <button
                      className="flex items-center space-x-1"
                      onClick={() => toggleSort('date')}
                    >
                      <span>Created</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600">
                    <button
                      className="flex items-center space-x-1"
                      onClick={() => toggleSort('engagement')}
                    >
                      <span>Engagement</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {sortedCampaigns.map((campaign) => {
                  const summary = getCampaignSummary(campaign.id);
                  
                  return (
                    <tr key={campaign.id} className="hover:bg-neutral-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <Link to={`/campaigns/${campaign.id}`} className="font-medium text-primary-600 hover:text-primary-700">
                          {campaign.title}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-600">
                        #{campaign.hashtag}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-600">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-neutral-400" />
                          {format(parseISO(campaign.createdAt), 'MMM d, yyyy')}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          campaign.status === 'completed' ? 'bg-success-100 text-success-700' :
                          campaign.status === 'running' ? 'bg-primary-100 text-primary-700' :
                          campaign.status === 'failed' ? 'bg-error-100 text-error-700' :
                          'bg-neutral-100 text-neutral-700'
                        }`}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-600">
                        <div className="flex flex-col">
                          <span className="font-medium">{summary.totalEngagement} total</span>
                          <span className="text-xs text-neutral-500">
                            {summary.postsCount} posts tracked
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};