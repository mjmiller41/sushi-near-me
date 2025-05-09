import { curly } from 'node-libcurl'
import { config } from './config.js'
import { readYamlFile } from './fileIO.js'

const site = await readYamlFile('_config.yml')

function locationBias(lat, lng, radius = 1000) {
  if (lat && lng) {
    return {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: radius // Default radius of 0.5km
      }
    }
  }
  return null
}

async function getPlaces(queryFields, maskFields) {
  const endpoint = 'https://places.googleapis.com/v1/places:searchText'
  let npToken = ''
  let foundPlaces = []
  let requestCount = 0
  let nextPage = true
  maskFields += ',places.generativeSummary,places.reviewSummary'
  while (nextPage) {
    try {
      const nextPageToken = await curly
        .post(endpoint, {
          postFields: JSON.stringify({ ...queryFields, pageToken: npToken }),
          httpHeader: [
            'Content-Type: application/json',
            `X-Goog-Api-Key: ${config.googleApiKey}`,
            `X-Goog-FieldMask: ${maskFields}`
          ]
        })
        .then(response => {
          const res = response.data
          if (res.error) throw res.error
          foundPlaces = foundPlaces.concat(res.places)
          requestCount++
          return res.nextPageToken
        })
        .catch(error => {
          console.error(JSON.stringify(error, null, 2))
          console.error(JSON.stringify(queryFields, null, 2))
        })

      if (nextPageToken) npToken = nextPageToken
      else nextPage = false
    } catch (error) {
      console.error(`Error fetching places: ${error.message}`)
    }
  }
  return { foundPlaces, requestCount }
}

async function textSearchByAddr(address, lat, lng, maskFields) {
  if (Array.isArray(maskFields)) maskFields = maskFields.join(',')
  try {
    let textQuery = address
    let includedType = 'restaurant'
    let strictTypeFiltering = false
    let rankPreference = 'DISTANCE' // RELEVANCE or DISTANCE
    let radius = 1000 // Default radius of 1km
    let location_bias = lat && lng ? locationBias(lat, lng, radius) : ''
    let queryFields = {
      textQuery,
      includedType,
      strictTypeFiltering,
      rankPreference,
      location_bias
    }
    let searching = true
    let foundPlaces, place, requestCount
    let totalRequests = 0
    let radIncrement = 2 // Increment radius by 100% each iteration
    while (searching) {
      console.log(`Searching for query:\n${JSON.stringify(queryFields, null, 2)}`)
      ;({ foundPlaces, requestCount } = await getPlaces(queryFields, maskFields))
      totalRequests += requestCount
      if (foundPlaces.length === 0) {
        radius = radius * radIncrement // Increase search radius by radIncrement
        queryFields.location_bias = locationBias(lat, lng, radius)
      } else if (foundPlaces[0].types.includes('street_address')) {
        lat = foundPlaces[0].location.latitude
        lng = foundPlaces[0].location.longitude
        queryFields.textQuery = site.place_type
        queryFields.location_bias = locationBias(lat, lng, radius)
      } else if (foundPlaces.length > 0) {
        for (const foundPlace of foundPlaces) {
          if ((address = foundPlace.formattedAddress)) {
            place = foundPlace
            searching = false
            break
          }
        }
        if (!place && searching) {
          radius = radius * radIncrement // Increase search radius by radIncrement
          queryFields.location_bias = locationBias(lat, lng, radius)
        }
      }
      if (radius > 10000) {
        console.log(`Search radius exceeded 10km, stopping search.`)
        searching = false
      }
    }
    return { place, requestCount: totalRequests }
  } catch (error) {
    console.error(`Error searching for address: ${error.message}`)
  }
}

async function textSearchByLatLng(
  lat,
  lng,
  radius,
  textQuery = site.place_type,
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
          `X-Goog-FieldMask: places.id,nextPageToken`
        ]
      })
      .then(response => response.data)
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
    console.log(`Req: ${requestCount}, nextPageToken: ${nextPageToken !== undefined}`)
    if (nextPageToken) {
      npToken = nextPageToken
    } else {
      nextPage = false
    }

    requestCount++
  }
  console.log(`${foundIds.length} IDs found for lat:${lat} lng:${lng}`)
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
        `X-Goog-FieldMask: ${fields},generativeSummary,reviewSummary`
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

export { textSearchByAddr, textSearchByLatLng, getPlaceDetails }
