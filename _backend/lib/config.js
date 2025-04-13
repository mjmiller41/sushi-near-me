import fs from 'fs/promises'
import 'dotenv/config'

const devMode = process.env.NODE_ENV !== 'production' ?? false
const placesLimit = devMode ? 5 : +Infinity
const updateInterval = devMode ? '1 minute' : process.env.UPDATE_INTERVAL
const config = {
  googleApiKey: process.env.GOOGLE_API_KEY,
  // dbName: process.env.PROJECT_ID.replaceAll('-', '_') ?? 'postgres',
  // db: devMode
  //   ? { host: 'localHost', user: 'postgres', password: '', port: 5432 }
  //   : {
  //       host: process.env.PGHOST,
  //       user: process.env.PGUSER,
  //       password: process.env.PGPASSWORD,
  //       port: process.env.PORT,
  //       ssl: {
  //         rejectUnauthorized: true,
  //         ca: await fs.readFile('./rds-ca-bundle.pem', { encoding: 'utf8' })
  //       }
  //     },
  devMode,
  limitPlaces: devMode ?? true,
  placesLimit: parseInt(placesLimit) ?? 5,
  costLimit: parseInt(process.env.costLimit) ?? 190,
  searchRadius: parseInt(process.env.SEARCH_RADIUS) ?? 5000,
  updateInterval: updateInterval ?? '6 months'
}

console.log(`DevMode: ${config.devMode}`)

export { config }
