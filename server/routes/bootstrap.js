import express from 'express';
import { getBootstrapData } from '../lib/supabase-utils.js';

const router = express.Router();

router.get('/bootstrap', async (req, res) => {
  const userId =  req.user.id;
  try {
    const data = await getBootstrapData(userId);
    res.json({ success: true, data });
  } catch (err) {
    console.error('Bootstrap error:', err);
    res.status(500).json({ error: err.message || 'Failed to bootstrap data' });
  }
});

export default router;