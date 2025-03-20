import { query } from "./src/lib/db";
import { create } from "xmlbuilder";
import fs from "fs";

async function getLastMod(state, city = "") {
  let lastmod = "";
  if (city) {
    lastmod = await query(
      `SELECT MAX(updated_at) as lastmod FROM sushi_restaurants
      WHERE state = $1 AND city = $2`,
      [state, city]
    )[0].lastmod;
  } else {
    lastmod = await query(
      `SELECT MAX(updated_at) as lastmod FROM sushi_restaurants
      WHERE state = $1`,
      [state]
    )[0].lastmod;
  }
  return lastmod;
}

async function generateSitemaps() {
  const states = await query(
    `SELECT DISTINCT state FROM sushi_restaurants 
    WHERE state IS NOT NULL ORDER BY state`
  );
  const statePages = states.map(async ({ state }) => {
    const lastmod = await getLastMod(state);
    return {
      url: `/${state.toLowerCase().replace(/ /g, "-")}`,
      lastmod: lastmod,
    };
  });
  const cityPages = await query(
    `SELECT DISTINCT state, city FROM sushi_restaurants
    WHERE city IS NOT NULL AND state IS NOT NULL ORDER BY state, city`
  );
  const cityURLs = cityPages.map(async ({ state, city }) => {
    const lastmod = await getLastMod(state, city);
    return {
      url: `/${state.toLowerCase().replace(/ /g, "-")}/${city
        .toLowerCase()
        .replace(/ /g, "-")}`,
      lastmod: lastmod,
    };
  });
  const restaurantPages = await query(
    `SELECT id, name, state, city, updated_at FROM sushi_restaurants
    WHERE state IS NOT NULL AND city IS NOT NULL AND name IS NOT NULL`
  );
  const restaurantURLs = restaurantPages.map(
    ({ state, city, name, updated_at }) => ({
      url: `/${state.toLowerCase().replace(/ /g, "-")}/${city
        .toLowerCase()
        .replace(/ /g, "-")}/${slugify(name)}`,
      lastmod: updated_at,
    })
  );
  const allURLs = [
    {
      url: "/",
      lastmod: (
        await query(`SELECT MAX(updated_at) as lastmod FROM sushi_restaurants`)
      )[0].lastmod,
    },
    ...statePages,
    ...cityURLs,
    ...restaurantURLs,
  ];

  const sitemaps = create("urlset", { version: "1.0", encoding: "UTF-8" })
    .att("xsi", "http://www.w3.org/2001/XMLSchema-instance")
    .att(
      "xsi:noNamespaceSchemaLocation",
      "https://www.sitemaps.org/schemas/sitemap/0.9"
    );

  for (const { url, lastmod } of allURLs) {
    sitemaps.ele("url").ele("loc", url).up().ele("lastmod", lastmod).up();
  }

  const sitemapsXML = sitemaps.end({ pretty: true });
  fs.writeFile("public/sitemaps.xml", sitemapsXML, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("sitemaps.xml generated successfully.");
    }
  });
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

generateSitemaps();
