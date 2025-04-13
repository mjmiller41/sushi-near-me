import path from 'path'
import fs from 'fs/promises'
import { convert, revert } from 'url-slug'
import yaml from 'js-yaml'
import { glob } from 'glob'
import { MONTH_MAP } from './constants.js'

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

function slugify(name) {
  if (!name || typeof name !== 'string') return ''
  return convert(name.toLowerCase())
}

function deslugify(slug) {
  if (!slug || typeof slug !== 'string') return ''
  return revert(slug.trim())
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

export {
  extractId,
  dedupeArray,
  timestamp,
  slugify,
  deslugify,
  getCurrMthYr,
  objToYaml,
  cleanDir,
  instancesEqualExcluding
}
