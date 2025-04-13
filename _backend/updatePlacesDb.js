import { getAllPlaces, upsertPlace, upsertPlacesApiSkuData } from './lib/db.js'
import { checkWithinCostLimit, getCurrentSkuData } from './lib/Sku.js'
import { Place } from './lib/Place.js'
import { config } from './lib/config.js'
import { getPlaceDetails } from './lib/google.js'
import { instancesEqualExcluding } from './lib/utils.js'

async function run() {
  const currentSkuData = await getCurrentSkuData()
  console.log(`Sku data retrieved from db.`)
  if (!checkWithinCostLimit(currentSkuData)) throw Error('Costs Exceeded')

  const places = []
  const { rows } = await getAllPlaces('1 second')
  if (rows) {
    iterRows: for (const row of rows) {
      try {
        const place = new Place(row)
        places.push(place)
      } catch (error) {
        console.error(error)
        continue iterRows
      }
    }
    console.log(
      `${rows.length} rows retrieved from db. ${places.length} usable.`
    )
  }

  let placeDetailsSkuData = currentSkuData.slice(2, -1)
  placeDetailsSkuData.sort((a, b) => a.cost_level - b.cost_level)

  console.log('\n', 'Sku request counts at start:')
  for (const sku of placeDetailsSkuData) {
    console.log('\t', sku.description, sku.request_count)
  }

  let activeSkus
  let currentSku
  iterPlaces: for (const place of places.slice(22)) {
    activeSkus = placeDetailsSkuData.filter(
      sku => sku.request_count < sku.usage_caps[0]
    )
    const fields = activeSkus.map(sku => sku.fields).join(',')
    currentSku = activeSkus.slice(-1)[0]

    try {
      const data = await getPlaceDetails(place.place_id, fields)
      currentSku.increment()
      console.log(
        `${currentSku.description}: request ${currentSku.request_count} of ${currentSku.usage_caps[0]}`
      )
      const newPlace = new Place(data)
      await upsertPlace(newPlace)
    } catch (error) {
      console.error(error)
      continue iterPlaces
    }
  }
  console.log(placeDetailsSkuData)
  await upsertPlacesApiSkuData(currentSkuData)
}

run().catch(console.error)
