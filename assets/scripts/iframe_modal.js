// Ensure dialog dimensions match device aspect ratio
function setDialogDimensions() {
  const dialogContent = document.getElementById('dialog-content')
  const windowAspectRatio = window.innerWidth / window.innerHeight
  const maxWidth = Math.min(window.innerWidth * 0.9, window.innerWidth)
  const maxHeight = Math.min(window.innerHeight * 0.8, window.innerHeight)
  let width = maxWidth
  let height = width / windowAspectRatio

  if (height > maxHeight) {
    height = maxHeight
    width = height * windowAspectRatio
  }

  dialogContent.style.width = `${width}px`
  dialogContent.style.height = `${height}px`
}

// Open dialog with supplied URL
function openDialog(url) {
  const dialog = document.getElementById('dialog-modal')
  const iframe = document.getElementById('dialog-iframe')
  setDialogDimensions()
  iframe.src = url
  dialog.style.display = 'block'
  document.body.style.overflow = 'hidden' // Prevent background scroll
  // Store initial state to prevent iframe history affecting parent
  history.replaceState(null, '', window.location.href)
}

// Close dialog
function closeDialog() {
  const dialog = document.getElementById('dialog-modal')
  const iframe = document.getElementById('dialog-iframe')
  dialog.style.display = 'none'
  iframe.src = 'about:blank' // Clear iframe to reset history
  document.body.style.overflow = '' // Restore background scroll
  // Ensure parent history is unaffected
  history.replaceState(null, '', window.location.href)
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Close button
  document.getElementById('close-dialog').addEventListener('click', closeDialog)

  // Outside click
  document.getElementById('dialog-modal').addEventListener('click', event => {
    if (event.target === event.currentTarget) {
      closeDialog()
    }
  })

  // Escape key
  document.addEventListener('keydown', event => {
    if (
      event.key === 'Escape' &&
      document.getElementById('dialog-modal').style.display === 'block'
    ) {
      closeDialog()
    }
  })

  // Resize handler for responsiveness
  window.addEventListener('resize', setDialogDimensions)

  // Prevent iframe navigation from affecting parent history
  const iframe = document.getElementById('dialog-iframe')
  iframe.addEventListener('load', () => {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
      // Ensure all links in iframe stay within iframe
      const links = iframeDoc.getElementsByTagName('a')
      for (let link of links) {
        link.setAttribute('target', '_self')
      }
    } catch (e) {
      // Handle cross-origin restrictions
      console.warn('Cannot access iframe content due to cross-origin restrictions')
    }
  })
})

// Expose openDialog globally for Jekyll include
window.openDialog = openDialog
