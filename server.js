import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';

import units from './routes/units.js';
import traits from './routes/traits.js';
import encounters from './routes/encounters.js';
import hacks from './routes/hacks.js';
import games from './routes/games.js';
import traitBreakpoints from './routes/traitBreakpoints.js';
import augments from './routes/augments.js';

const app = express();
const PORT = process.env.PORT || 4242;
app.use(express.json());
app.use(cors());
app.use((_, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

app.use('/units', units);
app.use('/traits', traits);
app.use('/encounters', encounters);
app.use('/hacks', hacks);
app.use('/games', games);
app.use('/trait-breakpoints', traitBreakpoints);
app.use('/augments', augments);

app.get('/', async (_, res) => {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const response = await sql`SELECT NOW()`;
    const { now } = response[0];
    res.json({ message: 'Connection successful!', current_time: now });
  } catch (error) {
    console.error('Error connecting to Neon:', error);
    res.status(500).json({ error: 'Failed to connect to Neon' });
  }
});

app.listen(PORT, () => {
  console.log(`Listening to http://localhost:${PORT}`);
});