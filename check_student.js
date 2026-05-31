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
    const res = await client.query('SELECT id, full_name, email, password_hash, status FROM registrations WHERE email = $1', [email]);

    if (res.rowCount === 0) {
      console.log(`Student with email ${email} not found.`);
    } else {
      const student = res.rows[0];
      console.log('Student found:', {
        id: student.id,
        name: student.full_name,
        email: student.email,
        hasPassword: !!student.password_hash,
        status: student.status
      });
    }
  } catch (err) {
    console.error('Check failed:', err);
  } finally {
    await client.end();
  }
}

run();
