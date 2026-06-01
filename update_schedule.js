const { Client } = require('pg');

const url = 'postgresql://neondb_owner:npg_D6XLFivleG4o@ep-curly-glade-aqvg6r5k.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function run() {
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    // Update cohort_start_date setting
    await client.query(`
      INSERT INTO settings (key, value, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
    `, ['cohort_start_date', '2026-06-20T10:00:00Z']);

    console.log('✅ Updated cohort_start_date to 2026-06-20T10:00:00Z');

    await client.end();
  } catch (err) {
    console.error('Update failed:', err.message);
  }
}

run();
