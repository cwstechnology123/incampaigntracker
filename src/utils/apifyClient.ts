import { ApifyClient } from 'apify-client';
import { fetchIntegrationSettings } from '../lib/integrationSettingsQueries';

const ACTOR_ID = 'curious_coder/linkedin-post-search-scraper';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await sleep(delay);
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
};

const parseCookies = async () => {
  const settings = await fetchIntegrationSettings();

  const liAt = settings?.li_at;
  const jsessionId = settings?.jsessionid;
  const apifyToken = settings?.apify_api_token;

  if (!apifyToken) {
    throw new Error('Apify API token not found. Please update your settings.');
  }

  if (!liAt || !jsessionId || !apifyToken) {
    throw new Error('Missing one or more required settings: li_at, JSESSIONID, Apify token.');
  }

  const cookies = [
    { name: 'li_at', value: liAt },
    { name: 'JSESSIONID', value: jsessionId.replace(/^"(.*)"$/, '$1') }
  ];

  return { cookies, apifyToken };
};

export const scrapeLinkedInPosts = async (hashtag: string) => {
  try {
    const { cookies, apifyToken } = await parseCookies(); // Use cookies + token from DB

    // Initialize the client with the current token
    const client = new ApifyClient({
      token: apifyToken,
    });

    const run = await retryWithBackoff(() => 
      client.actor(ACTOR_ID).call({
        urls: [`https://www.linkedin.com/search/results/content/?keywords=%23${hashtag}`],
        searchTerms: [`#${hashtag}`],
        maxPostCount: 50,
        maxConcurrency: 10,
        maxRequestRetries: 3,
        timeoutSecs: 300,
        cookie: cookies,
        useApifyProxy: true,
        proxy: { useApifyProxy: true }
      })
    );

    const { items } = await retryWithBackoff(() => 
      client.dataset(run.defaultDatasetId).listItems()
    );

    if (!items?.length) {
      throw new Error(`No posts found for hashtag #${hashtag}`);
    }

    return items.map((item: any) => {
      // Extract engagement metrics using the exact field names
      const likes = parseInt(item.numLikes || '0', 10);
      const comments = parseInt(item.numComments || '0', 10);
      const shares = parseInt(item.numShares || '0', 10);

      // Handle author information which can be either a string or an object
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
        authorName: authorName || 'Unknown Author',
        postLink: item.postUrl || '',
        content: item.text || '',
        likes,
        comments,
        shares,
        hashtags: Array.isArray(item.hashtags) ? item.hashtags : [hashtag],
      };
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to scrape LinkedIn posts';
    console.error('Error scraping LinkedIn posts:', error);
    throw new Error(`Error scraping LinkedIn posts: ${message}`);
  }
};