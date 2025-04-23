import { curly } from 'node-libcurl'
import { config } from './config.js'
import { DEFAULT_PLACES_API_SKU_DATA } from './Sku.js'

async function placesTextSearch(
  lat,
  lng,
  radius,
  textQuery = 'sushi',
  includedType = 'restaurant'
) {
  // Include location bias in query if radius, lat, lng given
  const locationBias =
    radius && lat && lng
      ? { circle: { center: { latitude: lat, longitude: lng }, radius: radius } }
      : null
  const postFields = { textQuery, includedType, strictTypeFiltering: true }
  if (locationBias) postFields['locationBias'] = locationBias
  const endpoint = 'https://places.googleapis.com/v1/places:searchText'
  let npToken = ''
  let foundIds = []
  let requestCount = 0
  let nextPage = true
  while (nextPage) {
    let { places, nextPageToken, error } = await curly
      .post(endpoint, {
        postFields: JSON.stringify({ ...postFields, pageToken: npToken }),
        httpHeader: [
          'Content-Type: application/json',
          `X-Goog-Api-Key: ${config.googleApiKey}`,
          `X-Goog-FieldMask: places.id`
        ]
      })
      .then(response => {
        requestCount++
        if (response.data.nextPageToken) console.log('*'.repeat(1000))
        return response.data
      })
      .catch(error => {
        console.error(JSON.stringify(error, null, 2))
        console.error(JSON.stringify(postFields, null, 2))
      })

    if (error) {
      console.error(JSON.stringify(error, null, 2))
    }

    if (places && places.length > 0) {
      const ids = places.map(place => place.id)
      foundIds = foundIds.concat(ids)
    }
    nextPage = nextPageToken ? true : false
    npToken = nextPageToken
  }
  return { foundIds, requestCount }
}

async function getPlaceDetails(placeId, fields) {
  const endpoint = `https://places.googleapis.com/v1/places/${placeId}`

  console.log(`Requesting Place Details for places ID:${placeId}`)
  const response = await curly
    .get(endpoint, {
      httpHeader: [
        'Content-Type: application/json',
        `X-Goog-Api-Key: ${config.googleApiKey}`,
        `X-Goog-FieldMask: ${fields}`
      ]
    })
    .then(response => {
      return response
    })
    .catch(error => {
      console.error(JSON.stringify(error, null, 2))
      throw Error(error)
    })
  if (response.error) {
    console.error(JSON.stringify(error, null, 2))
    throw Error(error)
  }
  return response.data
}

export { placesTextSearch, getPlaceDetails }
