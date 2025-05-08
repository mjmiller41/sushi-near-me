import DB from './lib/db.js'
import { readObjectFromFile } from './lib/fileIO.js'
import { Place } from './lib/Place.js'

async function run() {
  const db = new DB()
  const filePlaces = await readObjectFromFile('_places_bk.json')
  console.log(`${filePlaces.length} places read from file.`)

  let upsertCount = 0
  for (const place of filePlaces) {
    try {
      await db.upsertPlace(new Place(place))
      upsertCount++
    } catch (error) {
      console.error(error)
      continue
    }
  }

  console.log(`${upsertCount} of ${filePlaces.length} file places upserted`)
  db.end()
}

run()
