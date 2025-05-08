import { getCurrMthYr } from './utils.js'
import { config } from './config.js'
import columnify from 'columnify'
import DB from './db.js'

const SKU_CATEGORIES = Object.freeze({
  ID_ONLY: 'id_only',
  ESSENTIALS: 'essentials',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
  ATMOSPHERE: 'atmosphere',
  PHOTOS: 'photos'
})
const SKU_FUNCS = Object.freeze({
  TEXT_SEARCH: 'Text Search',
  PLACE_DETAILS: 'Place Details'
})
const DEFAULT_PLACES_API_SKU_DATA = [
  Object.freeze({
    id: '',
    sku: '635D-A9DD-C520',
    func: SKU_FUNCS.TEXT_SEARCH,
    category: SKU_CATEGORIES.ID_ONLY,
    description: 'Places API: Text Search Essentials (IDs Only)',
    fields: ['places.id,nextPageToken'],
    usage_caps: [2147483647],
    costs_per_one_k: [0.0],
    cost_level: 0,
    request_count: 0,
    cumm_cost: 0.0,
    billing_period: '',
    free_limit_hit: false
  }),
  Object.freeze({
    id: '',
    sku: '4FDA-34B1-A910',
    func: SKU_FUNCS.TEXT_SEARCH,
    category: SKU_CATEGORIES.PRO,
    description: 'Places API: Text Search Pro',
    fields: [
      'places.id',
      'places.accessibilityOptions',
      'places.addressComponents',
      'places.adrFormatAddress',
      'places.businessStatus',
      'places.containingPlaces',
      'places.displayName',
      'places.formattedAddress',
      'places.googleMapsLinks',
      'places.googleMapsUri',
      'places.iconBackgroundColor',
      'places.iconMaskBaseUri',
      'places.location',
      'places.photos',
      'places.plusCode',
      'places.postalAddress',
      'places.primaryType',
      'places.primaryTypeDisplayName',
      'places.pureServiceAreaBusiness',
      'places.shortFormattedAddress',
      'places.subDestinations',
      'places.types',
      'places.utcOffsetMinutes',
      'places.viewport'
    ],
    usage_caps: [5000, 100000, 500000, 1000000, 5000000, 2147483647],
    costs_per_one_k: [0.0, 32.0, 25.6, 19.2, 9.6, 2.4],
    cost_level: 1,
    request_count: 0,
    cumm_cost: 0.0,
    billing_period: '',
    free_limit_hit: false
  }),
  Object.freeze({
    id: '',
    sku: '5C36-E272-E88F',
    func: SKU_FUNCS.PLACE_DETAILS,
    category: SKU_CATEGORIES.ID_ONLY,
    description: 'Places API: Place Details Essentials (IDs Only)',
    fields: ['id', 'photos'],
    usage_caps: [2147483647],
    costs_per_one_k: [0.0],
    cost_level: 0,
    request_count: 0,
    cumm_cost: 0.0,
    billing_period: '',
    free_limit_hit: false
  }),
  Object.freeze({
    id: '',
    sku: '6E05-E1C3-8D85',
    func: SKU_FUNCS.PLACE_DETAILS,
    category: SKU_CATEGORIES.ESSENTIALS,
    description: 'Places API: Place Details Essentials',
    fields: [
      'addressComponents',
      'adrFormatAddress',
      'formattedAddress',
      'location',
      'plusCode',
      'postalAddress',
      'shortFormattedAddress',
      'types',
      'viewport'
    ],
    usage_caps: [10000, 100000, 500000, 1000000, 5000000, 2147483647],
    costs_per_one_k: [0.0, 5.0, 4.0, 3.0, 1.5, 0.38],
    cost_level: 1,
    request_count: 0,
    cumm_cost: 0.0,
    billing_period: '',
    free_limit_hit: false
  }),
  Object.freeze({
    id: '',
    sku: '4ED6-464A-2AFC',
    func: SKU_FUNCS.PLACE_DETAILS,
    category: SKU_CATEGORIES.PRO,
    description: 'Places API: Place Details Pro',
    fields: [
      'accessibilityOptions',
      'businessStatus',
      'containingPlaces',
      'displayName',
      'googleMapsLinks',
      'googleMapsUri',
      'iconBackgroundColor',
      'iconMaskBaseUri',
      'primaryType',
      'primaryTypeDisplayName',
      'pureServiceAreaBusiness',
      'subDestinations',
      'utcOffsetMinutes'
    ],
    usage_caps: [5000, 100000, 500000, 1000000, 5000000, 2147483647],
    costs_per_one_k: [0.0, 17.0, 13.6, 10.2, 5.1, 1.28],
    cost_level: 2,
    request_count: 0,
    cumm_cost: 0.0,
    billing_period: '',
    free_limit_hit: false
  }),
  Object.freeze({
    id: '',
    sku: '2D9A-3DE0-3766',
    func: SKU_FUNCS.PLACE_DETAILS,
    category: SKU_CATEGORIES.ENTERPRISE,
    description: 'Places API: Place Details Enerprise',
    fields: [
      'currentOpeningHours',
      'currentSecondaryOpeningHours',
      'internationalPhoneNumber',
      'nationalPhoneNumber',
      'priceLevel',
      'priceRange',
      'rating',
      'regularOpeningHours',
      'regularSecondaryOpeningHours',
      'userRatingCount',
      'websiteUri'
    ],
    usage_caps: [1000, 100000, 500000, 1000000, 5000000, 2147483647],
    costs_per_one_k: [0.0, 20.0, 16.0, 12.0, 6.0, 1.51],
    cost_level: 3,
    request_count: 0,
    cumm_cost: 0.0,
    billing_period: '',
    free_limit_hit: false
  }),
  Object.freeze({
    id: '',
    sku: 'EB23-5ECC-F753',
    func: SKU_FUNCS.PLACE_DETAILS,
    category: SKU_CATEGORIES.ATMOSPHERE,
    description: 'Places API: Place Details Enterprise + Atmosphere',
    fields: [
      'allowsDogs',
      'curbsidePickup',
      'delivery',
      'dineIn',
      'editorialSummary',
      'evChargeOptions',
      'fuelOptions',
      'goodForChildren',
      'goodForGroups',
      'goodForWatchingSports',
      'liveMusic',
      'menuForChildren',
      'parkingOptions',
      'paymentOptions',
      'outdoorSeating',
      'reservable',
      'restroom',
      'reviews',
      'servesBeer',
      'servesBreakfast',
      'servesBrunch',
      'servesCocktails',
      'servesCoffee',
      'servesDessert',
      'servesDinner',
      'servesLunch',
      'servesVegetarianFood',
      'servesWine',
      'takeout'
    ],
    usage_caps: [1000, 100000, 500000, 1000000, 5000000, 2147483647],
    costs_per_one_k: [0.0, 25.0, 20.0, 15.0, 7.5, 2.28],
    cost_level: 4,
    request_count: 0,
    cumm_cost: 0.0,
    billing_period: '',
    free_limit_hit: false
  }),
  Object.freeze({
    id: '',
    sku: 'DCD1-FE97-8C71',
    func: SKU_FUNCS.PLACE_DETAILS,
    category: SKU_CATEGORIES.PHOTOS,
    description: 'Places API: Place Details Photos',
    fields: [],
    usage_caps: [1000, 100000, 500000, 1000000, 5000000, 2147483647],
    costs_per_one_k: [0.0, 7.0, 5.6, 4.2, 2.1, 0.53],
    cost_level: 5,
    request_count: 0,
    cumm_cost: 0.0,
    billing_period: '',
    free_limit_hit: false
  })
]
const SKU_COST_LIMIT = config.costLimit

const db = new DB()
class SkuData {
  constructor() {
    this.skuObjs = []
  }

  static async create() {
    const instance = new SkuData()
    await instance.getCurrentSkuData()
    return instance
  }

  async getCurrentSkuData() {
    let { rows, rowCount } = await db.getSkuDbData()
    console.log(`${rowCount} Skus retrieved from db.`)
    if (!rows || rowCount === 0) rows = DEFAULT_PLACES_API_SKU_DATA
    for (const row of rows) {
      this.skuObjs.push(new Sku(row))
    }
    this.checkWithinCostLimit()
  }

  checkWithinCostLimit() {
    let skuCostsSum = 0.0
    for (const sku of Object.keys(this.skuObjs)) {
      skuCostsSum += Number(this.skuObjs[sku].cumm_cost)
    }
    if (skuCostsSum > SKU_COST_LIMIT) {
      console.log(
        `Costs exceeded for ${getCurrMthYr()}, Limit: ${SKU_COST_LIMIT}, \
        Current cost: ${skuCostsSum}`
      )
      return false
    }
    console.log(
      `Costs within limits for ${getCurrMthYr()}, Limit: ${SKU_COST_LIMIT}, \
        Current cost: ${skuCostsSum}`
    )
    return true
  }

  filterUpdateSkus(update_category, activeSkus) {
    // update_category already has highest update level
    if (update_category === SKU_CATEGORIES.ATMOSPHERE) return
    // Find highest update category not updated for place
    let updateSkus = activeSkus
    if (update_category) {
      const updatedSku = activeSkus.filter(sku => sku.category === update_category)
      const updateLevel = updatedSku[0].cost_level - 1
      updateSkus = activeSkus.filter(sku => updateLevel < sku.cost_level)
    }
    return updateSkus
  }

  logSkuReport() {
    const table = []
    for (const sku of this.skuObjs) {
      table.push({
        Sku: sku.description,
        'Billing Period': sku.billing_period,
        'Req Count': sku.request_count,
        'Free Limit Hit': sku.free_limit_hit,
        'Cumm Cost': sku.cumm_cost
      })
    }
    const columns = columnify(table)
    console.log(`\n${columns}`)
  }

  async save() {
    try {
      await db.upsertPlacesApiSkuData(this.skuObjs)
    } catch (error) {
      console.error(error)
    }
  }
}

function checkWithinCostLimit(currentSkuData) {
  let skuCostsSum = 0.0
  for (const sku of Object.keys(currentSkuData)) {
    skuCostsSum += Number(currentSkuData[sku].cumm_cost)
  }
  if (skuCostsSum >= SKU_COST_LIMIT) {
    console.log(
      `Costs exceeded for ${getCurrMthYr()}, Limit: ${SKU_COST_LIMIT}, \
      Current cost: ${skuCostsSum}`
    )
    return false
  } else {
    console.log(
      `Costs within limits for ${getCurrMthYr()}, Limit: ${SKU_COST_LIMIT}, \
      Current cost: ${skuCostsSum}`
    )
    return true
  }
}

async function getCurrentSkuData() {
  const { rows, rowCount, error } = await db.getSkuDbData()
  console.log(`Sku data retrieved from db.`)
  if (error) throw error
  if (!rows || rowCount === 0) rows = DEFAULT_PLACES_API_SKU_DATA
  const currentSkuData = []
  for (const row of rows) {
    const sku = new Sku(row)
    currentSkuData.push(sku)
  }
  if (!checkWithinCostLimit(currentSkuData)) throw Error('Costs Exceeded')
  return currentSkuData
}

function filterActiveSkus(skus) {
  // Find skus with free requests remaining
  let activeSkus = skus.filter(sku => {
    return (
      sku.category !== SKU_CATEGORIES.PHOTOS && sku.request_count < sku.usage_caps[0]
    )
  })
  if (activeSkus.length === 0) {
    throw Error(`All place details free requests are maxed out.`)
  }
  return activeSkus
}

function filterUpdateSkus(update_category, activeSkus) {
  // update_category already has highest update level
  if (update_category === SKU_CATEGORIES.ATMOSPHERE) return null
  // Find highest update category not updated for place
  if (update_category) {
    const updatedSku = activeSkus.filter(sku => sku.category === update_category)[0]
    const updateLevel = updatedSku.cost_level - 1
    const updateSkus = activeSkus.filter(sku => updateLevel < sku.cost_level)
    if (updateSkus.length === 0) return null
    return updateSkus
  }
  return null
}

class Sku {
  constructor(skuObj) {
    this.sku = skuObj.sku
    this.func = skuObj.func
    this.category = skuObj.category
    this.description = skuObj.description
    this.fields = skuObj.fields
    this.usage_caps = this.formatUsageCaps(skuObj.usage_caps)
    this.costs_per_one_k = skuObj.costs_per_one_k
    this.cost_level = skuObj.cost_level
    this.request_count = skuObj.request_count
    this.cumm_cost = Number(skuObj.cumm_cost)
    this.free_limit_hit = skuObj.free_limit_hit
    if (skuObj.id && skuObj.billing_period) {
      this.id = skuObj.id
      this.billing_period = skuObj.billing_period
      this.calcSkuCost()
      this.checkSkuFreeLimit()
    } else {
      this.id = this.buildSkuId(skuObj.sku)
      this.billing_period = getCurrMthYr()
    }
  }

  static async saveCurrentSkuData(currentSkuData) {
    try {
      await db.upsertPlacesApiSkuData(currentSkuData)
    } catch (error) {
      console.error(error)
    }
  }

  buildSkuId(sku) {
    sku = sku.replace('-', '_')
    return `${sku}_${getCurrMthYr()}`
  }

  formatUsageCaps(usageCaps) {
    return usageCaps.map(cap => {
      if (cap === '+Infinity' || cap === 'Infinity') return 2147483647
      else return cap
    })
  }

  increment(amount = 1) {
    this.request_count += amount
    this.calcSkuCost()
    this.checkSkuFreeLimit()
  }

  checkSkuFreeLimit() {
    if (this.request_count >= this.usage_caps[0]) {
      this.free_limit_hit = true
      console.log(`Free limit hit for sku: ${this.sku}`)
    }
  }

  calcSkuCost() {
    let _count = this.request_count
    const sums = this.usage_caps.map((limit, index) => {
      const qty = Math.min(_count, limit)
      _count = Math.max(0, _count - limit)
      const cost = qty * (this.costs_per_one_k[index] / 1000)
      return cost
    })
    const sum = sums.reduce((sum, value) => sum + value, 0)
    this.cumm_cost = sum.toFixed(2)
  }
}

export {
  SKU_CATEGORIES,
  SKU_FUNCS,
  DEFAULT_PLACES_API_SKU_DATA,
  Sku,
  SkuData,
  checkWithinCostLimit,
  getCurrentSkuData,
  filterActiveSkus,
  filterUpdateSkus
}
