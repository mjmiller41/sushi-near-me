"use client";
import { slugify, getFullStateName } from "@/lib/utils";
import { Link } from "@mui/material";
import { Container, Grid2, Typography } from "@mui/material";
import { StateContext } from "@/components/StateContext";
import { useContext, useEffect } from "react";

export default function StateClient({ state, cities }) {
  const setState = useContext(StateContext);

  useEffect(() => {
    setState(state);
  }, [state, setState]);

  return (
    <Container sx={{ textAlign: "center" }}>
      <Link variant="backLink" href="/">
        &lt; Back to states.
      </Link>
      <Typography variant="h1" sx={{}}>
        Cities in {getFullStateName(state)}
      </Typography>
      <Typography variant="h2">with Sushi Restaurants</Typography>
      {cities.length > 0 ? (
        <Grid2 container rowSpacing={2} marginTop={"1rem"}>
          {cities.map((city, index) => (
            <Grid2
              size={4}
              key={state + city + index}
              sx={{ textAlign: "center", alignContent: "center" }}
            >
              <Link
                key={city.city + index}
                href={`/${state}/${slugify(city.city)}`}
              >
                {city.city}
              </Link>
            </Grid2>
          ))}
        </Grid2>
      ) : (
        <p>No sushi restaurants found in this state.</p>
      )}
    </Container>
  );
}
