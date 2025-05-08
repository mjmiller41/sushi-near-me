import DB from './lib/db.js'

const fromDbConfig = {
  user: 'postgres',
  password: '',
  host: 'localhost',
  port: 5432,
  database: 'postgres'
}

async function run() {
  const fromDb = new DB(fromDbConfig) //await import(`./lib/db.js?config=1`)
  const result = await fromDb.getAllZipCodeData()
  console.log(`${result.rowCount} rows read from database.`)

  const toDb = new DB()
  await toDb.insertZipCodesData(result.rows)
  await toDb.initAllDb()

  fromDb.end()
  toDb.end()
}

run()
