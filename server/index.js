import express from 'express';
import cors from 'cors';
import authenticate from './middleware/authMiddleware.js';
import scrapeRouter from './routes/scrape.js';
import scrapeStatusRouter from './routes/scrape-status.js';
import settingsRouter from './routes/settings.js';
import bootstrapRouter from './routes/bootstrap.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', authenticate, scrapeRouter);
app.use('/api', authenticate, scrapeStatusRouter);
app.use('/api', authenticate, settingsRouter);
app.use('/api', authenticate, bootstrapRouter);

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});