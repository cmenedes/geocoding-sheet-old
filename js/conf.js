const COOKIE = 'geocoding-sheet'

let conf = {
  nyc: false,
  url: '',
  id: '',
  key: '',
  template: '',
  requestedFields: []
}

const set = (key, val) => {
  if (key) conf[key] = val
  if (valid()) saveToCookie()
}

const get = (key) => {
  if (key) return conf[key]
  return conf
}

const valid = () => {
  return nyc ? url.trim() && id.trim() && key.trim() && template.trim() : template.trim() !== ''
}

const saveToCookie = () => {
  const today = new Date()
  const expire = new Date()
  expire.setDate(today.getDate() + 365)
  document.cookie = `${COOKIE}=${JSON.stringify(conf)}; expires=${expire.toGMTString()}`
}

const getFromCookie = () => {
  const it = `${COOKIE}=`
  const cookies = document.cookie.split(';')
  cookies.forEach(cookie => {
    cookie = cookie.trim();
    if (cookie.indexOf(it) === 0) {
      conf = JSON.parse(cookie.substr(it.length, cookie.length))
    }
  })
  return conf
}

export default {get, set, valid, getFromCookie}