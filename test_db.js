const { Client } = require('pg');

const urls = [
  'postgresql://neondb_owner:npg_D6XLFivleG4o@ep-curly-glade-aqvg6r5k-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require',
  'postgresql://neondb_owner:npg_D6XLFivleG4o@ep-curly-glade-aqvg6r5k.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require',
  'postgresql://neondb_owner:npg_D6XLFivleG4o@ep-curly-glade-aqvg6r5k.us-east-1.aws.neon.tech/neondb?sslmode=require'
];

async function testConnection(url) {
  console.log(`\nTesting connection to: ${url}`);
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully!');
    const res = await client.query('SELECT current_database(), current_user');
    console.log('Result:', res.rows[0]);
    await client.end();
    return true;
  } catch (err) {
    console.error('❌ Connection failed!');
    console.error('Error:', err.message);
    return false;
  }
}

async function run() {
  for (const url of urls) {
    const success = await testConnection(url);
    if (success) {
      console.log('\nSUCCESS: Use this URL in your .env.local');
      process.exit(0);
    }
  }
  console.log('\nALL CONNECTIONS FAILED. This usually means:');
  console.log('1. Your IP is not allowed in Neon (Settings > IP Allowlist)');
  console.log('2. The password or username is incorrect');
  console.log('3. Your network/firewall is blocking outbound connections to port 5432');
}

run();
