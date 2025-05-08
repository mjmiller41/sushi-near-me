import { STATES } from './constants.js'
import DB from './db.js'
const db = new DB()

class Place {
  constructor(place) {
    this.place_id = place.place_id ?? place.id ?? null
    this.photos = place.photos ?? null
    this.address = place.formattedAddress ?? place.address ?? null
    this.street = null
    this.city = null
    this.state = null
    this.zip = null
    this.country = null
    this.extractAddressComponents() // Extract from formatted address string
    this.neighborhood =
      this.getNeighborhood(place.addressComponents) ?? place.neighborhood ?? null
    this.latitude = place.location?.latitude ?? place.latitude ?? null
    this.longitude = place.location?.longitude ?? place.longitude ?? null
    this.accessibility_options =
      place.accessibilityOptions ?? place.accessibility_options ?? null
    this.business_status = place.businessStatus ?? place.business_status ?? null
    this.name = place.displayName?.text ?? place.name ?? null
    this.google_maps_links = place.googleMapsLinks ?? place.google_maps_links ?? null
    this.primary_type = place.primaryTypeDisplayName?.text ?? place.primary_type ?? null
    this.opening_hours = place.regularOpeningHours ?? place.opening_hours ?? null
    this.secondary_opening_hours =
      place.regularSecondaryOpeningHours ?? place.secondary_opening_hours ?? null
    this.phone = place.nationalPhoneNumber ?? place.phone ?? null
    this.price_level = place.priceLevel ?? place.price_level ?? null
    this.price_range =
      this.parsePriceRange(place.priceRange) ?? place.price_range ?? null
    this.rating = place.rating ?? null
    this.rating_count =
      place.userRatingCount ?? place.rating_count ?? place.ratings_count ?? 0
    this.website = place.websiteUri ?? place.website ?? null
    this.description =
      place.editorialSummary?.text ?? place.description ?? place.summary ?? null
    this.generative_summary =
      place.generativeSummary?.overview?.text ?? place.generative_summary ?? null
    this.generative_disclosure =
      place.generativeSummary?.disclosureText?.text ??
      place.generative_disclosure?.text ??
      place.generative_disclosure ??
      null
    this.reviews = place.reviews ?? null
    this.review_summary =
      place.reviewSummary?.text ??
      place.review_summary?.text ??
      place.review_summary ??
      null
    this.review_disclosure =
      place.reviewSummary?.disclosureText?.text ??
      place.review_disclosure?.text ??
      place.review_disclosure ??
      null
    this.parking_options = place.parkingOptions ?? place.parking_options ?? null
    this.payment_options = place.paymentOptions ?? place.payment_options ?? null
    this.allow_dogs = place.allowDogs ?? place.allow_dogs ?? null
    this.curbside_pickup = place.curbsidePickup ?? place.curbside_pickup ?? null
    this.delivery = place.delivery ?? null
    this.dine_in = place.dineIn ?? place.dine_in ?? null
    this.good_for_children = place.goodForChildren ?? place.good_for_children ?? null
    this.good_for_groups = place.goodForGroups ?? place.good_for_groups ?? null
    this.good_for_sports = place.goodForWatchingSports ?? place.good_for_sports ?? null
    this.live_music = place.liveMusic ?? place.live_music ?? null
    this.menu_for_children = place.menuForChildren ?? place.menu_for_children ?? null
    this.outdoor_seating = place.outdoorSeating ?? place.outdoor_seating ?? null
    this.reservable = place.reservable ?? null
    this.restroom = place.restroom ?? null
    this.serves_beer = place.servesBeer ?? place.serves_beer ?? null
    this.serves_breakfast = place.servesBreakfast ?? place.serves_breakfast ?? null
    this.serves_brunch = place.servesBrunch ?? place.serves_brunch ?? null
    this.serves_cocktails = place.servesCocktails ?? place.serves_cocktails ?? null
    this.serves_coffee = place.servesCoffee ?? place.serves_coffee ?? null
    this.serves_dinner = place.servesDinner ?? place.serves_dinner ?? null
    this.serves_dessert = place.servesDessert ?? place.serves_dessert ?? null
    this.serves_lunch = place.servesLunch ?? place.serves_lunch ?? null
    this.serves_vegetarian_food =
      place.servesVegetarianFood ?? place.serves_vegetarian_food ?? null
    this.serves_wine = place.servesWine ?? place.serves_wine ?? null
    this.takeout = place.takeout ?? null
    this.update_category = place.update_category ?? null
  }

  static async savePlacesData(places) {
    let upsertCount = 0
    try {
      for (const place of places) {
        upsertCount += await db.upsertPlace(place)
      }
    } catch (error) {
      console.error(error)
    } finally {
      await db.end()
    }
    console.log(`${upsertCount} places inserted/updated.`)
  }

  static validatePlaces(places) {
    const delIdx = []
    places.forEach((place, i) => {
      try {
        if (!(place instanceof Place)) place = new Place(place)
      } catch (error) {
        delIdx.push(i)
        console.error(error)
      }
    })
    delIdx.forEach(i => delete places[i])
  }

  async extractAddressComponents() {
    if (this.address) {
      // const regex = /(.+),\s(.+),\s([A-Z]{2})\s([0-9]{5}),\s([A-Z]+)/
      // const match = this.address.match(regex)
      const addrArr = this.address.split(', ')
      if (addrArr.at(-1) === 'Canada') {
        this.street = addrArr.slice(0, -3).join(', ') || null
        this.city = addrArr.at(-3) || null
        this.state = addrArr.at(-2) || null
        // zip = addrArr[4] || null
        this.country = addrArr.at(-1) || null
      } else if (addrArr.at(-1) === 'Mexico') {
        this.street = addrArr.slice(0, -3).join('\n') || null
        this.city = addrArr.at(-3) || null
        this.state = addrArr.at(-2) || null
        // zip = addrArr[4] || null
        this.country = addrArr.at(-1) || null
      } else if (addrArr.at(-1) === 'Puerto Rico') {
        this.street = addrArr.slice(0, -4).join(',') || null
        this.city = addrArr.at(-4) || null
        this.state = addrArr.at(-3) || null
        this.zip = addrArr.at(-2) || null
        this.country = addrArr.at(-1) || null
      } else if (addrArr.at(-1) === 'USA') {
        const addrAtNeg2 = addrArr.at(-2).split(' ') || null
        this.street = addrArr.slice(0, -3).join(',') || null
        this.city = addrArr.at(-3) || null
        this.state = addrAtNeg2[0] || null
        this.zip = addrAtNeg2[1] || null
        this.country = addrArr.at(-1) || null
        if (addrAtNeg2[0].length > 2) {
          const idx = Object.values(STATES).indexOf(addrAtNeg2[0])
          this.state = Object.keys(STATES)[idx] || null
          this.zip = addrAtNeg2[1] || null
        }
        if (!this.city && this.zip) this.city = await db.getCityFromZip(this.zip)
      } else {
        this.street = addrArr.slice(0, -4).join(',') || null
        this.city = addrArr.at(-4) || null
        this.state = addrArr.at(-3) || null
        this.zip = addrArr.at(-2) || null
        this.country = addrArr.at(-1) || null
      }
    }
  }

  getNeighborhood(components) {
    if (!components) return
    const obj = components.find(c => c.types?.includes('neighborhood'))
    return obj?.longText ?? obj?.shortText ?? null
  }

  editedDirectionsUri(directionsUri) {
    if (!directionsUri) return
    return directionsUri.replace("//''/", `/${this.latitude},${this.longitude}/''/`)
  }

  parsePriceRange(priceRange) {
    if (!priceRange) return
    const { endPrice, startPrice } = priceRange
    if (!endPrice && !startPrice) return
    const e_price = endPrice?.units ? `$${endPrice?.units}` : '& up'
    return `$${startPrice?.units} &ndash; ${e_price}`
  }

  parseBoolOptions(optionsObj, optionsType) {
    if (!optionsObj || !optionsType) return
    const parsed = []
    for (const [key, boolValue] of Object.entries(optionsObj)) {
      if (boolValue) {
        const result = Object.keys(optionsType).find(k => optionsType[k] === key)
        parsed.push(result)
      }
    }
    return parsed
  }
}

function sortPlacesByCostLevel(places, placeDetailsSkus) {
  return places.sort((a, b) => {
    const aSku = placeDetailsSkus.find(sku => a.update_category === sku.category)
    const bSku = placeDetailsSkus.find(sku => b.update_category === sku.category)
    return aSku.cost_level - bSku.cost_level
  })
}

export { Place, sortPlacesByCostLevel }
