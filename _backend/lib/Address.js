class Address {
  constructor(addressComponents) {
    this.neighborhood = null
    this.housenumber = null
    this.street_short = null
    this.street_long = null
    this.city = null
    this.state = null
    this.postcode = null
    this.country = null
    this.parseAddress(addressComponents)
  }

  parseAddress(addrComponents) {
    if (!addrComponents) return
    for (const component of addrComponents) {
      if (component.types.includes('neighborhood')) {
        this.neighborhood = component.shortText
      }
      if (component.types.includes('street_number')) {
        this.housenumber = component.shortText
      }
      if (component.types.includes('route')) {
        this.street_short = component.shortText
      }
      if (component.types.includes('route')) {
        this.street_long = component.longText
      }
      if (component.types.includes('locality')) {
        this.city = component.shortText
      }
      if (component.types.includes('administrative_area_level_1')) {
        this.state = component.shortText
      }
      if (component.types.includes('postal_code')) {
        this.postcode = component.shortText
      }
      if (component.types.includes('country')) {
        this.country = component.shortText
      }
    }
  }
}

export { Address }
