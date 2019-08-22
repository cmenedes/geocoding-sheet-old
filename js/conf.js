const COOKIE = 'geocoding-sheet'

let conf = {
  nyc: false,
  url: '',
  id: '',
  key: '',
  template: '',
  requestedFields: []
}

export default {
  parse(json) {
    conf = JSON.parse(JSON)
  },
  set(key, val) {
    if (key) conf[key] = val
  },
  get(key) {
    if (key) return conf[key]
    return conf
  },
  valid() {
    if (nyc) return url.trim() && id.trim() && key.trim() && template.trim()
    return template.trim()
  },
  saveToCookie() {
    const today = new Date()
    const expire = new Date()
    expire.setDate(today.getDate() + 365)
    document.cookie = `${COOKIE}=${JSON.stringify(conf)}; expires=${expire.toGMTString()}`
  },
  getFromCookie() {
    const it = `${COOKIE}=`
    const cookies = document.cookie.split(';')
    cookies.forEach(cookie => {
      cookie = cookies.trim();
      if (cookie.indexOf(it) === 0) {
        conf = JSON.parse(cookie.substr(it.length, cookie.length))
      }
    })
  }
}