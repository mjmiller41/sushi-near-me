import { query } from "@/lib/db";
import { slugify, deslugify } from "@/lib/utils";
import Link from "next/link";

export async function generateStaticParams() {
  const restaurants = await query(
    `SELECT state, city, slug FROM sushi_restaurants
    WHERE state IS NOT NULL AND city IS NOT NULL AND slug IS NOT NULL`
  );
  return restaurants.map(({ state, city, slug }) => ({
    state,
    city: slugify(city),
    restaurant: slug,
  }));
}

export default async function RestaurantPage({ params: _params }) {
  const params = await _params;
  const { state, city, restaurant } = params;
  const restaurants = await query(
    `SELECT * FROM sushi_restaurants
    WHERE state = $1 AND city = $2 AND slug = $3`,
    [state, deslugify(city), restaurant]
  );
  const restaurantData = restaurants[0];

  // console.log("Restaurant Data:", restaurantData);

  return (
    <div>
      <Link
        href={`/${state}/${city}`}
        className="text-blue-600 hover:text-blue-800 hover:underline mb-4 block"
      >
        Back to {city}, {state}
      </Link>
      <h1 className="text-3xl font-bold mb-6 ">{restaurantData?.name}</h1>
      <p className="mb-4 ">
        Address: {restaurantData?.housenumber} {restaurantData?.street},{" "}
        {restaurantData?.city}, {restaurantData?.state}{" "}
        {restaurantData?.postcode}
      </p>
      {/* Add more details as needed, e.g., phone, website, opening hours */}
    </div>
  );
}
