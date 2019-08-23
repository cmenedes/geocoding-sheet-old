import Dialog from 'nyc-lib/nyc/Dialog'
import EventHandling from 'nyc-lib/nyc/EventHandling';
import proj4 from 'proj4'
import extend from 'ol/extent'
import Format from './Format'

class SheetGeocoder extends EventHandling {
  constructor(options) {
    super()
    this.source = options.source
    this.projection = options.projection
    this.dialog = new Dialog()
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
      const newInput = format.replace(format.locationTemplate, featureSource)
      return oldInput !== newInput
    }
    return true
  }
  getData(all) {
    geocodeAll = all
    update()
    if (conf.valid()) {
      google.script.run.withSuccessHandler($.proxy(this.gotData, this)).getData()
    } else if (geocodeAll) {
      this.dialog.ok({message: 'Please complete the configuration'})
    }
  }
  gotData(data) {
    const columns = data[0]
    if (geocodeAll) {
      this.countDown = data.length - 1
      this.source.clear()
      this.geocodedBounds = null
      this.trigger('batch-start', data)
      //$('#review').html('<option value="-1">Review 0 Failures</options>');
    }
    data.forEach((i, row) => {
      const feature = feature = source.getFeatureById(i)
      const featureSource = {_row_index: i, _columns: columns, _row_data: row}
      columns.forEach((c, col) => {
        featureSource[col] = row[c]
      })
      if (this.doGeocode(featureSource, feature)) {
      if (feature) source.removeFeature(feature)
        feature = new ol.Feature(featureSource)
        feature.setId(i)
        feature.set('_interactive', !geocodeAll)
        source.addFeature(feature)
        feature.once('change', geocoded)
        format.setGeometry(feature, featureSource)
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
      requestedFields: this.requestedFields,
      interactive: feature.get('_interactive')
    }
    if (geocodeAll) this.countDown--
    if (geom) {
      const ext = geom.getExtent()
      const coords = geom.getCoordinates()
      const ll = proj4('EPSG:3857', 'EPSG:4326', coords)
      data.lat = ll[0]
      data.lng = ll[1]
      this.projected(data, coords)
      this.geocodedBounds = this.geocodedBounds ? extend(this.geocodedBounds, ext) : ext;
      this.trigger('geocoded', {feature, data})
      //$('#review option[value="' + id + '"]').remove();
    } else {
      this.trigger('ambiguos', {feature, data})
      /*
      if (data.geocodeResp && data.geocodeResp.possible) {
        var result = data.geocodeResp;
        var opt = $('#review option[value="' + id + '"]');
        var row = id + 1;
        var optHtml = '(' + row + ') ' + result.input;
        if (!opt.length) {
          $('#review').append(
            $('<option></option>').data('feature', feature)
              .html(optHtml)
              .attr('title', 'Row ' + row).val(id)
          );
        } else {
          opt.html(optHtml);
        }
      }
      */
    }
    //errorCount()        
    if (this.geocodeAll && this.countDown === 0) {
      this.geocodeAll = false
      this.trigger('batch-end')
      //map.getView().fit(this.geocodedBounds, {size: map.getSize(), duration: 500});
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