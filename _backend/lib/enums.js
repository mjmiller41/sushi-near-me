const PAYMENT_OPTIONS = Object.freeze({
  ACCEPTS_CREDIT_CARDS: 'acceptsCreditCards',
  ACCEPTS_DEBIT_CARDS: 'acceptsDebitCards',
  ACCEPTS_CASH_ONLY: 'acceptsCashOnly',
  ACCEPTS_NFC: 'acceptsNfc'
})

const BUSINESS_STATUS = Object.freeze({
  BUSINESS_STATUS_UNSPECIFIED: 'unspecified',
  OPERATIONAL: 'operational',
  CLOSED_TEMPORARILY: 'temporarily closed',
  CLOSED_PERMANENTLY: 'permanently closed'
})

const PRICE_LEVEL = Object.freeze({
  PRICE_LEVEL_UNSPECIFIED: '',
  PRICE_LEVEL_FREE: 'Free',
  PRICE_LEVEL_INEXPENSIVE: '$',
  PRICE_LEVEL_MODERATE: '$$',
  PRICE_LEVEL_EXPENSIVE: '$$$',
  PRICE_LEVEL_VERY_EXPENSIVE: '$$$$'
})

const SECONDARY_HOURS_TYPE = Object.freeze({
  SECONDARY_HOURS_TYPE_UNSPECIFIED: '',
  DRIVE_THROUGH: 'Drive-through hours',
  HAPPY_HOUR: 'The happy hours',
  DELIVERY: 'The delivery hours',
  TAKEOUT: 'The takeout hours',
  KITCHEN: 'The kitchen hours',
  BREAKFAST: 'The breakfast hours',
  LUNCH: 'The lunch hours',
  DINNER: 'The dinner hours',
  BRUNCH: 'The brunch hours',
  PICKUP: 'The pickup hours',
  ACCESS: 'The access hours for storage places.',
  SENIOR_HOURS: 'The special hours for seniors.',
  ONLINE_SERVICE_HOURS: 'The online service hours.'
})

const PARKING_OPTIONS = Object.freeze({
  FREE_PARKING_LOT: 'freeParkingLot',
  PAID_PARKING_LOT: 'paidParkingLot',
  FREE_STREET_PARKING: 'freeStreetParking',
  PAID_STREET_PARKING: 'paidStreetParking',
  VALET_PARKING: 'valetParking',
  FREE_GARAGE_PARKING: 'freeGarageParking',
  PAID_GARAGE_PARKING: 'paidGarageParking'
})

const ACCESSIBILITY_OPTIONS = Object.freeze({
  ACCESSABLE_PARKING: 'wheelchairAccessibleParking',
  ACCESSABLE_ENTRANCE: 'wheelchairAccessibleEntrance',
  ACCESSABLE_RESTROOM: 'wheelchairAccessibleRestroom',
  ACCESSABLE_SEATING: 'wheelchairAccessibleSeating'
})

const ADDRESS_COMPONENT_TYPES = Object.freeze({
  STREET_ADDRESS: 'street_address', // indicates a precise street address.
  ROUTE: 'route', // indicates a named route (such as "US 101").
  INTERSECTION: 'intersection', // indicates a major intersection, usually of two major roads.
  POLITICAL: 'political', // indicates a political entity. Usually, this type indicates a polygon of some civil administration.
  COUNTRY: 'country', // indicates the national political entity, and is typically the highest order type returned by the Geocoder.
  ADMINISTRATIVE_AREA_LEVEL_1: 'administrative_area_level_1', // indicates a first-order civil entity below the country level. Within the United States, these administrative levels are states. Not all nations exhibit these administrative levels. In most cases, administrative_area_level_1 short names will closely match ISO 3166-2 subdivisions and other widely circulated lists; however this is not guaranteed as our geocoding results are based on a variety of signals and location data.
  ADMINISTRATIVE_AREA_LEVEL_2: 'administrative_area_level_2', // indicates a second-order civil entity below the country level. Within the United States, these administrative levels are counties. Not all nations exhibit these administrative levels.
  ADMINISTRATIVE_AREA_LEVEL_3: 'administrative_area_level_3', // indicates a third-order civil entity below the country level. This type indicates a minor civil division. Not all nations exhibit these administrative levels.
  ADMINISTRATIVE_AREA_LEVEL_4: 'administrative_area_level_4', // indicates a fourth-order civil entity below the country level. This type indicates a minor civil division. Not all nations exhibit these administrative levels.
  ADMINISTRATIVE_AREA_LEVEL_5: 'administrative_area_level_5', // indicates a fifth-order civil entity below the country level. This type indicates a minor civil division. Not all nations exhibit these administrative levels.
  ADMINISTRATIVE_AREA_LEVEL_6: 'administrative_area_level_6', // indicates a sixth-order civil entity below the country level. This type indicates a minor civil division. Not all nations exhibit these administrative levels.
  ADMINISTRATIVE_AREA_LEVEL_7: 'administrative_area_level_7', // indicates a seventh-order civil entity below the country level. This type indicates a minor civil division. Not all nations exhibit these administrative levels.
  COLLOQUIAL_AREA: 'colloquial_area', // indicates a commonly-used alternative name for the entity.
  LOCALITY: 'locality', // indicates an incorporated city or town political entity.
  SUBLOCALITY: 'sublocality', // indicates a first-order civil entity below a locality. For some locations may receive one of the additional types
  SUBLOCALITY: 'sublocaility', // indicates a first-order civil entity below a locality. For some locations may receive one of the additional types",
  // Each sublocality level is a civil entity. Larger numbers indicate a smaller geographic area.
  SUBLOCALITY_LEVEL_1: 'sublocality_level_1',
  SUBLOCALITY_LEVEL_2: 'sublocality_level_2',
  SUBLOCALITY_LEVEL_3: 'sublocality_level_3',
  SUBLOCALITY_LEVEL_4: 'sublocality_level_4',
  SUBLOCALITY_LEVEL_5: 'sblocality_level_5',
  NEIGHBORHOOD: 'neighborhood', // indicates a named neighborhood.
  PREMISE: 'premise', // indicates a named location, usually a building or collection of buildings with a common name.
  SUBPREMISE: 'subpremise', // indicates an addressable entity below the premise level, such as an apartment, unit, or suite.
  PLUS_CODE: 'plus_code', // indicates an encoded location reference, derived from latitude and longitude. Plus codes can be used as a replacement for street addresses in places where they do not exist (where buildings are not numbered or streets are not named). See https://plus.codes for details.
  POSTAL_CODE: 'postal_code', // indicates a postal code as used to address postal mail within the country.
  NATURAL_FEATURE: 'natural_feature', // indicates a prominent natural feature.
  AIRPORT: 'airport', // indicates an airport.
  PARK: 'park', // indicates a named park.
  POINT_OF_INTEREST: 'point_of_interest', // indicates a named point of interest. Typically, these "POI"s are prominent local entities that don't easily fit in another category, such as "Empire State Building" or "Eiffel Tower".
  FLOOR: 'floor', // indicates the floor of a building address.
  ESTABLISHMENT: 'establishment', // typically indicates a place that has not yet been categorized.
  LANDMARK: 'landmark', // indicates a nearby place that is used as a reference, to aid navigation.
  POINT_OF_INTEREST: 'point_of_interest', // indicates a named point of interest.
  PARKING: 'parking', // indicates a parking lot or parking structure.
  POST_BOX: 'post_box', // indicates a specific postal box.
  POSTAL_TOWN: 'postal_town', // indicates a grouping of geographic areas, such as locality and sublocality, used for mailing addresses in some countries
  ROOM: 'room', // indicates the room of a building address.
  STREET_NUMBER: 'street_number', // indicates the precise street number.
  BUS_STATION: 'bus_station',
  TRAIN_STATION: 'train_station',
  TRANSIT_STATION: 'transit_station' // indicate the location of a bus, train or public transit stop.
})

export {
  PAYMENT_OPTIONS,
  BUSINESS_STATUS,
  PRICE_LEVEL,
  SECONDARY_HOURS_TYPE,
  PARKING_OPTIONS,
  ACCESSIBILITY_OPTIONS,
  ADDRESS_COMPONENT_TYPES
}
