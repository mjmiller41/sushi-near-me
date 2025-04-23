import { fileURLToPath } from 'node:url'
import * as db from './lib/db.js'
import {
  filterActiveSkus,
  filterUpdateSkus,
  getCurrentSkuData,
  SKU_FUNCS,
  Sku
} from './lib/Sku.js'
import { Place } from './lib/Place.js'
import { getPlaceDetails } from './lib/google.js'
import { registerShutdown } from './lib/utils.js'

const saveDataCbs = []
async function updatePlacesDb(_places) {
  registerShutdown(saveDataCbs)
  const places = _places ?? (await db.getAllPlaces('0', 'IS NULL', 'DESC'))
  const currentSkuData = await getCurrentSkuData()
  Place.validatePlaces(places)

  // Data and CBs for shutdown event
  saveDataCbs.push({ data: currentSkuData, cb: Sku.saveCurrentSkuData })

  const placeDetailsSkus = currentSkuData
    .filter(sku => sku.func === SKU_FUNCS.PLACE_DETAILS)
    .sort((a, b) => a.cost_level - b.cost_level)

  let upsertCount = 0
  for (let place of places) {
    // Skus with free requests available
    const activeSkus = filterActiveSkus(placeDetailsSkus)
    const updateSkus = filterUpdateSkus(place.update_category, activeSkus)
    if (!updateSkus) continue

    const currentSku = updateSkus.at(-1)
    const fields = updateSkus.map(sku => sku.fields).join(',')
    const id = place.place_id
    console.log(
      `Updating ${place.place_id} from ${place.update_category} to ${currentSku.category}`
    )
    try {
      const data = await getPlaceDetails(id, fields)
      currentSku.increment()
      data.update_category = currentSku.category
      console.log(`${currentSku.description}:
        request ${currentSku.request_count} of ${currentSku.usage_caps[0]}`)
      const newPlace = new Place(data)
      upsertCount += await db.upsertPlace(newPlace)
    } catch (error) {
      console.error(error)
    }
  }
  console.log(`${upsertCount} place(s) upserted.`)
  await db.upsertPlacesApiSkuData(currentSkuData)
}

// Determine if cli or module execution
if (import.meta.url.startsWith('file:')) {
  const modulePath = fileURLToPath(import.meta.url)
  if (process.argv[1] === modulePath) {
    // The module was executed directly from the command line
    await updatePlacesDb()
    db.end()
  } else {
    // The module was imported by another module
    console.log('Module is not running as main')
  }
}

export { updatePlacesDb }
