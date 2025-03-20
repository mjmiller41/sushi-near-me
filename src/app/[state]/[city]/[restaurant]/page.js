import { query } from "@/lib/db";
import { slugify, deslugify } from "@/lib/utils";
import { Container, Typography } from "@mui/material";
import { Metadata } from "next";
import { Link } from "@mui/material";
import RestaurantClient from "./RestaurantClient";

export async function generateMetadata({ params }) {
  const { restaurant } = await params;

  const rows = await query(
    `SELECT name, city, state FROM sushi_restaurants
    WHERE name IS NOT NULL AND city IS NOT NULL AND state IS NOT NULL AND slug = $1`,
    [restaurant]
  );
  return {
    title: `${rows[0].name} - Sushi in ${rows[0].city}, ${rows[0].state}`,
  };
}

export async function generateStaticParams() {
  const restaurants = await query(
    `SELECT state, city, slug FROM sushi_restaurants
    WHERE state IS NOT NULL AND city IS NOT NULL AND slug IS NOT NULL`
  );
  return restaurants.map(({ state, city, slug }) => {
    return { state, city: slugify(city), restaurant: slug };
  });
}

export default async function RestaurantPage({ params: _params }) {
  const params = await _params;
  const { state, city, restaurant } = params;
  console.log(params);
  const restaurants = await query(
    `SELECT * FROM sushi_restaurants
    WHERE state = $1 AND city = $2 AND slug = $3`,
    [state, deslugify(city), restaurant]
  );
  const restaurantData = restaurants[0];

  return (
    <RestaurantClient state={state} city={city} restaurant={restaurantData} />
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
