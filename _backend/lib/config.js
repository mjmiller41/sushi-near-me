import 'dotenv/config'

const devMode =
  process.argv.includes('--dev_mode') || process.env.NODE_ENV === 'development'
    ? true
    : false
const placesLimit = process.env.npm_config_limit ?? process.env.PLACES_LIMIT
const updateInterval = devMode ? '1 second' : process.env.UPDATE_INTERVAL
const config = {
  googleApiKey: process.env.GOOGLE_API_KEY,
  db: {
    host: process.env.RDS_ENDPOINT,
    database: process.env.RDS_DATABASE,
    user: process.env.RDS_USER,
    password: process.env.RDS_PASSWORD,
    port: 5432
  },
  devMode,
  limitPlaces: process.argv.includes('--limit') ?? false,
  placesLimit: parseInt(placesLimit) ?? 1000,
  costLimit: parseInt(process.env.costLimit) ?? 190,
  searchRadius: parseInt(process.env.SEARCH_RADIUS) ?? 10000,
  updateInterval: updateInterval ?? '6 months'
}

console.log(`DevMode: ${config.devMode}`)

export { config }
