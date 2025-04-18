import { getCurrMthYr } from './utils.js'
import fs from 'fs/promises'
import path from 'path'
import { config } from './config.js'
import pg from 'pg'

const sslConfig = config.devMode
  ? { host: 'localHost', user: 'postgres', password: '', port: 5432 }
  : { host: 'localHost', user: 'postgres', password: '', port: 5432 }
// {
//   ssl: {
//     rejectUnauthorized: true,
//     ca: await fs.readFile('./rds-ca-bundle.pem', { encoding: 'utf8' })
//   }
// }
const { Pool } = pg
const pool = new Pool(sslConfig)

pool.on('connect', client => {
  const databaseName = process.env.PGDATABASE
  // Check if the database exists
  client.query(
    `SELECT 1 FROM pg_database WHERE datname = '${databaseName}';`,
    (err, result) => {
      if (err) {
        console.error('Error checking if database exists:', err)
        // client.release() // Release the connection
        return
      }

      if (result.rows.length === 0) {
        // Database doesn't exist, so create it
        client.query(`CREATE DATABASE "${databaseName}";`, createErr => {
          if (createErr) {
            console.error('Error creating database:', createErr)
          } else {
            console.log(`Database "${databaseName}" created successfully.`)
          }
          // client.release() // Release the connection
        })
      } else {
        console.log(`Database "${databaseName}" already exists.`)
        // client.release() // Release the connection
      }
    }
  )
})

async function initPlacesApiSkuDataTable(client = '') {
  let release = false
  if (!client) {
    client = await pool.connect()
    release = true
  }
  try {
    await client.query('BEGIN')
    await client.query(`
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
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Database initialization error:', err)
    throw err
  } finally {
    if (release) client.release()
  }
}

async function initSushiRestaurantsTable(client = '') {
  let release = false
  if (!client) {
    client = await pool.connect()
    release = true
  }
  try {
    await client.query('BEGIN')
    await client.query(`
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
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_restaurant UNIQUE (latitude, longitude));
    CREATE INDEX IF NOT EXISTS idx_sushi_restaurants_rating ON sushi_restaurants (rating);
    CREATE INDEX IF NOT EXISTS idx_sushi_restaurants_city ON sushi_restaurants (city);
    CREATE INDEX IF NOT EXISTS idx_sushi_restaurants_state ON sushi_restaurants (state);
  `)
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Database initialization error:', err)
    throw err
  } finally {
    if (release) client.release()
  }
}

async function initZipSearchHistoryTable(client = '') {
  let release = false
  if (!client) {
    client = await pool.connect()
    release = true
  }
  try {
    await client.query('BEGIN')
    await client.query(`
      CREATE TABLE IF NOT EXISTS zip_search_history (
        id SERIAL PRIMARY KEY,
        latitude DECIMAL NOT NULL,
        longitude DECIMAL NOT NULL,
        zip_codes TEXT[] NOT NULL,
        last_searched_at TIMESTAMP NOT NULL,
        UNIQUE (latitude, longitude)
      )
    `)

    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Database initialization error:', err)
    throw err
  } finally {
    if (release) client.release()
  }
}

async function initDb() {
  const client = await pool.connect()
  try {
    initPlacesApiSkuDataTable(client)
    initSushiRestaurantsTable(client)
    initZipSearchHistoryTable(client)
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Database update error:', err)
    throw err
  } finally {
    client.release()
  }
}

async function upsertPlace(_place) {
  await initSushiRestaurantsTable()
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

  const query = `
    INSERT INTO sushi_restaurants (${columns.join(', ')})
    VALUES (${placeholders})
    ON CONFLICT (place_id)
    DO UPDATE SET ${setClause}
  `

  try {
    await pool.query(query, values)
    console.log(`Upserted place_id: ${place.place_id}`)
  } catch (error) {
    throw error
  }
}

async function upsertPlacesApiSkuData(skuObjArray) {
  await initPlacesApiSkuDataTable()
  // Ensure updated_at is always included
  const newSkuObjArray = skuObjArray.map(skuObj => ({
    ...skuObj,
    updated_at: 'NOW()'
  }))
  const columns = Object.keys(newSkuObjArray[0])
  const values = newSkuObjArray.flatMap(skuObj => {
    skuObj.cumm_cost = Number(skuObj.cumm_cost.toFixed(2))
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

  const query = `
    INSERT INTO places_api_sku_data (${columns.join(', ')})
    VALUES (${placeholders})
    ON CONFLICT (id, billing_period)
    DO UPDATE SET ${setClause}
  `

  try {
    const result = await pool.query(query, values)
    console.log(`Upserted ${result.rowCount} records`)
    return result.rowCount
  } catch (error) {
    console.error('Error upserting:', error)
    console.error('Error query:', query)
    console.error('Error values:', values)
    throw error
  }
}

async function updateSearchHistory(lat, lng, zips) {
  await initZipSearchHistoryTable()
  await pool.query(
    `
    INSERT INTO zip_search_history (latitude, longitude, zip_codes, last_searched_at)
    VALUES ($1, $2, $3, NOW())
    ON CONFLICT (latitude, longitude)
    DO UPDATE SET zip_codes = EXCLUDED.zip_codes, last_searched_at = NOW()
  `,
    [lat, lng, zips]
  )
}

async function getAllPlaces(updateInterval, order = 'ASC') {
  if (!updateInterval) updateInterval = config.updateInterval
  console.log(updateInterval)
  try {
    const query = `
    SELECT * FROM sushi_restaurants
    WHERE updated_at <= NOW() - INTERVAL '${updateInterval}'
    ORDER BY updated_at ${order};`
    const result = await pool.query(query)
    return result
  } catch (err) {
    console.error('Query error:', err)
    throw err
  }
}

async function getExistingPlace(id, interval = '6 months') {
  try {
    const query = `
    SELECT place_id, updated_at
    FROM sushi_restaurants
    WHERE place_id = $1
    AND updated_at >= NOW() - INTERVAL '${interval}'
    `
    const result = await pool.query(query, [id])
    return result
  } catch (err) {
    console.error('Query error:', err)
    throw err
  }
}

async function getSkuDbData() {
  await initPlacesApiSkuDataTable()
  const currBillingPeriod = getCurrMthYr()
  try {
    const query = `SELECT * FROM places_api_sku_data WHERE billing_period = '${currBillingPeriod}';`
    const result = await pool.query(query)
    return result
  } catch (err) {
    console.error('Query error:', err)
    throw err
  }
}

async function getZipCoordinates(interval = '6 months') {
  let where = 'WHERE latitude IS NOT NULL AND longitude IS NOT NULL'
  where += config.devMode
    ? " AND primary_city = 'Washington' AND state = 'DC'"
    : ''
  try {
    const query = `
        SELECT DISTINCT latitude, longitude, ARRAY_AGG(zip) AS zip_codes
        FROM zip_codes
        ${where}
        AND NOT EXISTS (
          SELECT 1 
          FROM zip_search_history zsh
          WHERE zsh.latitude = zip_codes.latitude
          AND zsh.longitude = zip_codes.longitude
          AND zsh.last_searched_at >= NOW() - INTERVAL '${interval}'
        )
        GROUP BY latitude, longitude
      `
    const result = await rdsPool.query(query)
    return result.rows
  } catch (err) {
    console.error('Query error:', err)
    throw err
  }
}

// Db utility/migrating functions
async function updateColumns(table, columns, dataTypes) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    if (!Array.isArray(columns) || !Array.isArray(dataTypes)) {
      throw new Error('Columns and dataTypes must be arrays')
    }
    if (columns.length !== dataTypes.length) {
      throw new Error('Columns and dataTypes arrays must have the same length')
    }

    const columnDefinitions = columns.map(
      (col, index) => `'${col} ${dataTypes[index]}'`
    )

    await client.query(`
      DO $$
      DECLARE
        col record;
        columns_to_add text[] := ARRAY[${columnDefinitions.join(', ')}];
      BEGIN
        FOR col IN 
          SELECT split_part(trim(unnest(columns_to_add)), ' ', 1) AS name,
                 split_part(trim(unnest(columns_to_add)), ' ', 2) AS datatype
        LOOP
          IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = '${table}'
            AND column_name = col.name
          ) THEN
            EXECUTE 'ALTER TABLE ' || quote_ident('${table}') || ' ADD COLUMN ' || 
                    quote_ident(col.name) || ' ' || col.datatype;
          END IF;
        END LOOP;
      END;
      $$;
    `)

    // ALTER COLUMN id DROP DEFAULT,
    // ALTER COLUMN id TYPE TEXT USING id::TEXT,
    // DROP SEQUENCE IF EXISTS sushi_restaurants_id_seq;
    // ALTER COLUMN reviews TYPE TEXT[] USING reviews::TEXT[];

    // await client.query(`
    //   ALTER TABLE sushi_restaurants
    //   DROP COLUMN generative_summary,
    //   ADD COLUMN generative_summary TEXT;
    // `);

    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Database update error:', err)
    throw err
  } finally {
    client.release()
  }
}

async function reassignSushiRestaurantIds() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await client.query(`
      UPDATE sushi_restaurants
      SET id = gen_random_uuid();
    `)

    await client.query('COMMIT')
    console.log('Successfully reassigned all IDs in sushi_restaurants to UUIDs')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Error reassigning IDs:', err)
    throw err
  } finally {
    client.release()
  }
}

export {
  initPlacesApiSkuDataTable,
  initSushiRestaurantsTable,
  initZipSearchHistoryTable,
  initDb,
  upsertPlace,
  upsertPlacesApiSkuData,
  updateSearchHistory,
  getAllPlaces,
  getExistingPlace,
  getSkuDbData,
  getZipCoordinates,
  updateColumns,
  reassignSushiRestaurantIds
}
