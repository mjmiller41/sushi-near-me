import fs from 'fs/promises'
import path from 'path'
import pg from 'pg'
import { getCurrMthYr } from './utils.js'
import { config } from './config.js'
const { Pool, Client } = pg

const __dirname = import.meta.dirname
const pemFile = path.join(__dirname, './rds-ca-bundle.pem')
const devMode = config.devMode

const rdsConfig = {
  user: 'postgres',
  password: 'GAP5dK2qTbzanPV',
  host: 'gmap-search-db.chsm6wwis875.us-east-1.rds.amazonaws.com',
  port: 5432,
  ssl: {
    rejectUnauthorized: true,
    ca: await fs.readFile(pemFile, { encoding: 'utf8' })
  }
}

export default class DB {
  constructor(cfg) {
    this.pool = new Pool(cfg)
    this.pool.on('connect', this.checkDbExists)
  }

  async checkDbExists(client) {
    const databaseName = process.env.PGDATABASE
    // Check if the database exists
    await client.query(
      `SELECT 1 FROM pg_database WHERE datname = '${databaseName}';`,
      async (err, result) => {
        if (err) {
          console.error('Error checking if database exists:', err)
          // client.release() // Release the connection
          return
        }
        if (result.rows.length === 0) {
          // Database doesn't exist, so create it
          await client.query(`CREATE DATABASE "${databaseName}";`, createErr => {
            if (createErr) {
              console.error('Error creating database:', createErr)
            } else {
              console.log(`Database "${databaseName}" created successfully.`)
            }
            // client.release() // Release the connection
          })
        } else {
          // Database exists
          // console.log(`Database "${databaseName}" already exists.`)
          // client.release() // Release the connection
        }
      }
    )
  }

  async query(text, values) {
    let response
    try {
      const start = Date.now()
      response = await this.pool.query(text, values)
      const duration = Date.now() - start
      // console.log('executed query', { text, duration, rows: response.rowCount })
    } catch (error) {
      console.error(`Db query(): ${error}`)
    }
    return response
  }

  async getClient() {
    const client = await this.pool.connect()
    const query = client.query
    const release = client.release
    // set a timeout of 5 seconds, after which we will log client's last query
    const timeout = setTimeout(() => {
      console.error('A client has been checked out for more than 5 seconds!')
      console.error(`The last executed query on this client was: ${client.lastQuery}`)
    }, 5000)
    // monkey patch the query method to keep track of the last query executed
    client.query = (...args) => {
      client.lastQuery = args
      return query.apply(client, args)
    }
    client.release = () => {
      // clear our timeout
      clearTimeout(timeout)
      // set the methods back to their old un-monkey-patched version
      client.query = query
      client.release = release
      return release.apply(client)
    }
    return client
  }

  async initPlacesApiSkuDataTable() {
    try {
      await this.query(`
          CREATE TABLE IF NOT EXISTS places_api_sku_data (
            id TEXT,
            sku TEXT,
            func TEXT,
            category TEXT,
            description TEXT,
            fields TEXT[],
            usage_caps INTEGER[],
            costs_per_one_k DECIMAL(4, 2)[],
            cost_level INTEGER,
            request_count INTEGER,
            cumm_cost DECIMAL(5, 2),
            billing_period TEXT,
            free_limit_hit BOOLEAN,
            updated_at TIMESTAMP DEFAULT NOW(),
            PRIMARY KEY (id, billing_period)
          );
          CREATE INDEX IF NOT EXISTS idx_places_api_sku_data_func ON places_api_sku_data (func);
          CREATE INDEX IF NOT EXISTS idx_places_api_sku_data_category ON places_api_sku_data (category);
          CREATE INDEX IF NOT EXISTS idx_places_api_sku_data_billing_period ON places_api_sku_data (billing_period);
        `)
    } catch (err) {
      console.error('Database initialization error:', err)
    }
  }

  async initPlacesTable() {
    try {
      await this.query(`
          CREATE TABLE IF NOT EXISTS sushi_restaurants (
          place_id TEXT PRIMARY KEY,
          photos JSON,
          address TEXT,
          street TEXT,
          city TEXT,
          state TEXT,
          zip TEXT,
          country TEXT,
          neighborhood TEXT,
          latitude DECIMAL(9,6),
          longitude DECIMAL(9,6),
          accessibility_options JSON,
          business_status TEXT,
          name TEXT,
          google_maps_links JSON,
          primary_type TEXT,
          opening_hours JSON,
          secondary_opening_hours JSON,
          phone TEXT,
          price_level TEXT,
          price_range TEXT,
          rating DECIMAL(2,1) CHECK (rating BETWEEN 0 AND 5),  -- e.g., 4.5
          rating_count INTEGER DEFAULT 0,
          website TEXT,
          description TEXT,
          reviews JSON,
          parking_options JSON,
          payment_options JSON,
          allow_dogs BOOLEAN,
          curbside_pickup BOOLEAN,
          delivery BOOLEAN,
          dine_in BOOLEAN,
          good_for_children BOOLEAN,
          good_for_groups BOOLEAN,
          good_for_sports BOOLEAN,
          live_music BOOLEAN,
          menu_for_children BOOLEAN,
          outdoor_seating BOOLEAN,
          reservable BOOLEAN,
          restroom BOOLEAN,
          serves_beer BOOLEAN,
          serves_breakfast BOOLEAN,
          serves_brunch BOOLEAN,
          serves_cocktails BOOLEAN,
          serves_coffee BOOLEAN,
          serves_dinner BOOLEAN,
          serves_dessert BOOLEAN,
          serves_lunch BOOLEAN,
          serves_vegetarian_food BOOLEAN,
          serves_wine BOOLEAN,
          takeout BOOLEAN,
          generative_summary TEXT,
          generative_disclosure TEXT,
          rewiew_summary TEXT,
          rewiew_disclosure TEXT,
          update_category TEXT,
          updated_at TIMESTAMP NOT NULL DEFAULT NOW());
          CREATE INDEX IF NOT EXISTS idx_sushi_restaurants_rating ON sushi_restaurants (rating);
          CREATE INDEX IF NOT EXISTS idx_sushi_restaurants_city ON sushi_restaurants (city);
          CREATE INDEX IF NOT EXISTS idx_sushi_restaurants_state ON sushi_restaurants (state);
        `)
    } catch (err) {
      console.error('Database initialization error:', err)
    }
  }

  async initZipSearchHistoryTable() {
    try {
      await this.query(`
          CREATE TABLE IF NOT EXISTS zip_search_history (
            id SERIAL PRIMARY KEY,
            latitude DECIMAL NOT NULL,
            longitude DECIMAL NOT NULL,
            zip_codes TEXT[] NOT NULL,
            last_searched_at TIMESTAMP NOT NULL,
            UNIQUE (latitude, longitude)
          )
        `)
    } catch (err) {
      console.error('Database initialization error:', err)
    }
  }

  async initZipCodesTable() {
    try {
      await this.query(`
          CREATE TABLE IF NOT EXISTS zip_codes (
            zip TEXT PRIMARY KEY,
            type TEXT,
            decommissioned BOOLEAN DEFAULT false,
            primary_city TEXT,
            acceptable_cities TEXT,
            unacceptable_cities TEXT,
            state TEXT,
            county TEXT,
            timezone TEXT,
            area_codes TEXT,
            world_region TEXT,
            country TEXT,
            latitude DOUBLE PRECISION,
            longitude DOUBLE PRECISION,
            irs_estimated_population INTEGER);
          `)
    } catch (err) {
      console.error('zip_codes table initialization error:', err)
    }
  }

  async initAllDb() {
    await this.initPlacesApiSkuDataTable()
    await this.initPlacesTable()
    await this.initZipCodesTable()
    await this.initZipSearchHistoryTable()
  }

  async deletePlace(placeId) {
    try {
      const queryTxt = `
          DELETE FROM sushi_restaurants
          WHERE place_id = $1`
      const result = await this.query(queryTxt, [placeId])
      console.log(`Deleted place_id: ${placeId}, rowCount: ${result.rowCount}`)
      return result.rowCount
    } catch (error) {
      console.error(`Error deleting place_id ${placeId}:`, error)
    }
  }

  async upsertPlace(_place) {
    await this.initPlacesTable()
    // Ensure updated_at is always included
    const place = { ..._place, updated_at: 'NOW()' }

    // Stringify values that should be JSON (e.g., photos, opening_hours)
    const jsonColumns = [
      'photos',
      'accessibility_options',
      'opening_hours',
      'secondary_opening_hours',
      'google_maps_links',
      'reviews',
      'parking_options',
      'payment_options'
    ]
    for (const col of jsonColumns) {
      if (place[col] !== undefined && place[col] !== null) {
        place[col] = JSON.stringify(place[col])
      }
    }

    const columns = Object.keys(place)
    const values = Object.values(place)
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ')
    const setClause = columns
      .filter(col => col !== 'place_id')
      .map(col => `${col} = COALESCE(EXCLUDED.${col}, sushi_restaurants.${col})`)
      .join(', ')
    const queryTxt = `
        INSERT INTO sushi_restaurants (${columns.join(', ')})
        VALUES (${placeholders})
        ON CONFLICT (place_id)
        DO UPDATE SET ${setClause}`
    try {
      const response = await this.query(queryTxt, values)
      if (response?.rowCount > 0) {
        console.log(`Upserted place_id: ${place.place_id}`)
        return response
      }
    } catch (error) {
      console.error(`upsertPlace error: ${error}`)
    }
  }

  async insertZipCodesData(rows) {
    const columns = Object.keys(rows[0])
    const values = rows
      .map(zipObj => {
        let vals = Object.values(zipObj)
        vals = vals.map(v => {
          if (typeof v === 'string') return `'${v.replaceAll("'", "''")}'`
          else if (!v) return 'DEFAULT'
          else return v
        })
        return `(${vals.join(',')})`
      })
      .join(',')

    const queryTxt = `
        INSERT INTO zip_codes (${columns.join(', ')})
        VALUES ${values}`
    try {
      await this.initZipCodesTable()
      const result = await this.query(queryTxt)
      console.log(`Upserted ${result.rowCount} of ${rows.length} records`)
      return result.rowCount
    } catch (error) {
      console.error('Error upserting to zip_codes:\n', error)
    }
  }

  async upsertPlacesApiSkuData(skuObjArray) {
    await this.initPlacesApiSkuDataTable()
    // Ensure updated_at is always included
    const newSkuObjArray = skuObjArray.map(skuObj => ({
      ...skuObj,
      updated_at: 'NOW()'
    }))
    const columns = Object.keys(newSkuObjArray[0])
    const values = newSkuObjArray.flatMap(skuObj => {
      skuObj.cumm_cost = Number(skuObj.cumm_cost).toFixed(2)
      skuObj.costs_per_one_k = `{${skuObj.costs_per_one_k
        .map(cost => cost.toFixed(2))
        .join(',')}}`
      return Object.values(skuObj)
    })
    const placeholders = newSkuObjArray
      .map((_, rowIdx) =>
        columns
          .map((_, colIdx) => `$${rowIdx * columns.length + colIdx + 1}`)
          .join(', ')
      )
      .join('), (')
    const setClause = columns
      .filter(col => col !== 'id' || col !== 'billing_period')
      .map(col => `${col} = EXCLUDED.${col}`)
      .join(', ')

    const queryTxt = `
        INSERT INTO places_api_sku_data (${columns.join(', ')})
        VALUES (${placeholders})
        ON CONFLICT (id, billing_period)
        DO UPDATE SET ${setClause}`
    try {
      const result = await this.query(queryTxt, values)
      console.log(`Upserted ${result.rowCount} of ${skuObjArray.length} skus.`)
      return result.rowCount
    } catch (error) {
      console.error('Error upserting:', error)
    }
  }

  async updateSearchHistory(lat, lng, zips) {
    await this.initZipSearchHistoryTable()
    await this.query(
      `
        INSERT INTO zip_search_history (latitude, longitude, zip_codes, last_searched_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (latitude, longitude)
        DO UPDATE SET zip_codes = EXCLUDED.zip_codes, last_searched_at = NOW()
      `,
      [lat, lng, zips]
    )
  }

  async getAllPlaces(interval, { column, query }, orderBy = 'ASC') {
    let queryTxt = `SELECT * FROM public.${process.env.PLACES_TABLE_NAME}\n`
    queryTxt += `WHERE updated_at <= NOW() - INTERVAL '${interval ? interval : '0'}'\n`
    queryTxt += column ? `AND ${column} ${query}\n` : ''
    queryTxt += devMode ? `AND state = 'FL' OR state = 'DC'\n` : ''
    queryTxt += `ORDER BY updated_at ${orderBy};`
    try {
      const result = await this.query(queryTxt)
      console.log(`Update interval: ${interval}`)
      console.log(`${result.rowCount} records retrieved from db.`)
      console.log(queryTxt)
      return result
    } catch (error) {
      console.error(error, queryTxt)
    }
  }

  async getAllPlaceIds() {
    try {
      const queryTxt = 'SELECT place_id FROM sushi_restaurants;'
      const result = await this.query(queryTxt)
      return result.rows.map(obj => obj.place_id)
    } catch (error) {
      console.error(error)
    }
  }

  async getExistingPlace(id) {
    try {
      const queryTxt = `
          SELECT place_id, updated_at
          FROM sushi_restaurants
          WHERE place_id = $1`
      const result = await this.query(queryTxt, [id])
      return result
    } catch (error) {
      console.error(error)
    }
  }

  async getSkuDbData() {
    const currBillingPeriod = getCurrMthYr()
    try {
      const queryTxt = `
          SELECT * FROM places_api_sku_data
          WHERE billing_period = '${currBillingPeriod}';`
      const result = await this.query(queryTxt)
      return result
    } catch (error) {
      console.error(error)
    }
  }

  async getAllZipCodeData() {
    try {
      const queryTxt = `SELECT * FROM zip_codes;`
      const result = await this.query(queryTxt)
      console.log(`${result.rowCount} rows returned from zip_codes`)
      return result
    } catch (error) {
      console.error(error)
    }
  }

  async getZipCoordinates(interval = '6 months') {
    try {
      const queryTxt = `
          SELECT DISTINCT latitude, longitude, ARRAY_AGG(zip) AS zip_codes
          FROM zip_codes
          WHERE latitude IS NOT NULL AND longitude IS NOT NULL
          AND irs_estimated_population IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 
            FROM zip_search_history zsh
            WHERE zsh.latitude = zip_codes.latitude
            AND zsh.longitude = zip_codes.longitude
            AND zsh.last_searched_at > NOW() - INTERVAL '${interval}'
          )
          GROUP BY latitude, longitude`
      const result = await this.query(queryTxt)
      return result
    } catch (error) {
      console.error(error)
    }
  }

  async getCityFromZip(zip) {
    try {
      const queryTxt = `SELECT primary_city FROM zip_codes WHERE zip = '${zip}';`
      const result = await this.query(queryTxt)
      console.log(
        `City ${JSON.stringify(result.rows[0].primary_city)} for ${zip} returned from zip_codes`
      )
      return result.rows[0].primary_city
    } catch (error) {
      console.error(error)
    }
  }

  async end() {
    try {
      this.pool.end()
    } catch (error) {
      console.error(error)
    }
  }
}

// export {
//   checkDbExists,
//   query,
//   getClient,
//   initAllDb,
//   upsertPlace,
//   insertZipCodesData,
//   upsertPlacesApiSkuData,
//   updateSearchHistory,
//   getAllPlaces,
//   getAllPlaceIds,
//   getExistingPlace,
//   getSkuDbData,
//   getAllZipCodeData,
//   getZipCoordinates,
//   end
// }
