const { Client } = require('pg');
const dns = require('dns');

const host = 'ep-curly-glade-aqvg6r5k.c-8.us-east-1.aws.neon.tech';
const password = 'npg_D6XLFivleG4o';

async function run() {
  console.log(`Resolving ${host} specifically for IPv4...`);

  dns.resolve4(host, async (err, addresses) => {
    if (err) {
      console.error('DNS Resolve error:', err);
      return;
    }

    const ip = addresses[0];
    console.log(`Resolved to IPv4: ${ip}`);

    // We use the IP but we MUST set the 'servername' for SNI to work with Neon
    const client = new Client({
      user: 'neondb_owner',
      host: ip,
      database: 'neondb',
      password: password,
      port: 5432,
      ssl: {
        rejectUnauthorized: false,
        servername: host // This is CRUCIAL for SNI when using an IP
      },
    });

    try {
      await client.connect();
      console.log('✅ Success via IPv4 + SNI!');
      await client.end();
    } catch (connErr) {
      console.log(`❌ Failed: ${connErr.message}`);
    }
  });
}

run();
