const { Client } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_D6XLFivleG4o@ep-curly-glade-aqvg6r5k-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const email = 'favmoms440@gmail.com';
    const res = await client.query('SELECT * FROM registrations WHERE email = $1', [email]);

    if (res.rowCount === 0) {
      console.log('User not found');
    } else {
      const user = res.rows[0];
      console.log('User Details:');
      console.log('Email:', user.email);
      console.log('Status:', user.status);
      console.log('Password Hash Length:', user.password_hash ? user.password_hash.length : 'NULL');
      console.log('Password Hash Start:', user.password_hash ? user.password_hash.substring(0, 10) : 'NULL');
    }
  } catch (err) {
    console.error('Inspect failed:', err);
  } finally {
    await client.end();
  }
}

run();
