import express from 'express';
import { neon } from '@neondatabase/serverless';
const router = express.Router();

// GET /encounters
router.get('/', async (_, res) => {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const response = await sql`SELECT * FROM encounters`;
    res.json(response);
  } catch (error) {
    console.error('Error getting encounters:', error);
    res.status(500).json({ error: 'Failed to get encounters' });
  }
});

// POST /encounters
router.post('/', async (req, res) => {
  try {
    const { encounter_name } = req.body;
    
    if (!encounter_name) {
      return res.status(400).json({ error: 'encounter_name is required' });
    }

    const sql = neon(process.env.DATABASE_URL);
    const response = await sql`
      INSERT INTO encounters (encounter_name)
      VALUES (${encounter_name})
      RETURNING *
    `;
    res.status(201).json(response[0]);
  } catch (error) {
    console.error('Error adding encounter:', error);
    res.status(500).json({ error: 'Failed to add encounter' });
  }
});

export default router;