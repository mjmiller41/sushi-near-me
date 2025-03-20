import { query } from "@/lib/db";
import { getFullStateName } from "@/lib/utils";
import Link from "next/link";
import Grid2 from "@mui/material/Grid2";
import { Box, Container, Typography } from "@mui/material";

export default async function Home() {
  const states = await query(
    `SELECT DISTINCT state FROM sushi_restaurants
    WHERE state IS NOT NULL ORDER BY state`
  );
  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "2rem",
      }}
    >
      <Box>
        <Typography variant="h2">Welcome to</Typography>
        <Typography variant="h1">Sushi Near Me</Typography>
        <Typography variant="body1" marginTop={"1rem"}>
          Explore sushi restaurants across the U.S.
        </Typography>
      </Box>
      <Box>
        {states.length > 0 ? (
          <Grid2 id="states-grid" container rowSpacing={2}>
            {states.map((state, index) => {
              return (
                <Grid2
                  component={Link}
                  href={
                    state.state !== "DC"
                      ? `/${state.state}`
                      : `/${state.state}/Washington`
                  }
                  size={4}
                  key={state.state + index}
                  sx={{ textAlign: "center", alignContent: "center" }}
                >
                  {getFullStateName(state.state)}
                </Grid2>
              );
            })}
          </Grid2>
        ) : (
          <p className="">No states with sushi restaurants found.</p>
        )}
      </Box>
    </Container>
  );
}
