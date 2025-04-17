function createCookie(name, value, days) {
  var expires = ''
  if (days) {
    var date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = '; expires=' + date.toUTCString()
  }
  document.cookie = name + '=' + value + expires + '; path=/'
}

function readCookie(name) {
  var nameEQ = name + '='
  var ca = document.cookie.split(';')
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) == ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}
function eraseCookie(name) {
  createCookie(name, '', -1)
}

if (readCookie('cookie-notice-dismissed') == 'true') {
  var bodyTag = document.getElementsByTagName('body')[0]
  bodyTag.append(`
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-9Q8C2EW976"></script>
  <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-9Q8C2EW976');
  </script>`)
  var headTag = document.getElementsByTagName('head')[0]
  headTag.append(`
  <meta name="google-adsense-account" content="ca-pub-1542262851763938">
  <script
    async
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1542262851763938"
    crossorigin="anonymous"></script>`)
} else {
  document.getElementById('cookie-notice').style.display = 'flex'
}
document.getElementById('accept').addEventListener('click', function () {
  createCookie('cookie-notice-dismissed', 'true', 31)
  document.getElementById('cookie-notice').style.display = 'none'
  location.reload()
})
