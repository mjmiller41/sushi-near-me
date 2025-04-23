import {
  getAllPlaceIds,
  getZipCoordinates,
  updateSearchHistory,
  upsertPlacesApiSkuData
} from './lib/db.js'
import { getCurrentSkuData, logSkuReport, Sku, SKU_CATEGORIES } from './lib/Sku.js'
import { config } from './lib/config.js'
import { placesTextSearch } from './lib/google.js'
import { Place } from './lib/Place.js'
import { updatePlacesDb } from './updatePlacesDb.js'

async function run() {
  const currentSkuData = await getCurrentSkuData()
  const textSearchSku = currentSkuData.filter(sku => sku.sku === '635D-A9DD-C520')[0]
  console.log(`${currentSkuData.length} Skus retrieved from db.`)

  const { rows, rowCount } = await getZipCoordinates('0')
  console.log(`Processing ${rowCount} unique coordinates`)

  // // Get place IDs by zip code
  let foundIds = []
  for (const { latitude, longitude, zip_codes } of rows.slice(40, 41)) {
    const ids = await placesTextSearch(latitude, longitude, config.searchRadius)
      .then(res => {
        textSearchSku.increment(res.requestCount)
        return res.foundIds
      })
      .catch(error => console.error(error))

    const uniqueZips = [...new Set(zip_codes)]
    await updateSearchHistory(latitude, longitude, uniqueZips)

    foundIds = foundIds.concat([...new Set(ids)])
  }

  const uniqueIds = [...new Set(foundIds)]
  console.log(`${uniqueIds.length} unique place IDs found.`)

  const existingPlaceIds = await getAllPlaceIds()
  const newPlaceIds = uniqueIds.filter(id => !existingPlaceIds.includes(id))
  console.log(`${newPlaceIds.length} new place IDs found`)

  const newPlaces = []
  for (const id of newPlaceIds) {
    const place = new Place({ place_id: id, update_category: SKU_CATEGORIES.ID_ONLY })
    newPlaces.push(place)
  }

  const updatedCount = await updatePlacesDb(newPlaces)
  await upsertPlacesApiSkuData(currentSkuData)
  // await logSummary(currentSkuData)
  console.log('Done!')
}

run().catch(console.error)
