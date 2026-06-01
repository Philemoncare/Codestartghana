const { Client } = require('pg');

const ip = '52.1.58.3';
const host = 'ep-curly-glade-aqvg6r5k.c-8.us-east-1.aws.neon.tech';
const password = 'npg_D6XLFivleG4o';

async function run() {
  console.log(`Testing connection to ${ip} with servername ${host}...`);

  const client = new Client({
    user: 'neondb_owner',
    host: ip,
    database: 'neondb',
    password: password,
    port: 5432,
    ssl: {
      rejectUnauthorized: false,
      servername: host
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
