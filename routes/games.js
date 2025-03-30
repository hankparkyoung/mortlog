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

router.post('/', async (req, res) => {
  const {
    patch,
    notes,
    encounter_id,
    hack_ids,
    augments,
    unit_ids
  } = req.body;

  const validationError = (message) => {
    return res.status(400).json({ error: message });
  };

  // validations
  if (!patch) return validationError(
    'patch is required'
  );
  if (!notes) return validationError(
    'notes are required'
  );
  if (!encounter_id) return validationError(
    'encounter_id is required'
  );
  if (!hack_ids || !Array.isArray(hack_ids) || hack_ids.length === 0) {
    return validationError('hack_ids is a required non-empty array');
  };
  if (!augments || !Array.isArray(augments) || augments.length === 0) {
    return validationError('augments is a required non-empty array');
  };
  for (const augment of augments) {
    if (!augment.game_stage || !augment.augment_id) {
      return validationError('augments must have game_stage and augment_id');
    };
  };
  if (!unit_ids || !Array.isArray(unit_ids) || unit_ids.length === 0) {
    return validationError('unit_ids is a required non-empty array');
  };
  console.log('Validation passed. Proceeding to database logic...');

  const sql = neon(process.env.DATABASE_URL);
  let gameId;

  try {
    await sql`BEGIN`;
    console.log('BEGIN transaction');
    // await sql.transaction(async sqlTx => {
      try {

      // insert into games table
      const gameRes = await sql`
        INSERT INTO games (encounter_id, patch, notes)
        VALUES (${encounter_id}, ${patch}, ${notes})
        RETURNING game_id
      `;
      gameId = gameRes[0].game_id;

      // insert into game_units table
      for (const unitId of unit_ids) {
        await sql`
          INSERT INTO game_units (game_id, unit_id)
          VALUES (${gameId}, ${unitId})
        `;
      }
      console.log(`Inserted ${unit_ids.length} rows into game_units for game ${gameId}`);

      // insert into game_hacks table
      for (const hackId of hack_ids) {
        await sql`
          INSERT INTO game_hacks (game_id, hack_id)
          VALUES (${gameId}, ${hackId})
        `;
      }
      console.log(`Inserted ${hack_ids.length} rows into game_hacks for game ${gameId}`);

      // insert into game_augments table
      for (const augment of augments) {
        await sql`
          INSERT INTO game_augments (game_id, augment_id, game_stage)
          VALUES (${gameId}, ${augment.augment_id}, ${augment.game_stage})
        `;
      }
      console.log(`Inserted ${augments.length} rows into game_augments for game ${gameId}`);

      // insert into game_trait_breakpoints table
      const unitTraitsRes = await sql`
        SELECT trait_id
        FROM unit_traits
        WHERE unit_id = ANY(${unit_ids})
      `;
      const traitCounts = {};
      unitTraitsRes.forEach(unitTrait => {
        traitCounts[unitTrait.trait_id] = (traitCounts[unitTrait.trait_id] || 0) + 1;
      });
      const activeTraitIds = Object.keys(traitCounts).map(id => parseInt(id));
      const breakpointsRes = await sql`
        SELECT breakpoint_id, trait_id, breakpoint_value
        FROM trait_breakpoints
        WHERE trait_id = ANY(${activeTraitIds})
        ORDER BY trait_id, breakpoint_value DESC
      `;
      const activeBreakpointIds = [];
      for (const traitId of activeTraitIds) {
        const currentTraitCount = traitCounts[traitId];
        const activeBreakpoint = breakpointsRes.find(breakpoint => {
          return breakpoint.trait_id === traitId && currentTraitCount >= breakpoint.breakpoint_value;
        });
        if (activeBreakpoint) {
          activeBreakpointIds.push(activeBreakpoint.breakpoint_id);
        };
      };
      for (const breakpointId of activeBreakpointIds) {
        await sql`
          INSERT INTO game_trait_breakpoints (game_id, breakpoint_id)
          VALUES (${gameId}, ${breakpointId})
        `;
      }
      console.log(`Inserted ${activeBreakpointIds.length} rows into game_trait_breakpoints for game ${gameId}`);

      // commit if all successful
      await sql`COMMIT`
      console.log('COMMIT transaction successful');

    } catch (transactionError) {
      // transaction failed
      console.error('Error DURING transaction, attempting rollback:', transactionError);
      try {
        await sql`ROLLBACK`;
        console.log('ROLLBACK successful');
      } catch (rollbackError) {
        console.error('FATAL: Failed to rollback transaction:', rollbackError);
      }
      throw transactionError;
    }

    // transaction succeeded
    res.status(201).json({
      game_id: gameId,
      message: 'Game and all associated data added successfully!'
    });

  } catch (error) {
    // error from BEGIN, COMMIT, or re-thrown transaction
    console.error('Error adding game:', error);
    res.status(500).json({ error: 'Failed to add game' });
  }
});

export default router;