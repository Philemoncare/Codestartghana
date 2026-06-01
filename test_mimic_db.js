const { Pool } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_D6XLFivleG4o@ep-curly-glade-aqvg6r5k-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require';

const poolConfig = {
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 60000,
};

async function run() {
  console.log('Testing with mimic configuration...');
  const pool = new Pool(poolConfig);
  try {
    const res = await pool.query('SELECT current_database(), current_user');
    console.log('✅ Success!', res.rows[0]);
  } catch (err) {
    console.log(`❌ Failed: ${err.message}`);
    if (err.stack) console.log(err.stack);
  } finally {
    await pool.end();
  }
}

run();
