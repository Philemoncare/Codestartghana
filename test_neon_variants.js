const { Client } = require('pg');

const hosts = [
  'ep-curly-glade-aqvg6r5k-pooler.c-8.us-east-1.aws.neon.tech',
  'ep-curly-glade-aqvg6r5k.c-8.us-east-1.aws.neon.tech',
  'ep-curly-glade-aqvg6r5k-pooler.us-east-1.aws.neon.tech',
  'ep-curly-glade-aqvg6r5k.us-east-1.aws.neon.tech',
  'ep-curly-glade-aqvg6r5k-pooler.c-8.us-east-1.neon.tech',
  'ep-curly-glade-aqvg6r5k.c-8.us-east-1.neon.tech'
];

async function testHost(host) {
  console.log(`\n--- Testing host: ${host} ---`);
  const client = new Client({
    user: 'neondb_owner',
    host: host,
    database: 'neondb',
    password: 'npg_D6XLFivleG4o',
    port: 5432,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
    console.log('✅ SUCCESS!');
    await client.end();
    return true;
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    return false;
  }
}

async function run() {
  for (const host of hosts) {
    if (await testHost(host)) {
      console.log(`\nFOUND WORKING HOST: ${host}`);
      process.exit(0);
    }
  }
}

run();
