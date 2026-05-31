const { Client } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_D6XLFivleG4o@ep-curly-glade-aqvg6r5k-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query('SELECT email, password_hash FROM registrations WHERE password_hash IS NULL');
    console.log('Registrations with NULL password_hash:', res.rows.length);
    res.rows.forEach(r => console.log('- ', r.email));
  } catch (err) {
    console.error('Check failed:', err);
  } finally {
    await client.end();
  }
}

run();
