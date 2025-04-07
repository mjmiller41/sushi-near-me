import { convert, revert } from 'url-slug'
import { MONTH_MAP } from './constants.js'

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

export { extractId, dedupeArray, timestamp, slugify, deslugify, getCurrMthYr }
