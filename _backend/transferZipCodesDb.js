import {
  cloneTable,
  getAllZipCodeData,
  initZipCodesTable,
  insertZipCodesData
} from './lib/db.js'
import { saveObjectToFile } from './lib/fileIO.js'
import { Place } from './lib/Place.js'

async function run() {
  const result = await getAllZipCodeData('1 second', 'rds-pool')
  console.log(`${result.rowCount} rows read from database.`)

  await insertZipCodesData(result.rows)
}

run()
