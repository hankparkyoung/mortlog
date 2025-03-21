import express from 'express';
import { neon } from '@neondatabase/serverless';
const router = express.Router();

router.get('/', async (_, res) => {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const response = await sql`SELECT * FROM games`;
    res.json(response);
  } catch (error) {
    console.error('Error getting games:', error);
    res.status(500).json({ error: 'Failed to get games' });
  }
});

// todo - query games via:
// - patch
// - hack
// - encounter
// - unit
// - trait

router.post('/', async (req, res) => {
  try {
    const { encounter_id, patch, notes, unit_ids, hack_ids } = req.body;

    if (!encounter_id || !patch || !unit_ids) {
      return res.status(400).json({ 
        error: 'encounter_id, patch, and unit_ids are required'
      });
    };

    if (!Array.isArray(unit_ids)) {
      return res.status(400).json({
        error: 'unit_ids must be an array'
      });
    };

    if (hack_ids && !Array.isArray(hack_ids)) {
      return res.status(400).json({
        error: 'hack_ids must be an array'
      });
    };

    const sql = neon(process.env.DATABASE_URL);

    // 1. Insert into games table
    const gameResponse = await sql`
      INSERT INTO games (encounter_id, patch, notes)
      VALUES (${encounter_id}, ${patch}, ${notes})
      RETURNING game_id
    `;
    const gameId = gameResponse[0].game_id;

    // 2. Insert into game_units table
    for (const unit_id of unit_ids) {
      await sql`
        INSERT INTO game_units (game_id, unit_id)
        VALUES (${gameId}, ${unit_id})
      `;
    };

    // 3. Insert into game_hacks table
    for (const hack_id of hack_ids) {
      await sql`
      INSERT INTO game_hacks (game_id, hack_id)
      VALUES (${gameId}, ${hack_id})
    `;
    };

    // 4. Find the traits that were in this game
    const compiledTraits = {};
    for (const unit_id of unit_ids) {
      const unitTraitsResponse = await sql`
        SELECT trait_id FROM unit_traits WHERE unit_id = ${unit_id}
      `;
      unitTraitsResponse.forEach(trait => {
        const traitId = trait.trait_id;
        compiledTraits[traitId] = (compiledTraits[traitId] || 0) + 1;
      });
    };

    // 5. Find the breakpoints for each trait
    for (const trait_id of Object.keys(compiledTraits)) {
      const traitBreakpointResponse = await sql`
        SELECT breakpoint_id, breakpoint_value FROM trait_breakpoints WHERE trait_id = ${trait_id}
        ORDER BY breakpoint_value DESC
      `;

      let highestBreakpointId = null;
      traitBreakpointResponse.forEach(breakpoint => {
        if (compiledTraits[trait_id] >= breakpoint.breakpoint_value) {
          highestBreakpointId = breakpoint.breakpoint_id;
        }
      });

      // 6. Insert the breakpoints achieved for the game
      if (highestBreakpointId) {
        await sql`
          INSERT INTO game_trait_breakpoints (game_id, breakpoint_id)
          VALUES (${gameId}, ${highestBreakpointId})
        `;
      }
    };

    // Completion!
    res.status(201).json({
      game_id: gameId,
      message: 'Game added successfully'
    });
  } catch (error) {
    console.error('Error adding game:', error);
    res.status(500).json({
      error: 'Failed to add game'
    });
  }
});

export default router;