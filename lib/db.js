import pkg from "pg";
const { Pool } = pkg;
import "dotenv/config";

const pool = new Pool(
  {
    user: "postgres",
    host: "localhost",
    database: "postgres",
    password: process.env.RDS_PASSWORD,
    port: 5432,
  }
  //   {
  //   user: process.env.RDS_USER,
  //   host: process.env.RDS_HOST,
  //   database: process.env.RDS_DATABASE,
  //   password: process.env.RDS_PASSWORD,
  //   port: 5432,
  //   ssl: {
  //     rejectUnauthorized: false, // For testing; in production, use a valid certificate
  //   },
  // }
);

export async function query(sql, params) {
  const client = await pool.connect();
  let result;
  try {
    result = await client.query(sql, params);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Database update error:", err);
    throw err;
  } finally {
    await client.end();
  }
  return result.rows;
}
