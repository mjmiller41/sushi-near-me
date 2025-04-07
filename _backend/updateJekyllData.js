import { getAllPlaces } from './lib/db.js'
import { saveObjectToFile } from './lib/fileIO.js'
import { Place } from './lib/Place.js'

async function run() {
  const { rows, rowCount } = await getAllPlaces()
  console.log(`${rowCount} rows read from database.`)

  const places = []
  for (const row of rows) {
    const place = new Place(row)
    places.push(place)
  }

  saveObjectToFile('_data/places.json', places)
}

run()
