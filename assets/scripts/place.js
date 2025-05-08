const collapsables = document.querySelectorAll('.collapsable')

function toggleExpand(event) {
  event.preventDefault()
  const target = event.currentTarget
  collapsables.forEach(el => {
    if (el === target) {
      target.classList.toggle('expand')
    } else el.classList.remove('expand')
  })
  // Wait 0.251 seconds for css transition
  setTimeout(function () {
    target.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, 251)
}

let pageWidth = window.innerWidth
function setToggleEvent() {
  if (pageWidth < 640) {
    for (const el of collapsables) {
      el.addEventListener('click', toggleExpand)
    }
  }
}

window.addEventListener('resize', function () {
  pageWidth = window.innerWidth
  setToggleEvent()
})

setToggleEvent()
