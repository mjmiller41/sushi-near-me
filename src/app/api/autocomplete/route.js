import { query } from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return new Response(JSON.stringify([]), { status: 200 });
  }

  try {
    // Search for matches in name, city, and state (case-insensitive)
    const results = await query(
      `SELECT name, city, state FROM sushi_restaurants 
       WHERE (name ILIKE $1 AND city IS NOT NULL AND state IS NOT NULL) 
       LIMIT 5`, // Limit to 5 results for performance
      [`%${q}%`]
    );

    // Format results to match what the frontend expects
    const formattedResults = results.map((row) => ({
      name: row.name,
      city: row.city,
      state: row.state,
    }));

    return new Response(JSON.stringify(formattedResults), { status: 200 });
  } catch (error) {
    console.error("Autocomplete error:", error);
    return new Response(JSON.stringify([]), { status: 500 });
  }
}
