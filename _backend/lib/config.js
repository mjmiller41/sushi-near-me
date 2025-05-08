import 'dotenv/config'

const devMode =
  process.env.NODE_ENV !== 'production' || process.env.JEKYLL_ENV !== 'production'
const placesLimit = devMode ? 5 : +Infinity
const config = {
  googleApiKey: process.env.GOOGLE_API_KEY,
  openAiApiKey: process.env.OPENAI_API_KEY,
  devMode,
  limitPlaces: devMode ?? true,
  placesLimit: parseInt(placesLimit) ?? 5,
  costLimit: parseInt(process.env.COST_LIMIT) ?? 0,
  searchRadius: parseInt(process.env.SEARCH_RADIUS) ?? 5000,
  updateInterval: process.env.UPDATE_INTERVAL ?? '6 months',
  testMode: process.argv.includes('--test') || process.env.TEST === 'true'
}

console.log(`DevMode: ${config.devMode}`)

export { config }
