const { Client } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_D6XLFivleG4o@ep-curly-glade-aqvg6r5k-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const email = 'favmoms440@gmail.com';
    const res = await client.query('SELECT password_hash FROM registrations WHERE email = $1', [email]);

    if (res.rowCount > 0) {
      const hash = res.rows[0].password_hash;
      console.log(`Password hash for ${email}:`, hash ? hash.substring(0, 10) + '...' : 'NULL');
    }
  } catch (err) {
    console.error('Check failed:', err);
  } finally {
    await client.end();
  }
}

run();
