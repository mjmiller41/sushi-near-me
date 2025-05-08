import DB from './lib/db.js'
import { saveObjectToFile } from './lib/fileIO.js'
import { Place } from './lib/Place.js'

function isPlainObject(obj) {
  return typeof obj === 'object' && obj !== null && obj.constructor === Object
}

async function run() {
  const db = new DB()
  const { rows, rowCount } = await db.getAllPlaces('0')
  console.log(`${rowCount} rows read from database.`)

  const places = []
  let push = false
  for (const row of rows) {
    const place = new Place(row)
    if (
      !place.generative_disclosure &&
      !place.review_summary &&
      !place.review_disclosure
    ) {
      continue
    }

    let genDisc, revSumm, revDisc
    try {
      genDisc = JSON.parse(place.generative_disclosure)
      if (isPlainObject(genDisc) && genDisc?.text) {
        place.generative_disclosure = genDisc.text
        push = true
        console.log('Generative disclosure fixed for place with ID:', place.place_id)
      }
    } catch (error) {
      console.error(
        `Error parsing JSON for place with ID ${place.place_id}:`,
        error.message
      )
    }

    try {
      revSumm = JSON.parse(place.review_summary)
      if (isPlainObject(revSumm) && revSumm?.text) {
        place.review_summary = revSumm.text
        push = true
        console.log('Review summary fixed for place with ID:', place.place_id)
      }
    } catch (error) {
      console.error(
        `Error parsing JSON for place with ID ${place.place_id}:`,
        error.message
      )
    }

    try {
      revDisc = JSON.parse(place.review_disclosure)
      if (isPlainObject(revDisc) && revDisc?.text) {
        place.review_disclosure = revDisc.text
        push = true
        console.log('Review disclosure fixed for place with ID:', place.place_id)
      }
    } catch (error) {
      console.error(
        `Error parsing JSON for place with ID ${place.place_id}:`,
        error.message
      )
    }
    if (push) places.push(place)
  }
  for (const place of places) {
    await db.upsertPlace(place)
  }
  console.log(
    `${places.length} places updated in database from ${rowCount} total rows.`
  )

  db.end()
}

run()
