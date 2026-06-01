const { Client } = require('pg');

const url = 'postgresql://neondb_owner:npg_D6XLFivleG4o@ep-curly-glade-aqvg6r5k-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&options=project%3Dep-curly-glade-aqvg6r5k';

async function run() {
  console.log('Testing with project option in connection string...');
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
