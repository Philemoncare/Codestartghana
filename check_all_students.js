const { Client } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_D6XLFivleG4o@ep-curly-glade-aqvg6r5k-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query('SELECT id, email, full_name, status, created_at FROM registrations ORDER BY created_at DESC LIMIT 20');
    console.table(res.rows);
  } catch (err) {
    console.error('Check failed:', err);
  } finally {
    await client.end();
  }
}

run();
