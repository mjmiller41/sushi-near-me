"use client";
import { StateContext } from "@/components/StateContext";
import { getFullStateName, slugify } from "@/lib/utils";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import { Link } from "@mui/material";
import { useContext, useEffect } from "react";

export default function CityClient({ state, city, restaurants }) {
  const setState = useContext(StateContext);

  useEffect(() => {
    setState(state);
  }, [state, setState]);

  return (
    <Box component={"div"}>
      <Link href={state !== "DC" ? `/${state}` : `/`}>
        <Typography variant="backLink">
          &lt; Back to {state !== "DC" ? getFullStateName(state) : "Home"}
        </Typography>
      </Link>
      <Typography variant="h2" textAlign={"center"}>
        Restaurants with Sushi in
      </Typography>
      <Typography variant="h1" textAlign={"center"}>
        {city}, {state}
      </Typography>
      {restaurants.length > 0 ? (
        <List>
          {restaurants.map((rest) => (
            <ListItem key={rest.id}>
              <Card raised={true}>
                <Link
                  href={`/${state}/${slugify(city)}/${rest.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <CardHeader
                    title={rest.name}
                    subheader={
                      <Stack direction={"row"} spacing={1}>
                        <Rating
                          value={rest.rating}
                          precision={0.1}
                          getLabelText={(value) => `${value || 0} Stars`}
                          size="small"
                          readOnly
                        />
                        <Stack direction={"row"} spacing={1}>
                          <Typography variant="body2">{rest.rating}</Typography>
                          <Typography fontSize={"0.8rem"} fontWeight={100}>
                            ({rest.ratings_count} reviews)
                          </Typography>
                        </Stack>
                      </Stack>
                    }
                  />
                </Link>
                <CardContent>
                  <Typography variant="h3" fontSize={"0.9rem"}>
                    {rest.neighborhood || ""} {rest.housenumber}{" "}
                    {rest.street || rest.street_short || rest.street_long}
                  </Typography>
                </CardContent>
              </Card>
            </ListItem>
          ))}
        </List>
      ) : (
        <p>No restaurants found in this city.</p>
      )}
    </Box>
  );
}
`
place.id, // $2: Google Place ID for place_id
place.neighborhood,
place.housenumber,
place.streetShort,
place.streetLong,
place.city,
place.state,
place.postcode,
place.country,
place.latitude,
place.longitude,
place.accessability_options || [], // Default to empty array if null
place.business_status,
place.name,
place.directions_link,
place.write_review_link,
place.google_maps_uri,
place.primary_type,
place.opening_hours || [],
place.secondary_opening_hours || [],
place.secondary_opening_hours_type,
place.phone,
place.price_level,
place.price_range,
place.rating,
place.ratings_count,
place.website,
place.allow_dogs,
place.curbside_pickup,
place.delivery,
place.dine_in,
place.summary,
place.good_for_children,
place.good_for_groups,
place.good_for_sports,
place.live_music,
place.menu_for_children,
place.parking_options || [],
place.payment_options || [],
place.outdoorSeating,
place.reservable,
place.restroom,
place.reviews || [],
place.serves_beer,
place.serves_breakfast,
place.serves_brunch,
place.serves_cocktails,
place.serves_coffee,
place.serves_dinner,
place.serves_dessert, // Fixed typo
place.serves_lunch,
place.serves_vegetarian_food,
place.serves_wine,
place.takesout,
place.generative_summary,
place.photos || [],
place.timestamp || new Date().toISOString(), // Default timestamp if missing`;
