import express from 'express';
import { neon } from '@neondatabase/serverless';
const router = express.Router();

// GET /traits
router.get('/', async (_, res) => {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const response = await sql`SELECT * FROM traits`;
    res.json(response);
  } catch (error) {
    console.error('Error getting traits:', error);
    res.status(500).json({ error: 'Failed to get traits' });
  }
});

export default router;