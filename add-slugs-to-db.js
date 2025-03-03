require("dotenv").config(); // Load .env file
const { Pool } = require("pg");
const { convert } = require("url-slug");

const dictionary = {
  "&": "and",
};

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

async function addSlugColumn() {
  try {
    // Check if slug column exists, and add it if it doesn’t
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'sushi_restaurants' AND column_name = 'slug'
        ) THEN
          ALTER TABLE sushi_restaurants ADD COLUMN slug TEXT;
        END IF;
      END $$;
    `);
    console.log("Slug column checked/added successfully.");

    // Fetch all restaurant names to slugify
    const { rows } = await pool.query(
      `SELECT id, name FROM sushi_restaurants WHERE name IS NOT NULL`
    );
    console.log(`Found ${rows.length} restaurants to process.`);

    // Process each restaurant and update its slug
    for (const row of rows) {
      const slug = convert(row.name, { transformer: false, dictionary }); // Use url-slug to generate a slug
      await pool.query(`UPDATE sushi_restaurants SET slug = $1 WHERE id = $2`, [
        slug,
        row.id,
      ]);
      console.log(`Updated slug for restaurant ID ${row.id}: ${slug}`);
    }

    console.log("Slug generation and updates completed successfully.");
  } catch (error) {
    console.error("Error processing slugs:", error);
  } finally {
    await pool.end();
    console.log("Database connection closed.");
  }
}

addSlugColumn().catch(console.error);
