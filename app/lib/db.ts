import { Pool, PoolConfig } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const poolConfig: PoolConfig = {
  connectionString,
  // Neon requires SSL. For serverless, we usually use rejectUnauthorized: false
  // or a specific CA cert, but Neon's default works with rejectUnauthorized: false.
  ssl: {
    rejectUnauthorized: false
  },
  // Optimize for serverless cold starts and connection limits
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
};

// Global pool instance to prevent multiple pools in development/serverless
let pool: Pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool(poolConfig);
} else {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!(global as any).pgPool) {
    (global as any).pgPool = new Pool(poolConfig);
  }
  pool = (global as any).pgPool;
}

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error: any) {
    console.error('DATABASE_QUERY_ERROR:', {
      text,
      error: error.message,
      code: error.code,
      stack: error.stack?.substring(0, 200)
    });

    if (error.message?.includes('timeout') || error.message?.includes('ECONNRESET')) {
       throw new Error('Database connection timed out. The Neon compute instance might be suspended or your IP is not allowed.');
    }

    throw error;
  }
};

export default pool;
