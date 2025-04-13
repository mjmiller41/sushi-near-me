import fs from 'fs/promises'
import path from 'path'
import { STATES } from './lib/constants.js'
import { glob } from 'glob'
import yaml from 'js-yaml'
import { slugify } from './lib/utils.js'
import { config } from './lib/config.js'

const __dirname = import.meta.dirname

let mapText = await fs.readFile(
  path.join(__dirname, '../_includes/us-map.svg'),
  { encoding: 'utf8' }
)

for (const key in STATES) {
  console.log(key, STATES[key])
  mapText = mapText.replaceAll(
    `"/${key.toLowerCase()}"`,
    `"/${slugify(STATES[key].toLowerCase())}"`
  )
  mapText = mapText.replaceAll(
    `"${key.toLowerCase()}"`,
    `"${slugify(STATES[key].toLowerCase())}"`
  )
}
await fs.writeFile(path.join(__dirname, '../_includes/new-us-map.svg'), mapText)
