import fs from 'fs/promises'
import { convert, revert } from 'url-slug'
import yaml, { JSON_SCHEMA } from 'js-yaml'
import { glob } from 'glob'
import { MONTH_MAP } from './constants.js'

const ONGOING_TASKS = []
const __dirname = import.meta.dirname
const dictionary = {
  '&': 'and',
  '@': 'at',
  '#': 'number',
  '%': 'percent',
  '+': 'plus',
  '’': '', // For possessives or contractions (e.g., "Bob’s")
  '!': '',
  é: 'e', // Common in cuisine-related names
  ñ: 'n', // For Spanish-influenced names
  '(': '', // For parenthetical info
  ')': '',
  '.': 'dot' // For abbreviations or stylized names
}

String.prototype.truncate = function (num) {
  if (this.length <= num) {
    return this
  } else {
    return this.slice(0, num - 3) + '...'
  }
}

function slugify(name) {
  if (!name || typeof name !== 'string') return ''
  return convert(name.toLowerCase())
}

function deslugify(slug) {
  if (!slug || typeof slug !== 'string') return ''
  return revert(slug.trim())
}

function registerShutdown(saveDataCbs) {
  process.on('SIGINT', () => {
    console.log('Received SIGINT. Shutting down gracefully...')
    shutdown(saveDataCbs)
  })

  process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Shutting down gracefully...')
    shutdown(saveDataCbs)
  })

  process.on('beforeExit', async () => {
    console.log('Process is about to exit. Shutting down gracefully...')
    const unsavedPlacesCb = saveDataCbs.find(el => el.unsavedPlaces?.length > 0)
    if (unsavedPlacesCb) {
      console.log('Unsaved places detected. Saving before exit...')
      try {
        // Convert object to JSON string with indentation
        const jsonString = JSON.stringify(unsavedPlacesCb.unsavedPlaces, null, 2)
        const filepath = 'unsavedPlaces.json'
        await fs.writeFile(filepath, jsonString)
        console.log(`unsavedPlaces saved to ${filepath}`)
      } catch (error) {
        console.error(`Error saving object to ${filePath}:`, error)
      }

      // await fileIO.wr //unsavedPlacesCb.cb(unsavedPlacesCb.unsavedPlaces)
    }
    process.exit(0)
  })
}

async function shutdown(saveDataCbs) {
  try {
    // upsert data before exit
    if (Array.isArray(saveDataCbs) || saveDataCbs.length > 0) {
      await saveDataCbs.forEach(async ({ data, cb }) => await cb(data))
    }

    // Exit the process
    console.log('Process exited gracefully.')
    process.exit(0)
  } catch (err) {
    console.error('Error during shutdown:', err)
    process.exit(1) // Exit with an error code
  }
}

function instancesEqualExcluding(obj1, obj2, excludedProperty) {
  for (const prop in obj1) {
    if (Object.hasOwn(obj1, prop) && prop !== excludedProperty) {
      if (!Object.hasOwn(obj2, prop) || obj1[prop] !== obj2[prop]) {
        return false
      }
    }
  }
  for (const prop in obj2) {
    if (Object.hasOwn(obj2, prop) && prop !== excludedProperty) {
      if (!Object.hasOwn(obj1, prop)) {
        return false
      }
    }
  }
  return true
}

async function cleanDir(dir) {
  try {
    const pathnames = await glob(dir)
    for (const pathname of pathnames) {
      await fs.rm(pathname, { recursive: true, force: true })
    }
    console.log(`Cleaned directory ${dir}`)
  } catch (error) {
    console.error(`Error removing files: ${error}`)
  }
}

function objToYaml(object, globalIndent = 2) {
  function rplcr(key, value) {
    if (typeof value === 'string' && value.includes(':')) {
      return `"${value}"`
    }
    return value
  }
  const yamlString = yaml.dump(object)
  const spaces = globalIndent > 0 ? ' '.repeat(globalIndent) : ''
  const indentedYaml = yamlString
    .split('\n')
    .map(line => {
      return line ? spaces + line : line
    })
    .join('\n')
  return indentedYaml
}

function getCurrMthYr() {
  const month = MONTH_MAP[new Date().getMonth()]
  const year = new Date().getFullYear()
  return `${month}_${year}`
}

function extractId(str, type) {
  const types = ['reviews', 'photos', 'places']
  if (!types.some(item => str.includes(item))) return null
  const regStr = `.*${type}\/([^\/]*)\/*.*`
  const regexp = new RegExp(regStr, 'g')
  const array = [...str.matchAll(regexp)]
  return array[0]?.[1] ?? null
}

function dedupeArray(arr, key) {
  const seen = new Set()
  return arr.filter(obj => {
    const keyValue = obj[key]
    return seen.has(keyValue) ? false : (seen.add(keyValue), true)
  })
}

function timestamp() {
  const ts = Date.now()
  const date = new Date(ts)
  let isoDate = date.toISOString()
  return isoDate.replace('T', ' ').replace('Z', '')
}

// Function to calculate surrounding lat/long coordinates for a given center and radius
function calcSurroundingCoords(latitude, longitude, radius) {
  // Earth's radius in meters
  const EARTH_RADIUS = 6371000

  // Convert radius to radians (angular distance)
  const radiusInRadians = radius / EARTH_RADIUS

  // Distance to surrounding points (approx sqrt(3) * radius for hexagonal packing)
  const distance = 1.732 * radius
  const distanceInRadians = distance / EARTH_RADIUS

  // Array to store new coordinates
  const surroundingCoords = []

  // Calculate 6 surrounding points (hexagonal arrangement at 0°, 60°, 120°, 180°, 240°, 300°)
  for (let i = 0; i < 6; i++) {
    const bearing = (i * 60 * Math.PI) / 180 // Convert degrees to radians

    // Calculate new latitude
    const newLat =
      (Math.asin(
        Math.sin((latitude * Math.PI) / 180) * Math.cos(distanceInRadians) +
          Math.cos((latitude * Math.PI) / 180) *
            Math.sin(distanceInRadians) *
            Math.cos(bearing)
      ) *
        180) /
      Math.PI

    // Calculate new longitude
    const newLon =
      longitude +
      (Math.atan2(
        Math.sin(bearing) *
          Math.sin(distanceInRadians) *
          Math.cos((latitude * Math.PI) / 180),
        Math.cos(distanceInRadians) -
          Math.sin((latitude * Math.PI) / 180) * Math.sin((newLat * Math.PI) / 180)
      ) *
        180) /
        Math.PI

    surroundingCoords.push({ latitude: newLat, longitude: newLon })
  }

  return surroundingCoords
}

export {
  ONGOING_TASKS,
  extractId,
  dedupeArray,
  timestamp,
  slugify,
  deslugify,
  getCurrMthYr,
  objToYaml,
  cleanDir,
  instancesEqualExcluding,
  registerShutdown,
  shutdown,
  calcSurroundingCoords
}
