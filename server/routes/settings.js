// server/routes/settings.js
import express from 'express';
import { withTimeoutAndRetry, fetchIntegrationSettings, upsertIntegrationSettings } from '../lib/supabase-utils.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.get('/settings', async (req, res) => {
  try {
    const userId =  req.user.id;
    const settings = await withTimeoutAndRetry(() => fetchIntegrationSettings(userId));
    if (!settings) {
      return res.status(404).json({ error: 'Integration settings not found' });
    }

    return res.status(200).json({
      message: 'Integration settings fetched successfully',
      settings,
    });
  } catch (err) {
    console.error('Error fetching integration settings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/settings', async (req, res) => {
  try {
    const userId =  req.user.id;
    const { apify_api_token, li_at, jsessionid } = req.body;

    if (!apify_api_token || !li_at || !jsessionid) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await withTimeoutAndRetry(() => upsertIntegrationSettings(userId, {
      apify_api_token,
      li_at,
      jsessionid,
    }));

    return res.status(200).json({
      message: 'Settings saved successfully',
      settings: result,
    });
  } catch (err) {
    console.error('Error saving integration settings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;