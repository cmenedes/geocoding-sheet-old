import EventHandling from 'nyc-lib/nyc/EventHandling';
import proj4 from 'proj4'
import extend from 'ol/extent'
import Format from './Format'
import Feature from 'ol/Feature'

class SheetGeocoder extends EventHandling {
  constructor(options) {
    super()
    this.source = options.source
    this.projection = options.projection
    this.clear()
  }
  conf(conf) {
    this.format = Format.getFormat(conf)
    this.requestedFields = conf.requestedFields
  }
  clear() {
    if (this.source) this.source.clear()
    this.geocodeAll = false
    this.countDown = 0
    this.geocodedBounds = null
  }
  doGeocode(featureSource, feature) {
    if (feature) {
      const oldInput = feature.get('_input')
      const newInput = this.format.replace(this.format.locationTemplate, featureSource)
      return oldInput.trim() !== newInput.trim()
    }
    return true
  }
  getData(all) {
    this.geocodeAll = all === true
    google.script.run.withSuccessHandler($.proxy(this.gotData, this)).getData()
  }
  gotData(data) {
    const columns = data[0]
    if (this.geocodeAll) {
      this.countDown = data.length - 1
      this.source.clear()
      this.geocodedBounds = null
      this.trigger('batch-start', data)
    }
    data.forEach((row, i) => {
      if (i > 0) {
        const source = this.source
        const featureSource = {_row_index: i, _columns: columns, _row_data: row}
        let feature = source.getFeatureById(i)
        console.warn(i, source.getFeatures().length, feature);
        
        columns.forEach((c, col) => {
          featureSource[col] = row[c]
        })
        if (this.doGeocode(featureSource, feature)) {
          if (feature) source.removeFeature(feature)
          feature = new Feature(featureSource)
          feature.setId(i)
          feature.set('_interactive', !this.geocodeAll)
          source.addFeature(feature)
          feature.once('change', $.proxy(this.geocoded, this))
          this.format.setGeometry(feature, featureSource)
        }        
      }
    })
  }
  geocoded(event) {
    const feature = event.target;
    const geom = feature.getGeometry()
    const id = feature.getId()
    const data = {
      projected: this.projection && this.projection.length,
      row: feature.get('_row_index'),
      columns: feature.get('_columns'),
      cells: feature.get('_row_data'),
      geocodeResp: feature.get('_geocodeResp'),
      name: feature.get('_geocodeResp').name,
      requestedFields: this.requestedFields,
      interactive: feature.get('_interactive')
    }
    if (this.geocodeAll) this.countDown--
    if (geom) {
      const ext = geom.getExtent()
      const coords = geom.getCoordinates()
      const ll = proj4('EPSG:3857', 'EPSG:4326', coords)
      data.lat = ll[0]
      data.lng = ll[1]
      this.projected(data, coords)
      this.geocodedBounds = this.geocodedBounds ? extend(this.geocodedBounds, ext) : ext;
      this.trigger('geocoded', {feature, data})
    } else {
      this.trigger('ambiguous', {feature, data})
    }
    //errorCount()        
    if (this.geocodeAll && this.countDown === 0) {
      this.geocodeAll = false
      this.trigger('batch-end')
    }
    google.script.run.withSuccessHandler($.proxy(this.updateFeature, this)).geocoded(data)
  }
  projected(data, coords) {
    if (this.projection) {
      const xy = proj4('EPSG:3857', this.projection, coords);
      data.x = xy[0];
      data.y = xy[1];
    }
  }
  updateFeature(data) {
    const columns = data.columns
    for (let i = 0; i < columns.length; i++) {
      const key = columns[i]
      const val = data.cells[i]
      if (key || val) feature.set(key, val)
    }
  }
}

export default SheetGeocoder