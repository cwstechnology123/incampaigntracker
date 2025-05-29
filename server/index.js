import express from 'express';
import cors from 'cors';
import scrapeRouter from './routes/scrape.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', scrapeRouter);

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});