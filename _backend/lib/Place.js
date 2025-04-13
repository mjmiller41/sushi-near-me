import { slugify } from './utils.js'

class Place {
  constructor(place) {
    // Places API - ID Only SKU: 5C36-E272-E88F
    this.place_id = place.place_id ?? place.id ?? null
    this.photos = place.photos ?? null
    // Places API - Essentials SKU: 6E05-E1C3-8D85
    this.address = place.formattedAddress ?? place.address
    const { street, city, state, zip, country } =
      this.extractAddressComponents()
    this.street = street ?? null
    this.city = city ?? null
    this.state = state ?? null
    this.zip = zip ?? null
    this.country = country ?? null
    this.neighborhood =
      this.getNeighborhood(place.addressComponents) ??
      place.neighborhood ??
      null
    this.latitude = place.location?.latitude ?? place.latitude ?? null
    this.longitude = place.location?.longitude ?? place.longitude ?? null
    // Places API - Pro SKU: 4ED6-464A-2AFC
    this.accessibility_options =
      place.accessibilityOptions ?? place.accessibility_options ?? null
    this.business_status = place.businessStatus ?? place.business_status ?? null
    this.name = place.displayName?.text ?? place.name ?? null
    this.google_maps_links =
      place.googleMapsLinks ?? place.google_maps_links ?? null
    this.primary_type =
      place.primaryTypeDisplayName?.text ?? place.primary_type ?? null
    this.opening_hours =
      {
        regular: place.regularOpeningHours?.weekdayDescriptions ?? null,
        current: place.currentOpeningHours?.weekdayDescriptions ?? null
      } ??
      place.opening_hours ??
      null
    this.secondary_opening_hours =
      {
        regular: {
          weekdayDescriptions:
            place.regularSecondaryOpeningHours?.weekdayDescriptions ?? null,
          type: place.regularSecondaryOpeningHours?.secondaryHoursType ?? null
        },
        current: {
          weekdayDescriptions:
            place.currentSecondaryOpeningHours?.weekdayDescriptions ?? null,
          type: place.currentSecondaryOpeningHours?.secondaryHoursType ?? null
        }
      } ??
      place.secondary_opening_hours ??
      null
    this.phone = place.nationalPhoneNumber ?? place.phone ?? null
    this.price_level = place.priceLevel ?? place.price_level ?? null
    this.price_range =
      this.parsePriceRange(place.priceRange) ?? place.price_range ?? null
    this.rating = place.rating ?? null
    this.rating_count =
      place.userRatingCount ?? place.rating_count ?? place.ratings_count ?? 0
    this.website = place.websiteUri ?? place.website ?? null
    // Places API - Atmosphere SKU: EB23-5ECC-F753
    this.description =
      place.editorialSummary?.text ??
      this.getGSummary(place.generativeSummary) ??
      place.description ??
      place.summary ??
      null
    this.reviews = place.reviews ?? null
    this.parking_options = place.parkingOptions ?? place.parking_options ?? null
    this.payment_options = place.paymentOptions ?? place.payment_options ?? null
    this.allow_dogs = place.allowDogs ?? place.allow_dogs ?? null
    this.curbside_pickup = place.curbsidePickup ?? place.curbside_pickup ?? null
    this.delivery = place.delivery ?? null
    this.dine_in = place.dineIn ?? place.dine_in ?? null
    this.good_for_children =
      place.goodForChildren ?? place.good_for_children ?? null
    this.good_for_groups = place.goodForGroups ?? place.good_for_groups ?? null
    this.good_for_sports =
      place.goodForWatchingSports ?? place.good_for_sports ?? null
    this.live_music = place.liveMusic ?? place.live_music ?? null
    this.menu_for_children =
      place.menuForChildren ?? place.menu_for_children ?? null
    this.outdoor_seating = place.outdoorSeating ?? place.outdoor_seating ?? null
    this.reservable = place.reservable ?? null
    this.restroom = place.restroom ?? null
    this.serves_beer = place.servesBeer ?? place.serves_beer ?? null
    this.serves_breakfast =
      place.servesBreakfast ?? place.serves_breakfast ?? null
    this.serves_brunch = place.servesBrunch ?? place.serves_brunch ?? null
    this.serves_cocktails =
      place.servesCocktails ?? place.serves_cocktails ?? null
    this.serves_coffee = place.servesCoffee ?? place.serves_coffee ?? null
    this.serves_dinner = place.servesDinner ?? place.serves_dinner ?? null
    this.serves_dessert = place.servesDessert ?? place.serves_dessert ?? null
    this.serves_lunch = place.servesLunch ?? place.serves_lunch ?? null
    this.serves_vegetarian_food =
      place.servesVegetarianFood ?? place.serves_vegetarian_food ?? null
    this.serves_wine = place.servesWine ?? place.serves_wine ?? null
    this.takeout = place.takeout ?? null
  }

  extractAddressComponents() {
    let street, city, state, zip, country
    if (this.address) {
      const regex = /(.+),\s(.+),\s([A-Z]{2})\s([0-9]{5}),\s([A-Z]+)/
      const match = this.address.match(regex)
      if (match && match.length === 6) {
        street = match[1]
        city = match[2]
        state = match[3]
        zip = match[4]
        country = match[5]
      }
    }
    return { street, city, state, zip, country }
  }

  getGSummary(g_summary) {
    return g_summary?.description?.text ?? g_summary?.overview?.text ?? null
  }

  getNeighborhood(components) {
    if (!components) return
    const obj = components.find(c => c.types.includes('neighborhood'))
    return obj?.longText ?? obj?.shortText ?? null
  }

  editedDirectionsUri(directionsUri) {
    if (!directionsUri) return
    return directionsUri.replace(
      "//''/",
      `/${this.latitude},${this.longitude}/''/`
    )
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
        const result = Object.keys(optionsType).find(
          k => optionsType[k] === key
        )
        parsed.push(result)
      }
    }
    return parsed
  }
}

export { Place }
