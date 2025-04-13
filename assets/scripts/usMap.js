---
---
const statePages = {{ site.states | jsonify }}
const mapStateLinks = document.querySelectorAll('#us-map .state')
const statePageSlugs = statePages.map(state=>state.slug)
const currentState = window.location.pathname.match(/^\/([a-z-]*)\/?.*/)
for (const link of mapStateLinks){
  // Disable states without places in list
  if (!statePageSlugs.includes(link.id)) {
    link.classList.add("isDisabled")
  }
  
  // Zoom selected link
  if (link.id === currentState[1]){
    link.classList.add('zoom')
    link.parentNode.appendChild(link)
  }
}
