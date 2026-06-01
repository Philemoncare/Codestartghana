const { Client } = require('pg');

const url = 'postgresql://neondb_owner:npg_D6XLFivleG4o@52.1.58.3/neondb?sslmode=require';

async function run() {
  console.log('Testing connection to IP 52.1.58.3...');
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Success!');
    await client.end();
  } catch (err) {
    console.log(`❌ Failed: ${err.message}`);
  }
}

run();
