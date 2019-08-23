const COOKIE = 'geocoding-sheet'

const conf = {
  nyc: true,
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
  let result = false
  if (conf.nyc) {
    result = conf.url.trim() !== '' && 
    conf.id.trim() !== '' && 
    conf.key.trim() !== '' && 
    conf.template.trim() !== ''
  } else {
    result = conf.template.trim() !== ''
  }
  console.warn(conf);
  return result
}

const saveToCookie = () => {
  const today = new Date()
  const expire = new Date()
  expire.setDate(today.getDate() + 365)
  console.warn('saving',`${COOKIE}=${JSON.stringify(conf)}; expires=${expire.toGMTString()}`);
  document.cookie = `${COOKIE}=${JSON.stringify(conf)}; expires=${expire.toGMTString()}`
}

const getSaved = () => {
  const it = `${COOKIE}=`
  const cookies = document.cookie.split(';')
  cookies.forEach(cookie => {
    cookie = cookie.trim();
    if (cookie.indexOf(it) === 0) {
      const savedConf = JSON.parse(cookie.substr(it.length, cookie.length))
      console.warn('fromcookie',savedConf);
      Object.keys(savedConf).forEach(key => {
        conf[key] = savedConf[key]
      })
    }
  })
  console.warn('reconstituting',conf);
  return conf
}

export default {get, set, valid, getSaved}