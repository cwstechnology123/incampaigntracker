// server/routes/scrape.js
import express from 'express';
import { scrapeQueue } from '../queue/scrapeQueue.js';
import { getCurrentUserId, fetchIntegrationSettings, updateCampaignStatus, fetchCampaignById} from '../lib/supabase-utils.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.post('/scrape', async (req, res) => {
  try {
    const { campaign_id } = req.body;
    if (!campaign_id) return res.status(400).json({ message: 'Campaign ID is required' });
    
    const userId =  req.user.id;

    // Step 1: Fetch campaign
    const campaign = await fetchCampaignById(campaign_id);
    if (!campaign?.hashtag || !campaign?.hashtag.trim()) {
      return res.status(400).json({ error: 'Campaign not found or missing hashtag' });
    }
    const hashtag = campaign.hashtag.trim().replace(/^#/, '');
    console.log('Scraping posts for user:', userId, 'with hashtag:', hashtag);

    // Step 2: Fetch integration settings
    const settings = await fetchIntegrationSettings(userId);
    if (!settings) {
      return res.status(400).json({ error: 'Integration settings not found' });
    }

    // Ensure required settings are present
    const { li_at, jsessionid, apify_api_token } = settings;
    if (!li_at || !jsessionid || !apify_api_token) {
      return res.status(400).json({ error: 'Missing required integration settings' });
    }

    // Step 3: Scrape Queue
    const job = await scrapeQueue.add('scrape-job', {
      hashtag,
      campaign_id,
      settings,
    });

    // Step 4: Save job ID to campaign
    await updateCampaignStatus(campaign_id, 'running', job.id);

    return res.status(202).json({ jobId: job.id, status: 'running' });
  } catch (err) {
    console.error('Scrape trigger error:', err);
    res.status(500).json({ error: 'Scraping job submission failed' });
  }
});

export default router;