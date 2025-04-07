import { getCurrMthYr } from './utils.js'
import fs from 'fs/promises'
import path from 'path'
import { config } from './config.js'
import pg from 'pg'
const { Pool } = pg

const __dirname = import.meta.dirname
let pemFile
try {
  const filepath = path.join(__dirname, 'rds-ca-bundle.pem')
  pemFile = await fs.readFile(filepath, { encoding: 'utf8' })
} catch (err) {
  console.error(err.message)
}

const poolConfig = config.devMode
  ? { host: 'localhost', database: 'postgres', user: 'postgres', port: 5432 }
  : {
      host: config.db.host,
      database: config.db.database,
      user: config.db.user,
      port: config.db.port,
      password: config.db.password,
      ssl: { rejectUnauthorized: true, ca: pemFile }
    }
const pool = new Pool(poolConfig)
// const rdsPool = new Pool({
//   host: config.db.host,
//   database: config.db.database,
//   user: config.db.user,
//   port: config.db.port,
//   password: config.db.password,
//   ssl: {
//     rejectUnauthorized: true,
//     ca: fs.readFileSync('./rds-ca-bundle.pem').toString()
//   }
// })

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
    address_html TEXT,
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
    allow_dogs BOOLEAN DEFAULT FALSE,
    curbside_pickup BOOLEAN DEFAULT FALSE,
    delivery BOOLEAN DEFAULT FALSE,
    dine_in BOOLEAN DEFAULT FALSE,
    good_for_children BOOLEAN DEFAULT FALSE,
    good_for_groups BOOLEAN DEFAULT FALSE,
    good_for_sports BOOLEAN DEFAULT FALSE,
    live_music BOOLEAN DEFAULT FALSE,
    menu_for_children BOOLEAN DEFAULT FALSE,
    outdoor_seating BOOLEAN DEFAULT FALSE,
    reservable BOOLEAN DEFAULT FALSE,
    restroom BOOLEAN DEFAULT FALSE,
    serves_beer BOOLEAN DEFAULT FALSE,
    serves_breakfast BOOLEAN DEFAULT FALSE,
    serves_brunch BOOLEAN DEFAULT FALSE,
    serves_cocktails BOOLEAN DEFAULT FALSE,
    serves_coffee BOOLEAN DEFAULT FALSE,
    serves_dinner BOOLEAN DEFAULT FALSE,
    serves_dessert BOOLEAN DEFAULT FALSE,
    serves_lunch BOOLEAN DEFAULT FALSE,
    serves_vegetarian_food BOOLEAN DEFAULT FALSE,
    serves_wine BOOLEAN DEFAULT FALSE,
    takeout BOOLEAN DEFAULT FALSE,
    slug TEXT,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_restaurant UNIQUE (latitude, longitude));
    CREATE INDEX IF NOT EXISTS idx_sushi_restaurants_rating ON sushi_restaurants (rating);
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

async function upsertPlace(placeData) {
  // Ensure updated_at is always included
  const place = { ...placeData, updated_at: 'NOW()' }

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
    .filter(
      col => col !== 'place_id' && col !== 'updated_at' && col !== 'created_at'
    )
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

async function getAllPlaces() {
  try {
    const query = `SELECT * FROM sushi_restaurants;`
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
