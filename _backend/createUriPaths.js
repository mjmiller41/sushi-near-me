import fs from 'fs/promises'
import path from 'path'
import { glob } from 'glob'
import yaml from 'js-yaml'
import { slugify } from './lib/utils.js'
import { config } from './lib/config.js'

const __dirname = import.meta.dirname
const PLACE_TYPE = 'Sushi Restaurant'
const INCLUDES = path.join(__dirname, '../_includes')

const PLACES = JSON.parse(await fs.readFile('./_data/places.json'))
const STATES = JSON.parse(await fs.readFile('./_data/states.json'))

async function slugigyTest() {
  const placeNames = PLACES.map(place => {
    const name = place.name.replaceAll('"', "'")
    return `"${name}"`
  })
  const placeNameSlugs = PLACES.map(place => slugify(place.name))
  let slugifyTestTemplate = await fs.readFile(`${INCLUDES}/slugifyTest.md`, {
    encoding: 'utf8'
  })
  slugifyTestTemplate = slugifyTestTemplate
    .replace('js_names:', `js_names: [${placeNames.toString()}]`)
    .replace('js_name_slugs:', `js_name_slugs: [${placeNameSlugs.toString()}]`)
  await fs.writeFile('slugify-test.md', slugifyTestTemplate)
}

async function mkdir(dir) {
  const pathname = path.join(__dirname, `../_states/${dir.toLowerCase()}`)

  await fs.mkdir(pathname, { recursive: true }, err => {
    if (err) console.error(`Error creating directory ${pathname}`)
    else console.log(`Directory ${pathname} created.`)
  })

  return pathname
}

async function rmDir(dir) {
  try {
    const pathnames = await glob(
      path.join(__dirname, `../${dir.toLowerCase()}`)
    )
    for (const pathname of pathnames) {
      await fs.rm(pathname, { recursive: true, force: true })
    }
  } catch (error) {
    console.error(`Error removing files: ${error}`)
  }
}

function toYaml(object, globalIndent = 2) {
  const yamlString = yaml.dump(object, { sortKeys: true })
  const spaces = ' '.repeat(globalIndent)
  const indentedYaml = yamlString
    .split('\n')
    .map(line => {
      return line ? spaces + line : line
    })
    .join('\n')
  return indentedYaml
}

async function makeStateIndex(pathname, stateAbbr) {
  const stateName = STATES[stateAbbr]
  console.log(`stateName ${stateName}`)
  const frontMatter = `---
layout: state
title: ${stateName} cities with ${PLACE_TYPE}s
permalink: /${slugify(stateName)}/index.html
state: ${stateAbbr}
place_type: ${PLACE_TYPE}
---`
  await fs.writeFile(`${pathname}/index.html`, frontMatter)
}

async function makeCityIndex(pathname, stateAbbr, city) {
  const stateName = STATES[stateAbbr]
  const frontMatter = `---
layout: city
title: ${city}, ${stateAbbr} ${PLACE_TYPE}s
permalink: /${slugify(stateName)}/${slugify(city)}/index.html
state: ${stateAbbr}
city: ${city}
---`
  await fs.writeFile(`${pathname}/index.html`, frontMatter)
}

async function makePlacePage(pathname, place) {
  const city = place.city
  const state = place.state
  const stateName = STATES[state]
  const name = place.name
  const frontMatter = `---
layout: place
title: "${place.name.replaceAll('"', '')}"
permalink: /${slugify(stateName)}/${slugify(city)}/${slugify(name)}.html
state: ${state}
city: ${city}
place:\n${toYaml(place)}
---`
  await fs.writeFile(`${pathname}/${slugify(name)}.html`, frontMatter)
}

// Clean _states directory
await rmDir('_states/**')

for (const stateAbbr in STATES) {
  if (config.devMode && stateAbbr !== 'DC') continue

  console.log('Building places directory structure.')
  const stateName = STATES[stateAbbr]
  const pathname = await mkdir(`/${slugify(stateName)}`)
  await makeStateIndex(pathname, stateAbbr)

  const allCities = PLACES.filter(place => place.state === stateAbbr).map(
    place => place.city
  )
  const uniqCities = [...new Set(allCities)]
  for (const city of uniqCities) {
    const pathname = await mkdir(`${slugify(stateName)}/${slugify(city)}`)
    await makeCityIndex(pathname, stateAbbr, city)

    const cityPlaces = PLACES.filter(
      place => place.city === city && place.state === stateAbbr
    )
    for (const place of cityPlaces) {
      await makePlacePage(pathname, place)
    }
  }
}
