// server/routes/scrape.js
import express from 'express';
import { ApifyClient } from 'apify-client';
import { fetchIntegrationSettings } from '../lib/supabase-utils.js';

const router = express.Router();

const ACTOR_ID = 'curious_coder/linkedin-post-search-scraper';

router.get('/scrape/:userId/:hashtag', async (req, res) => {
  try {
    const hashtag = req.params.hashtag;
    if (!hashtag) {
      return res.status(400).json({ error: 'Missing hashtag parameter' });
    }

    const userId = req.params.userId;
    const settings = await fetchIntegrationSettings(userId);
    const { li_at, jsessionid, apify_api_token } = settings;

    if (!li_at || !jsessionid || !apify_api_token) {
      return res.status(400).json({ error: 'Missing one or more required settings' });
    }

    const cookies = [
      { name: 'li_at', value: li_at },
      { name: 'JSESSIONID', value: jsessionid.replace(/^"(.*)"$/, '$1') },
    ];

    const client = new ApifyClient({ token: apify_api_token });

    const run = await client.actor(ACTOR_ID).call({
      urls: [`https://www.linkedin.com/search/results/content/?keywords=%23${hashtag}`],
      searchTerms: [`#${hashtag}`],
      maxPostCount: 50,
      maxConcurrency: 10,
      maxRequestRetries: 3,
      timeoutSecs: 300,
      cookie: cookies,
      useApifyProxy: true,
      proxy: { useApifyProxy: true }
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    const formatted = items.map((item) => {
      const likes = parseInt(item.numLikes || '0', 10);
      const comments = parseInt(item.numComments || '0', 10);
      const shares = parseInt(item.numShares || '0', 10);

      let authorName = 'Unknown Author';
      if (typeof item.author === 'object' && item.author !== null) {
        const { firstName, lastName } = item.author;
        authorName = `${firstName || ''} ${lastName || ''}`.trim();
      } else if (typeof item.author === 'string') {
        authorName = item.author;
      } else if (typeof item.authorInfo === 'object' && item.authorInfo !== null) {
        const { firstName, lastName } = item.authorInfo;
        authorName = `${firstName || ''} ${lastName || ''}`.trim();
      }

      return {
        postDate: new Date(item.timestamp || Date.now()).toISOString(),
        authorName,
        postLink: item.postUrl || '',
        content: item.text || '',
        likes,
        comments,
        shares,
        hashtags: Array.isArray(item.hashtags) ? item.hashtags : [hashtag],
      };
    });

    return res.json(formatted);
  } catch (error) {
    console.error('Scrape API error:', error);
    return res.status(500).json({ error: 'Failed to scrape LinkedIn posts' });
  }
});

export default router;