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

// GET /trait by id
router.get('/:traitId', async (req, res) => {
  try {
    const { traitId } = req.params;
    const sql = neon(process.env.DATABASE_URL);
    const response = await sql`
      SELECT * FROM traits WHERE trait_id = ${traitId}
    `;

    if (response.length > 0) {
      res.json(response[0]);
    } else {
      res.status(404).json({ error: 'Trait not found' });
    }
  } catch (error) {
    console.error('Error getting trait:', error);
    res.status(500).json({ error: 'Failed to get trait' });
  }
});

export default router;