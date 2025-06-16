import { Queue } from 'bullmq';

const connection = {
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: null,
};

export const scrapeQueue = new Queue('scrapeQueue', {
  connection,
});