import DB from './lib/db.js'
import { getCurrentSkuData, SKU_CATEGORIES } from './lib/Sku.js'
import { config } from './lib/config.js'
import { textSearchByLatLng } from './lib/google.js'
import { Place } from './lib/Place.js'
import { updatePlacesDb } from './updatePlacesDb.js'
import { calcSurroundingCoords } from './lib/utils.js'

async function run() {
  const db = new DB()
  const radius = config.searchRadius

  const currentSkuData = await getCurrentSkuData()
  console.log(`${currentSkuData.length} Skus retrieved from db.`)

  const textSearchSku = currentSkuData.filter(sku => sku.sku === '635D-A9DD-C520')[0]

  const { rows, rowCount } = await db.getZipCoordinates('0')
  console.log(`Processing ${rowCount} unique coordinates`)

  // // Get place IDs by lat/lng
  for (let { latitude, longitude, zip_codes } of rows) {
    let ids = []
    let searchCount = 0
    let morePages = true
    while (morePages) {
      const foundIds = await textSearchByLatLng(latitude, longitude, radius)
        .then(response => {
          textSearchSku.increment(response.requestCount)
          searchCount++
          return response.foundIds
        })
        .catch(error => console.error(error))

      ids = ids.concat([...new Set(foundIds)])
      await db.updateSearchHistory(latitude, longitude, [...new Set(zip_codes)])

      // If ids returned maxed at 60 expand search
      const centerLat = latitude
      const centerLng = longitude
      let newCoords = []
      if (foundIds.length < 60 && searchCount === 1) {
        morePages = false
        continue
      } else newCoords = calcSurroundingCoords(centerLat, centerLng, radius)
      if (searchCount >= 1 && searchCount <= 6) {
        const i = searchCount - 1
        latitude = newCoords[i].latitude
        longitude = newCoords[i].longitude
      } else morePages = false
    }

    const uniqueIds = [...new Set(ids)]
    const existingPlaceIds = await db.getAllPlaceIds()
    const newPlaceIds = uniqueIds.filter(id => !existingPlaceIds.includes(id))
    console.log(`${uniqueIds.length} unique place IDs found.`)
    console.log(`${newPlaceIds.length} new place IDs found`)

    const newPlaces = []
    for (const id of newPlaceIds) {
      const place = new Place({ place_id: id, update_category: SKU_CATEGORIES.ID_ONLY })
      newPlaces.push(place)
    }
    await updatePlacesDb(newPlaces, currentSkuData)
    await db.upsertPlacesApiSkuData(currentSkuData)
  }

  console.log('Done!')
}

run().catch(console.error)
