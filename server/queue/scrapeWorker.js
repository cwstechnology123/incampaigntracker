import { Worker } from 'bullmq';
import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';
import { saveToSupabasePosts } from '../lib/supabase-utils.js';

dotenv.config();

const connection = {
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: null,
};

const ACTOR_ID = process.env.APIFY_ACTOR_ID;

export const scrapeWorker = new Worker('scrapeQueue', async (job) => {
  const { hashtag, campaign_id, settings } = job.data;

  try {
    const { li_at, jsessionid, apify_api_token } = settings;

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
      timeoutSecs: 600,
      cookie: cookies,
      useApifyProxy: true,
      proxy: { useApifyProxy: true },
    });

    const runId = run.id;
    console.log(`Run started with ID: ${runId}`);
    if (run.status === 'FAILED') {
      throw new Error('Failed to authorize with LinkedIn. Please retry with new cookies. Check your integration settings.');
    }

    let status = 'RUNNING';
    let retries = 0;
    const maxRetries = 100;

    while (status === 'RUNNING' && retries < maxRetries) {
      const { status: currentStatus } = await client.run(runId).get();
      if (currentStatus === 'SUCCEEDED') break;
      if (['FAILED', 'ABORTED'].includes(currentStatus)) {
        throw new Error(`Run failed: ${currentStatus}`);
      }
      await new Promise((res) => setTimeout(res, 3000));
      retries++;
    }

    const dataset = await client.run(runId).dataset().listItems();

    await saveToSupabasePosts(dataset.items, campaign_id, hashtag);

    return {
      itemsSaved: dataset.items.length,
      data: dataset.items,
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown scraping error occurred.';

    // Attach the error message to job return value so it’s accessible via /scrape-status/:jobId
    job.returnvalue = { error: errorMessage };
    job.log(`Scrape failed: ${errorMessage}`);
    console.error('Scrape job failed:', errorMessage);

    // Re-throw to mark job as failed
    throw new Error(errorMessage);
  }
}, {
  connection,
  lockDuration: 15 * 60 * 1000, // 15 minutes
});