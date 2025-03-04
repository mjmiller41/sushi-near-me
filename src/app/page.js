import { query } from "@/lib/db";
import { getFullStateName } from "@/lib/utils";
import { USMap } from "@/components/usMap";
import Link from "next/link";
import Grid2 from "@mui/material/Grid2";
import { Container } from "@mui/material";

export default async function Home() {
  const states = await query(
    `SELECT DISTINCT state FROM sushi_restaurants
    WHERE state IS NOT NULL ORDER BY state`
  );

  return (
    <Container>
      <USMap />
      <Container
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <h1 className="text-3xl font-bold mb-6 ">Welcome to Sushi Near Me</h1>
        <p className="mb-4 ">Explore sushi restaurants across the U.S.</p>
        {states.length > 0 ? (
          <Grid2 container rowSpacing={2}>
            {states.map((state, index) => (
              <Grid2
                size={4}
                key={state.state + index}
                sx={{ textAlign: "center" }}
              >
                <Link href={`/${state.state}`}>
                  {getFullStateName(state.state)}
                </Link>
              </Grid2>
            ))}
          </Grid2>
        ) : (
          <p className="">No states with sushi restaurants found.</p>
        )}
      </Container>
    </Container>
  );
}
