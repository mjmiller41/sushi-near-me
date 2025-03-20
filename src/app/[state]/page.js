import { query } from "@/lib/db";
import StateClient from "./StateClient";
import { usStatesAndTerritories } from "@/lib/constants";

export async function generateStaticParams() {
  console.log("Generating static params for states");
  // const states = await query(
  //   `SELECT DISTINCT state FROM sushi_restaurants
  //   WHERE state IS NOT NULL ORDER BY state`
  // );
  return usStatesAndTerritories.map((state) => ({ state }));
}

export default async function StatePage({ params }) {
  const { state } = await params;
  const cities = await query(
    `SELECT DISTINCT city FROM sushi_restaurants
    WHERE state = $1 AND city IS NOT NULL`,
    [state]
  );

  return <StateClient state={state} cities={cities} />;
}
