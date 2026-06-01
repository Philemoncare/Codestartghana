const { Client } = require('pg');

const url = 'postgresql://neondb_owner:npg_D6XLFivleG4o@ep-curly-glade-aqvg6r5k-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function test(config, label) {
  console.log(`\nTesting: ${label}`);
  const client = new Client(config);
  try {
    await client.connect();
    console.log('✅ Success!');
    await client.end();
    return true;
  } catch (err) {
    console.log(`❌ Failed: ${err.message}`);
    return false;
  }
}

async function run() {
  await test({ connectionString: url }, 'ConnectionString only (with sslmode=require)');
  await test({ connectionString: url, ssl: true }, 'ConnectionString + ssl: true');
  await test({ connectionString: url, ssl: { rejectUnauthorized: false } }, 'ConnectionString + ssl: { rejectUnauthorized: false }');
  await test({ connectionString: url.split('?')[0], ssl: { rejectUnauthorized: false } }, 'No sslmode in string + ssl: { rejectUnauthorized: false }');
}

run();
