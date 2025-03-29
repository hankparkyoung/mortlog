import express from 'express';
import { neon } from '@neondatabase/serverless';
const router = express.Router();

// GET /augments
router.get('/', async (_, res) => {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const response = await sql`
      SELECT *
      FROM augments
      ORDER BY
        array_position(
          ARRAY['silver', 'gold', 'prismatic']::tiers[],
          augment_tier
        );
    `;
    res.json(response);
  } catch (error) {
    console.error('Error getting augments:', error);
    res.status(500).json({ error: 'Failed to get augments' });
  }
});

// POST /augments
router.post('/', async (req, res) => {
  try {
    const { augment_name } = req.body;

    if (!augment_name) {
      return res.status(400).json({ error: 'augment_name is required' });
    }

    const sql = neon(process.env.DATABASE_URL);
    const response = await sql`
      INSERT INTO augments (augment_name)
      VALUES (${augment_name})
      RETURNING *
    `;
    res.status(201).json(response[0]);
  } catch (error) {
    console.error('Error adding augment:', error);
    res.status(500).json({ error: 'Failed to add augment' });
  }
});

export default router;