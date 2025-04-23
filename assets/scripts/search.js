function getQueryVariable(variable) {
  var query = window.location.search.substring(1)
  var vars = query.split('&')

  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=')
    console.log(variable, query, vars, pair)

    if (pair[0] === variable) {
      const decodedUIri = decodeURIComponent(pair[1].replace(/\+/g, '%20'))
      console.log(decodedUIri.replaceAll(/\W\s/g, ' '))
      return decodedUIri.replaceAll(/\W\s/g, ' ')
    }
  }
}

function displaySearchResults(results, places) {
  var searchResults = document.getElementById('search-results')

  if (results.length) {
    // Are there any results?
    var appendString = ''

    results.forEach(result => {
      // Iterate over the results
      var place = places.find(place => place.id === result.ref)
      appendString += `
        <li>
          <a href="${place.slug}">${place.name}</a>
          <div class="location">${place.city}, ${place.stateAbbr}</div>
        </li>`
    })

    searchResults.innerHTML = appendString
  } else {
    searchResults.innerHTML = '<li>No results found</li>'
  }
}

// Move sursor to end of value text
function positionCursor(input) {
  input.focus()
  const valueLength = input.value.length
  input.setSelectionRange(valueLength, valueLength)
}

var searchTerm = getQueryVariable('query')
const searchBox = document.getElementById('search-box')

if (searchTerm) {
  searchBox.setAttribute('value', searchTerm)

  // Initalize lunr with the fields it will be searching on. I've given title
  // a boost of 10 to indicate matches on this field are more important.
  var idx = lunr(function () {
    this.ref('id')
    this.field('name')
    this.field('city')
    this.field('stateName')
    this.field('stateAbbr')
    this.field('slug')

    globalThis.Places.forEach(function (place) {
      // Add the data to lunr
      this.add(place)
    }, this)
  })

  var results = idx.search(searchTerm) // Get lunr to perform a search
  displaySearchResults(results, globalThis.Places) // We'll write this in the next section
}

positionCursor(searchBox)
