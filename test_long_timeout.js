const { Client } = require('pg');

const url = 'postgresql://neondb_owner:npg_D6XLFivleG4o@ep-curly-glade-aqvg6r5k-pooler.c-8.us-east-1.aws.neon.tech/neondb';

async function run() {
  console.log('Testing with 30s timeout and no SSL config in JS...');
  const client = new Client({
    connectionString: url,
    connectionTimeoutMillis: 30000,
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
