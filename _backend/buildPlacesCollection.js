import path from 'path'
import DB from './lib/db.js'
import { writeTextToFile } from './lib/fileIO.js'
import { Place } from './lib/Place.js'
import { cleanDir, objToYaml, slugify } from './lib/utils.js'
import { STATES } from './lib/constants.js'
import { readYamlFile } from './lib/fileIO.js'
import './lib/config.js'

const site = await readYamlFile('_config.yml')
const __dirname = import.meta.dirname
const db = new DB()

async function writeState(stateName, stateAbbr) {
  const yamlObj = {
    layout: 'state',
    title: `${stateName} cities with ${site.place_type}s`,
    permalink: `/${slugify(stateName)}/`,
    stateAbbr: stateAbbr,
    stateName: stateName
  }
  const stateText = `---\n${objToYaml(yamlObj, 0)}\n---`
  const statePath = path.join(__dirname, `../_states/`)
  const filename = `${slugify(stateName)}.md`
  await writeTextToFile(statePath, filename, stateText)
}

async function writeCity(stateName, stateAbbr, city) {
  const yamlObj = {
    layout: 'city',
    title: `${city}, ${stateAbbr} ${site.place_type}s`,
    permalink: `/${slugify(stateName)}/${slugify(city)}/`,
    stateAbbr: stateAbbr,
    stateName: stateName,
    cityName: city
  }
  const cityText = `---\n${objToYaml(yamlObj, 0)}\n---`
  const cityPath = path.join(__dirname, `../_cities/`)
  const filename = `${slugify(city)}-${slugify(stateAbbr)}.md`
  await writeTextToFile(cityPath, filename, cityText)
}

async function writePlace(stateName, stateAbbr, city, place) {
  place.places_description = place.description
  place.description = place.generative_summary
  const permalink = `/${slugify(stateName)}/${slugify(city)}/${slugify(place.name)}.html`
  let yamlObj = {
    layout: 'place',
    title: place.name,
    permalink: permalink,
    stateAbbr: stateAbbr,
    stateName: stateName,
    cityName: city,
    seo: { type: 'restaurant', links: place.website }
  }
  yamlObj = { ...yamlObj, ...place }

  const placeText = `---\n${objToYaml(yamlObj, 0)}\n---`
  const placePath = path.join(__dirname, `../_places/`)
  const filename = `${slugify(place.name)}-${slugify(city)}-${slugify(stateAbbr)}.md`
  await writeTextToFile(placePath, filename, placeText)
}

async function run() {
  const { rows } = await db.getAllPlaces()
  console.log(`${rows.length} rows read from database.`)

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
    if (place.country != 'USA' || !place.state || !place.city || !place.name) continue
    const stateAbbr = place.state
    const stateName = STATES[stateAbbr]
    const city = place.city

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

  db.end()
}

run()
