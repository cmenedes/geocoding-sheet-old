export default {
  getFormat(conf) {
    const format = new CvAddr({})
    if (conf.nyc) {
      const url = `${conf.geoclient.url}/search.json?app_id=${conf.geoclient.id}&app_key=${conf.geoclient.key}&input=`
      format.geocoder = new Geoclient({url})
    } else {
      format.geocoder = new CensusGeocoder()
    }
    return format
  }
}