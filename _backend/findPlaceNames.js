import DB from './lib/db.js'
import { SKU_CATEGORIES, SKU_FUNCS, SkuData } from './lib/Sku.js'
import { Place } from './lib/Place.js'
import { textSearchByAddr } from './lib/google.js'
import { registerShutdown } from './lib/utils.js'
import { config } from './lib/config.js'
import { log } from './lib/logger.js'

const db = new DB()
async function run() {
  const testMode = config.testMode
  const saveDataCbs = []
  registerShutdown(saveDataCbs)
  let places = []
  try {
    ;({ rows: places } = await db.getAllPlaces('0'))
  } catch (error) {
    console.error('Error fetching places from database:', error)
    throw error
  }
  console.log(`Using database places data with ${places.length} entries.`)
  const skuData = await SkuData.create()
  console.log(`Using database skuData with ${skuData.skuObjs.length} entries.`)

  // Data and CBs for unexpected shutdown event
  saveDataCbs.push({ data: skuData, cb: skuData.save })
  saveDataCbs.push({ places, cb: Place.savePlacesData })

  const textSearchProSku = skuData.skuObjs
    .filter(sku => sku.func === SKU_FUNCS.TEXT_SEARCH)
    .find(sku => sku.category === SKU_CATEGORIES.PRO)
  console.log(`Found textSearchProSku: ${textSearchProSku ? 'Yes' : 'No'}`)

  places = places.filter(place => place.name === null || place.name === undefined)
  console.log(`Filtered places to ${places.length} entries without names.`)

  for (let place of places) {
    try {
      const { place_id: id, address, latitude: lat, longitude: lng } = place
      const fields = textSearchProSku.fields
      let newPlace = {}
      let requestCount = 0
      if (!testMode) {
        const res = await textSearchByAddr(address, lat, lng, fields)
        if (!res || !res.place) {
          console.log(`No places found for address: ${address}`)
          continue
        }
        newPlace = new Place(res.place)
        requestCount = res.requestCount
      }
      console.log(`Request count for place_id ${id}: ${requestCount}`)
      textSearchProSku.increment(requestCount)

      if (newPlace && newPlace.name) {
        place.name = newPlace.name
        for (const key in place) {
          if (!place[key] && newPlace[key]) {
            place[key] = newPlace[key]
          }
        }
        console.log(`Updated name for place_id ${id}: ${place.name}`)
        log('places.log', JSON.stringify(place, null, 2))
        if (!testMode) await db.upsertPlace(place)
      } else {
        console.log(`No name found for place_id ${id}`)
      }
    } catch (error) {
      console.error(`Error processing place_id ${place.place_id}:`, error)
    }
  }
  if (!testMode) skuData.save()
}

run()
  .then(() => {
    console.log('Update completed successfully.')
    db.end()
    process.exit(0)
  })
  .catch(error => {
    console.error('Error during findPlaceNames:', error)
    process.exit(1)
  })
