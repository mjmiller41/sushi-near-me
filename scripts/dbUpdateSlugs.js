import { slugify } from "./src/lib/utils.js";
import { query } from "./src/lib/db.js";
import "dotenv/config";

// Migration function
async function migrateSlugs() {
  //   const pool = new pg.Pool(dbConfig);

  try {
    // Start a transaction
    await query("BEGIN");

    // Step 1: Add slug column if it doesn't exist
    console.log("Adding slug column...");
    await query(`
      ALTER TABLE sushi_restaurants 
      ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
    `);

    // Step 2: Fetch all restaurants with a name
    console.log("Fetching restaurants...");
    const restaurants = await query(`
      SELECT id, name 
      FROM sushi_restaurants 
      WHERE name IS NOT NULL AND name != '';
    `);
    console.log(restaurants);
    // Step 3: Generate and update slugs
    console.log(`Found ${restaurants.length} restaurants to process...`);
    for (const restaurant of restaurants) {
      const { id, name } = restaurant;
      const slug = slugify(name);

      // Check for slug uniqueness and append ID if necessary
      const existing = await query(
        `
        SELECT id 
        FROM sushi_restaurants 
        WHERE slug = $1 AND id != $2
      `,
        [slug, id]
      );
      const tag = id.slice(0, 8);
      let finalSlug = slug;
      if (existing.length > 0) {
        finalSlug = `${slug}-${tag}`; // Ensure uniqueness
      }

      // Update the record
      await query(
        `
        UPDATE sushi_restaurants 
        SET slug = $1 
        WHERE id = $2
      `,
        [finalSlug, id]
      );

      console.log(`Updated: ${name} -> ${finalSlug}`);
    }

    // Commit the transaction
    await query("COMMIT");
    console.log("Migration completed successfully!");
  } catch (error) {
    // Rollback on error
    await query("ROLLBACK");
    console.error("Migration failed:", error);
    throw error;
  } finally {
    // Close the pool
    await query("END");
  }
}

// Run the migration
migrateSlugs()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
