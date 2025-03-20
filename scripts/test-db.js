const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "gmap-search-db.chsm6wwis875.us-east-1.rds.amazonaws.com",
  database: "postgres",
  password: "GAP5dK2qTbzanPV",
  port: 5432,
  ssl: { rejectUnauthorized: false },
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("Connected successfully!");
    await client.query("SELECT NOW()");
    client.release();
  } catch (err) {
    console.error("Connection error:", err);
  } finally {
    pool.end();
  }
}

testConnection();
