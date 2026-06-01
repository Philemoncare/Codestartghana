const { Client } = require('pg');
const tls = require('tls');

const url = 'postgresql://neondb_owner:npg_D6XLFivleG4o@ep-curly-glade-aqvg6r5k-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function run() {
  console.log('Testing with explicit TLS version...');
  const client = new Client({
    connectionString: url,
    ssl: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
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
