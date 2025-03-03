import { query } from "@/lib/db";
import { getFullStateName } from "@/lib/utils";
import Link from "next/link";

export default async function Home() {
  const states = await query(
    `SELECT DISTINCT state FROM sushi_restaurants
    WHERE state IS NOT NULL ORDER BY state`
  );

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-6 ">Welcome to Sushi Near Me</h1>
      <p className="mb-4 ">Explore sushi restaurants across the U.S.</p>
      {states.length > 0 ? (
        <div className="grid grid-cols-2 space-y-4">
          {states.map((state, index) => (
            <div key={state.state + index}>
              <Link
                href={`/${state.state}`}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {getFullStateName(state.state)}
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="">No states with sushi restaurants found.</p>
      )}
    </div>
  );
}
