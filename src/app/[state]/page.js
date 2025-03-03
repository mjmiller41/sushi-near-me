import { query } from "@/lib/db";
import { slugify, getFullStateName } from "@/lib/utils";
import Link from "next/link";

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
    <div>
      <h1 className="text-3xl font-bold mb-6 ">
        Restaurants in {getFullStateName(state)}
      </h1>
      {cities.length > 0 ? (
        <ul className="pl-6 space-y-2">
          {cities.map((city, index) => (
            <li key={city.city + index}>
              <Link
                href={`/${state}/${slugify(city.city)}`}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {city.city}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="">No sushi restaurants found in this state.</p>
      )}
    </div>
  );
}
