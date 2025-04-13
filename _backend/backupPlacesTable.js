import { getAllPlaces } from './lib/db.js'
import { saveObjectToFile } from './lib/fileIO.js'
import { Place } from './lib/Place.js'

async function run() {
  const { rows, fields, rowCount } = await getAllPlaces('1 second')
  console.log(`${rowCount} rows read from database.`)

  const places = []
  for (const row of rows) {
    const place = new Place(row)
    console.log(place.street, place.city, place.state, place.zip, place.country)
    places.push(place)
  }

  saveObjectToFile('sushi_places_bk.json', places)
}

run()
