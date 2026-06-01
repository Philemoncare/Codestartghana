const { Client } = require('pg');

const host = 'ep-curly-glade-aqvg6r5k.c-8.us-east-1.aws.neon.tech';
const password = 'npg_D6XLFivleG4o';

async function run() {
  console.log(`Testing Direct connection to ${host}...`);
  const client = new Client({
    user: 'neondb_owner',
    host: host,
    database: 'neondb',
    password: password,
    port: 5432,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Success!');
    const res = await client.query('SELECT current_database()');
    console.log('DB:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.log(`❌ Failed: ${err.message}`);
  }
}

run();
