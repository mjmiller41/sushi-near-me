import DB from './lib/db.js'
import { saveObjectToFile } from './lib/fileIO.js'
import { Place } from './lib/Place.js'

async function run() {
  const db = new DB()
  const { rows, rowCount } = await db.getAllPlaces('0')
  console.log(`${rowCount} rows read from database.`)

  const places = []
  for (const row of rows) {
    const place = new Place(row)
    places.push(place)
    if (place.place_id === 'ChIJHUxVSvlPwokRL9WISyRYubA') {
      console.log(`ChIJHUxVSvlPwokRL9WISyRYubA - index=${places.indexOf(place)}`)
    }
  }
  // saveObjectToFile('_places_bk.json', places)
  db.end()
}

run()
