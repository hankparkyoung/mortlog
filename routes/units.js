import express from 'express';
import { neon } from '@neondatabase/serverless';
const router = express.Router();

// GET /units
router.get('/', async (_, res) => {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const response = await sql`
      SELECT * FROM units
    `;
    res.json(response);
  } catch (error) {
    console.error('Error getting units:', error);
    res.status(500).json({ error: 'Failed to get units' });
  }
});

router.get('/:unitId', async (req, res) => {
  try {
    const { unitId } = req.params;
    const sql = neon(process.env.DATABASE_URL);
    const response = await sql`
      SELECT * FROM units WHERE unit_id = ${unitId}
    `;

    if (response.length > 0) {
      res.json(response[0]);
    } else {
      res.status(404).json({ error: 'Unit not found' });
    }
  } catch (error) {
    console.error('Error getting unit:', error);
    res.status(500).json({ error: 'Failed to get unit' });
  }
});

export default router;