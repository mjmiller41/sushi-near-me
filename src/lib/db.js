import pkg from "pg";
const { Pool } = pkg;
import "dotenv/config";

const pool = new Pool({
  user: process.env.RDS_USER,
  host: process.env.RDS_HOST,
  database: process.env.RDS_DATABASE,
  password: process.env.RDS_PASSWORD,
  port: 5432,
  ssl: {
    rejectUnauthorized: false, // For testing; in production, use a valid certificate
  },
});

export async function query(sql, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}
