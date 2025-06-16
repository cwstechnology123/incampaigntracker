import express from 'express';
import { scrapeQueue } from '../queue/scrapeQueue.js';
import { fetchJobIdByCampaignId } from '../lib/supabase-utils.js';

const router = express.Router();

router.get('/scrape-status/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const jobId = await fetchJobIdByCampaignId(campaignId);

    if (!jobId) {
      return res.status(404).json({ status: 'not_found', error: 'No job found for this campaign' });
    }

    const job = await scrapeQueue.getJob(jobId);
    if (!job) {
      return res.status(404).json({ status: 'not_found', error: 'Job not found in queue' });
    }

    const state = await job.getState();
    const returnValue = job.returnvalue || null;
    const failedReason = job.failedReason || returnValue?.error || null;

    return res.status(200).json({
      status: state,
      result: returnValue,
      job_id: job.id,
      error: failedReason,
    });

  } catch (err) {
    console.error('Error fetching scrape status:', err);
    return res.status(500).json({ status: 'error', error: 'Internal server error' });
  }
});

export default router;