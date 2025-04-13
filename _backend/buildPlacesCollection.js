import fs from 'fs/promises'
import path from 'path'
import { getAllPlaces } from './lib/db.js'
import { saveObjectToFile, writeTextToFile } from './lib/fileIO.js'
import { Place } from './lib/Place.js'
import { cleanDir, objToYaml, slugify } from './lib/utils.js'
import { STATES } from './lib/constants.js'

const __dirname = import.meta.dirname

async function writeState(stateName, stateAbbr) {
  const stateText = `---
layout: state
title: ${stateName} cities with Sushi Restaurants
permalink: /${slugify(stateName)}/
stateAbbr: ${stateAbbr}
stateName: ${stateName}
place_type: Sushi Restaurant
---`
  const statePath = path.join(__dirname, `../_states/`)
  const filename = `${slugify(stateName)}.md`
  await writeTextToFile(statePath, filename, stateText)
}

async function writeCity(stateName, stateAbbr, city) {
  const cityText = `---
layout: city
title: ${city}, ${stateAbbr} Sushi Restaurants
permalink: /${slugify(stateName)}/${slugify(city)}/
stateAbbr: ${stateAbbr}
stateName: ${stateName}
cityName: ${city}
---`
  const cityPath = path.join(__dirname, `../_cities/`)
  const filename = `${slugify(city)}-${slugify(stateAbbr)}.md`
  await writeTextToFile(cityPath, filename, cityText)
}

async function writePlace(stateName, stateAbbr, city, place) {
  const placeText = `---
layout: place
title: "${place.name.replaceAll('"', '')}"
permalink: /${slugify(stateName)}/${slugify(city)}/${slugify(place.name)}.html
stateAbbr: ${stateAbbr}
stateName: ${stateName}
cityName: ${city}
${objToYaml(place, 0)}
---`
  const placePath = path.join(__dirname, `../_places/`)
  const filename = `${slugify(place.name)}-${slugify(city)}-${slugify(stateAbbr)}.md`
  await writeTextToFile(placePath, filename, placeText)
}

async function run() {
  const { rows, rowCount } = await getAllPlaces('1 second')
  console.log(`${rowCount} rows read from database.`)

  await cleanDir(path.join(__dirname, '../_states/**'))
  await cleanDir(path.join(__dirname, '../_cities/**'))
  await cleanDir(path.join(__dirname, '../_places/**'))

  const prevStates = []
  const prevCities = []
  let stateCount = 0
  let cityCount = 0
  let placeCount = 0
  for (const row of rows) {
    const place = new Place(row)
    // if (place.state !== 'DC') continue
    if (!place.state || !place.city) continue
    const stateAbbr = place.state
    const stateName = STATES[stateAbbr]
    const city = place.city
    const name = place.name

    if (stateAbbr && stateName && !prevStates.includes(place.state)) {
      prevStates.push(place.state)
      await writeState(stateName, stateAbbr)
      stateCount++
    }

    const cityStr = `${city}, ${stateAbbr}`
    if (city && !prevCities.includes(cityStr)) {
      prevCities.push(cityStr)
      await writeCity(stateName, stateAbbr, city)
      cityCount++
    }

    await writePlace(stateName, stateAbbr, city, place)
    placeCount++
  }
  console.log(`${stateCount} state files written to disk.`)
  console.log(`${cityCount} city files written to disk.`)
  console.log(`${placeCount} place files written to disk.`)
}

run()
