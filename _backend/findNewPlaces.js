import DB from './lib/db.js'
import { SkuData, SKU_CATEGORIES, SKU_FUNCS, Sku } from './lib/Sku.js'
import { config } from './lib/config.js'
import { textSearchByLatLng } from './lib/google.js'
import { Place } from './lib/Place.js'
// import { updatePlacesDb } from './updatePlacesDb.js'
import { calcSurroundingCoords } from './lib/utils.js'

async function run() {
  const db = new DB()
  const radius = config.searchRadius

  const skuData = await SkuData.init()
  const currentSkuData = skuData.skuObjs
  console.log(`${currentSkuData.length} Skus initialized.`)

  const textSearchSku = currentSkuData.filter(sku => {
    return sku.func === SKU_FUNCS.TEXT_SEARCH && sku.category === SKU_CATEGORIES.ID_ONLY
  })[0]
  const { rows, rowCount } = await db.getZipCoordinates('1 day')
  console.log(`Processing ${rowCount} unique coordinates`)

  // // Get place IDs by lat/lng
  let row = 0
  for (let { latitude, longitude, zip_codes } of rows) {
    console.log(`Processing lat/lng for row ${++row} of ${rowCount}`)
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
      await db.upsertPlace(place)
    }
    await db.upsertPlacesApiSkuData(currentSkuData)
  }

  console.log('Done!')
}

run().catch(console.error)
