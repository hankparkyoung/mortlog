import express from 'express';
import { neon } from '@neondatabase/serverless';
const router = express.Router();

// GET /hacks
router.get('/', async (_, res) => {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const response = await sql`SELECT * FROM hacks`;
    res.json(response);
  } catch (error) {
    console.error('Error getting hacks:', error);
    res.status(500).json({ error: 'Failed to get hacks' });
  }
});

// POST /hacks
router.post('/', async (req, res) => {
  try {
    const { hack_name } = req.body;
    
    if (!hack_name) {
      return res.status(400).json({ error: 'hack_name is required' });
    }

    const sql = neon(process.env.DATABASE_URL);
    const response = await sql`
      INSERT INTO hacks (hack_name)
      VALUES (${hack_name})
      RETURNING *
    `;
    res.status(201).json(response[0]);
  } catch (error) {
    console.error('Error adding hack:', error);
    res.status(500).json({ error: 'Failed to add hack' });
  }
});

export default router;