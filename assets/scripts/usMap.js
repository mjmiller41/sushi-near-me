const usMapStateLinks = document.querySelectorAll('#us-map .state')
const currentState = window.location.pathname.match(/^\/([a-z-]*)\/?.*/)
for (const link of usMapStateLinks) {
  // Disable states without places in list
  if (!globalThis.stateSlugs.includes(link.id)) {
    link.classList.add('isDisabled')
  }

  // Zoom selected link
  if (link.id === currentState[1]) {
    link.classList.add('zoom')
    link.parentNode.appendChild(link)
  }
}
