import type { Campaign } from '../types/index';

export const pollJobStatus = (
  campaignId: string,
  updateCampaigns: (updater: (prev: Campaign[]) => Campaign[]) => void,
  updateCampaignError: (id: string, error: string | null) => void,
  refresh: () => void
) => {
  const baseUrl = import.meta.env.DEV ? 'http://localhost:5001' : import.meta.env.VITE_API_URL;

  const interval = setInterval(async () => {
    try {
      const response = await fetch(`${baseUrl}/api/scrape-status/${campaignId}`);
      const result = await response.json();

      if (result.status === 'completed') {
        updateCampaigns(prev =>
          prev.map(c =>
            c.id === campaignId
              ? { ...c, status: 'completed', lastRun: new Date().toISOString() }
              : c
          )
        );
        updateCampaignError(campaignId, null);
        clearInterval(interval);
        refresh();
      } else if (result.status === 'failed') {
        updateCampaigns(prev =>
          prev.map(c =>
            c.id === campaignId ? { ...c, status: 'failed' } : c
          )
        );
        updateCampaignError(campaignId, result.error || 'Job failed');
        clearInterval(interval);
      }
      // Keep polling if status is still 'processing'
    } catch (err) {
      console.error('Polling job status failed:', err);
      updateCampaignError(campaignId, 'Polling failed. Please try again.');
      clearInterval(interval);
    }
  }, 4000); // every 4 seconds
};