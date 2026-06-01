const { Client } = require('pg');

const url = 'postgresql://neondb_owner:WRONG_PASS@ep-curly-glade-aqvg6r5k-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function run() {
  console.log('Testing with definitely wrong password...');
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Success?!');
    await client.end();
  } catch (err) {
    console.log(`❌ Failed: ${err.message}`);
  }
}

run();
