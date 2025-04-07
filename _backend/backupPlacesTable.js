const { getAllPlaces } = require("./lib/db");
const { saveObjectToFile } = require("./lib/fileIO");
const { Place } = require("./lib/Place");

async function run() {
  const { rows, fields, rowCount } = await getAllPlaces();
  console.log(`${rowCount} rows read from database.`);

  const places = [];
  for (const row of rows) {
    const place = new Place(row);
    places.push(place);
  }

  saveObjectToFile("sushi_places_bk.json", places);
}

run();
