"use client";
import { Container, Typography } from "@mui/material";
import { Link } from "@mui/material";
import { useContext, useEffect } from "react";
import { StateContext } from "@/components/StateContext";

export default function RestaurantClient({ city, state, restaurant }) {
  const setState = useContext(StateContext);

  useEffect(() => {
    setState(state);
  }, [state, setState]);

  if (!restaurant) {
    return (
      <Container component="div">
        <Link variant="backLink" href={`/${state}/${city}`}>
          &lt; Back to {city}
        </Link>
        <Typography variant="h2">Restaurant not found</Typography>
      </Container>
    );
  }

  return (
    <Container component="div">
      <Link variant="backLink" href={`/${state}/${city}`}>
        &lt; Back to {city}, {state}
      </Link>
      <h1>{restaurant?.name}</h1>
      <p>
        Address: {restaurant?.housenumber} {restaurant?.street},{" "}
        {restaurant?.city}, {restaurant?.state} {restaurant?.postcode}
      </p>
      {/* Add more details as needed, e.g., phone, website, opening hours */}
    </Container>
  );
}
