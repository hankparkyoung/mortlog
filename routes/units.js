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

router.get('/with-traits', async (_, res) => {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const response = await sql`
      SELECT
        u.unit_id,
        u.unit_name,
        u.cost,
        json_agg(
          json_build_object(
            'trait_id', t.trait_id,
            'trait_name', t.trait_name
          )
        ) AS traits
      FROM
        units u
      LEFT JOIN
        unit_traits ut ON u.unit_id = ut.unit_id
      LEFT JOIN
        traits t ON ut.trait_id = t.trait_id
      GROUP BY
        u.unit_id, u.unit_name, u.cost
      ORDER BY
        u.cost ASC, u.unit_name ASC
    `;
    res.json(response);
  } catch (error) {
    console.error('Error getting units with traits:', error);
    res.status(500).json({ error: 'Failed to get units with traits' });
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