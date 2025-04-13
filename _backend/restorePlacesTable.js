import { upsertPlace, initSushiRestaurantsTable } from './lib/db.js'
import { readObjectFromFile } from './lib/fileIO.js'
import { Place } from './lib/Place.js'

async function run() {
  const filePlaces = await readObjectFromFile('sushi_places_bk.json')
  console.log(`${filePlaces.length} places read from file.`)

  await initSushiRestaurantsTable()
  let upsertCount = 0
  for (const place of filePlaces) {
    try {
      await upsertPlace(new Place(place))
      upsertCount++
    } catch (error) {
      console.error(error)
      continue
    }
  }

  console.log(`${upsertCount} of ${filePlaces.length} file places upserted`)
}

run()
