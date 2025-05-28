import React, { useState } from 'react';
import { useCampaigns } from '../../contexts/CampaignsContext';
import { useNavigate } from 'react-router-dom';
import { Hash as Hashtag, FileText, AlertCircle, Loader } from 'lucide-react';

export const CampaignForm: React.FC = () => {
  const { createCampaign, isLoading } = useCampaigns();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtag, setHashtag] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      // Validate inputs
      if (!title.trim() || !hashtag.trim()) {
        setError('Title and hashtag are required');
        return;
      }
      
      // Format hashtag (remove # if present)
      const formattedHashtag = hashtag.startsWith('#') ? hashtag.substring(1) : hashtag;
      
      const campaign = await createCampaign({
        title: title.trim(),
        description: description.trim(),
        hashtag: formattedHashtag.trim(),
      });
      
      if (campaign && campaign.id) {
        navigate(`/campaigns/${campaign.id}`);
      } else {
        throw new Error('Failed to create campaign');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };
  
  return (
    <div className="mx-auto max-w-2xl">
      <div className="card">
        <h2 className="mb-6 text-2xl font-bold text-neutral-800">Create New Campaign</h2>
        
        {error && (
          <div className="mb-4 flex items-start rounded-md bg-error-50 p-3 text-error-700">
            <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="label">
              Campaign Title
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Q2 Marketing Campaign"
                className="input w-full pl-10"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="label">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Track engagement for our Q2 marketing initiative"
              className="input w-full min-h-[100px]"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="hashtag" className="label">
              Hashtag to Track
            </label>
            <div className="relative">
              <Hashtag className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
              <input
                id="hashtag"
                type="text"
                value={hashtag}
                onChange={(e) => setHashtag(e.target.value)}
                placeholder="marketing2025"
                className="input w-full pl-10"
                disabled={isLoading}
              />
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Enter with or without the # symbol (e.g., marketing or #marketing)
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/campaigns')}
              className="btn btn-outline"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};