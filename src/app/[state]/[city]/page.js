import { query } from "@/lib/db";
import { deslugify, slugify } from "@/lib/utils";
import Link from "next/link";

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

export default async function CityPage({ params: _params }) {
  const params = await _params;
  let { state, city } = params;
  city = deslugify(city);
  const restaurants = await query(
    `SELECT * FROM sushi_restaurants
    WHERE state = $1 AND city = $2`,
    [state, city]
  );

  // console.log("Restaurants:", restaurants);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 ">
        Restaurants in {city}, {state}
      </h1>
      <Link
        href={`/${state}`}
        className="text-blue-600 hover:text-blue-800 hover:underline mb-4 block"
      >
        Back to {state}
      </Link>
      {restaurants.length > 0 ? (
        <ul className="list-disc pl-6 space-y-2">
          {restaurants.map((restaurant, index) => (
            <li key={restaurant.id || restaurant.name + index}>
              <Link
                href={`/${state}/${slugify(city)}/${restaurant.slug}`}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {restaurant.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="">No restaurants found in this city.</p>
      )}
    </div>
  );
}
