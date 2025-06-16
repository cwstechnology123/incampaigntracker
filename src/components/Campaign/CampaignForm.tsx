import React from 'react';
import { useCampaigns } from '../../contexts/CampaignsContext';
import { useNavigate } from 'react-router-dom';
import { Hash as Hashtag, FileText, AlertCircle, Loader } from 'lucide-react';
import { useForm } from 'react-hook-form';

type FormData = {
  title: string;
  description: string;
  hashtag: string;
};

export const CampaignForm: React.FC = () => {
  const { createCampaign, isLoading } = useCampaigns();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      const formattedHashtag = data.hashtag.startsWith('#')
        ? data.hashtag.slice(1)
        : data.hashtag;

      const created_at = new Date().toISOString();

      const campaign = await createCampaign({
        title: data.title.trim(),
        description: data.description?.trim(),
        hashtag: formattedHashtag,
        user_id: '',
        created_at
      });

      if (campaign && campaign.id) {
        navigate(`/campaigns/${campaign.id}`);
      } else {
        throw new Error('Failed to create campaign');
      }
    } catch (err) {
      setError('root', {
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    }
  };
  
  return (
    <div className="mx-auto max-w-2xl">
      <div className="card">
        <h2 className="mb-6 text-2xl font-bold text-neutral-800">Create New Campaign</h2>

        {errors.root && (
          <div className="mb-4 flex items-start rounded-md bg-error-50 p-3 text-error-700">
            <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
            <span>{errors.root.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="label">Campaign Title</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
              <input
                id="title"
                className="input w-full pl-10"
                placeholder="Q2 Marketing Campaign"
                disabled={isLoading}
                {...register('title', { required: 'Title is required' })}
              />
            </div>
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="label">Description (Optional)</label>
            <textarea
              id="description"
              className="input w-full min-h-[100px]"
              placeholder="Track engagement for our Q2 marketing initiative"
              disabled={isLoading}
              {...register('description')}
            />
          </div>

          {/* Hashtag */}
          <div>
            <label htmlFor="hashtag" className="label">Hashtag to Track</label>
            <div className="relative">
              <Hashtag className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
              <input
                id="hashtag"
                className="input w-full pl-10"
                placeholder="marketing2025"
                disabled={isLoading}
                {...register('hashtag', { required: 'Hashtag is required' })}
              />
            </div>
            {errors.hashtag && <p className="text-sm text-red-500">{errors.hashtag.message}</p>}
            <p className="mt-1 text-xs text-neutral-500">
              Enter with or without the # symbol (e.g., marketing or #marketing)
            </p>
          </div>

          {/* Submit */}
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