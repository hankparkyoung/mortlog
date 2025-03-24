import express from 'express';
import { neon } from '@neondatabase/serverless';
const router = express.Router();

router.get('/', async (_, res) => {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const response = await sql`SELECT * FROM trait_breakpoints`;
    res.json(response);
  } catch (error) {
    console.error('Error getting trait breakpoints:', error);
    res.status(500).json({ error: 'Failed to get trait breakpoints '});
  }
});

router.get('/with-names', async (_, res) => {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const response = await sql`
      SELECT
        tb.breakpoint_id,
        t.trait_id,
        t.trait_name,
        tb.breakpoint_value,
        tb.breakpoint_tier,
        tb.trait_id
      FROM
        trait_breakpoints tb
      JOIN
        traits t on tb.trait_id = t.trait_id
      ORDER BY
        tb.breakpoint_id ASC;
    `;
    res.json(response);
  } catch (error) {
    console.error('Error getting trait breakpoints with names:', error);
    res.status(500).json({ error: 'Failed to get trait breakpoints with names' });
  }
})

export default router;