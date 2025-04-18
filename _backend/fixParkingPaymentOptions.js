import { getAllPlaces, upsertPlace } from './lib/db.js'
import { Place } from './lib/Place.js'
import { PARKING_OPTIONS, PAYMENT_OPTIONS } from './lib/enums.js'

const parkingOptions = Object.freeze({
  freeParkingLot: null,
  paidParkingLot: null,
  freeStreetParking: null,
  paidStreetParking: null,
  valetParking: null,
  freeGarageParking: null,
  paidGarageParking: null
})

async function run() {
  let upsertCount = 0
  const { rows, rowCount } = await getAllPlaces('1 second')
  console.log(`${rowCount} rows read from database.`)

  const places = rows.map(row => new Place(row))

  for (let i = 0; i < places.length; i++) {
    if (!places[i].parking_options && !places[i].payment_options) continue
    let { parking_options, payment_options } = places[i]
    const newParkingOptions = {}
    const newPaymentOptions = {}

    if (Array.isArray(parking_options)) {
      // console.log(places[i].parking_options)
      parking_options = parking_options.forEach(option => {
        if (Object.hasOwn(PARKING_OPTIONS, option)) {
          newParkingOptions[PARKING_OPTIONS[option]] = true
        }
      })
      places[i].parking_options = newParkingOptions
      // console.log(places[i].parking_options)
    }

    if (Array.isArray(payment_options)) {
      // console.log(places[i].payment_options)
      payment_options = payment_options.forEach(option => {
        if (Object.hasOwn(PAYMENT_OPTIONS, option)) {
          newPaymentOptions[PAYMENT_OPTIONS[option]] = true
        }
      })
      places[i].payment_options = newPaymentOptions
      // console.log(places[i].payment_options)
      // console.log(places[i])
      // console.log('**********************************', '\n')
    }
    try {
      await upsertPlace(places[i])
      upsertCount++
    } catch (error) {
      console.error(error)
    }
  }

  console.log(`${upsertCount} of ${places.length} file places upserted`)
}

run()
