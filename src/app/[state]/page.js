import { query } from "@/lib/db";
import { slugify, getFullStateName } from "@/lib/utils";
import { USMap } from "@/components/usMap";
import Link from "next/link";
import { Container, Grid2 } from "@mui/material";

export async function generateStaticParams() {
  console.log("Generating static params for states");
  const states = await query(
    `SELECT DISTINCT state FROM sushi_restaurants
    WHERE state IS NOT NULL ORDER BY state`
  );
  return states.map(({ state }) => ({ state }));
}

export default async function StatePage({ params: _params }) {
  const params = await _params;
  const { state } = params;
  const cities = await query(
    `SELECT DISTINCT city FROM sushi_restaurants
    WHERE state = $1 AND city IS NOT NULL`,
    [state]
  );

  return (
    <Container sx={{ textAlign: "center" }}>
      <USMap />
      <h1>Restaurants in {getFullStateName(state)}</h1>
      {cities.length > 0 ? (
        <Grid2 container rowSpacing={2}>
          {cities.map((city, index) => (
            <Grid2
              size={4}
              key={state + city + index}
              sx={{ textAlign: "center" }}
            >
              <Link
                key={city.city + index}
                href={`/${state}/${slugify(city.city)}`}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {city.city}
              </Link>
            </Grid2>
          ))}
        </Grid2>
      ) : (
        <p className="">No sushi restaurants found in this state.</p>
      )}
    </Container>
  );
}
