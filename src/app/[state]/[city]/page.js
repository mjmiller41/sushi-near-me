import { query } from "@/lib/db";
import { deslugify } from "@/lib/utils";
import CityClient from "./CityClient";

export async function generateStaticParams() {
  const result = await query(
    `SELECT DISTINCT state, city FROM sushi_restaurants
    WHERE city IS NOT NULL AND state IS NOT NULL
    ORDER BY state, city`
  );
  return result.map(({ state, city }) => ({
    state,
    city,
  }));
}

export default async function CityPage({ params: params }) {
  // const params = await _params;
  let { state, city } = await params;
  city = deslugify(city);
  const restaurants = await query(
    `SELECT * FROM sushi_restaurants
    WHERE state = $1 AND city = $2`,
    [state, city]
  );
  return <CityClient state={state} city={city} restaurants={restaurants} />;
}
