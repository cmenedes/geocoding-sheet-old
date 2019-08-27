import App from '../src/js/App'
import LocalStorage from 'nyc-lib/nyc/LocalStorage'
import Tabs from 'nyc-lib/nyc/Tabs'
import Choice from 'nyc-lib/nyc/Choice'
import Geoclient from 'nyc-lib/nyc/Geoclient'
import CensusGeocoder from 'nyc-lib/nyc/CensusGeocoder'
import Basemap from 'nyc-lib/nyc/ol/Basemap'
import LocationMgr from 'nyc-lib/nyc/ol/LocationMgr'
import Popup from 'nyc-lib/nyc/ol/Popup'
import SheetGeocoder from '../src/js/SheetGeocoder'
import Conf from '../src/js/Conf'
import layer from '../src/js/layer'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import proj4 from 'proj4'

const confNyc = {
  nyc: true,
  template: 'mock-template',
  url: 'mock-geoclient-url',
  id: 'mock-id',
  key: 'mock-key',
  requestedFields: [App.POSSIBLE_FIELDS[1], App.POSSIBLE_FIELDS[100]]
}

const confCensus = {
  nyc: false,
  template: 'mock-template',
  url: '',
  id: '',
  key: '',
  requestedFields: []
}

const confInvalid = {
  nyc: false,
  template: '',
  requestedFields: []
}

const getSaved = Conf.getSaved

beforeEach(() => {
  Conf.getSaved = () => {return Conf.get()}
  Object.keys(confNyc).forEach(key => {
    Conf.set(key, confNyc[key])
  })
})

afterEach(() => {
  Conf.getSaved = getSaved
})

describe('constructor', () => {
  const geoclientUrl = App.prototype.geoclientUrl
  const setConfigValues = App.prototype.setConfigValues
  const hookup = App.prototype.hookup
  beforeEach(() => {
    App.prototype.geoclientUrl = () => {return 'mock-geoclient-url'}
    App.prototype.setConfigValues = jest.fn()
    App.prototype.hookup = jest.fn()
  })
  afterEach(() => {
    App.prototype.geoclientUrl = geoclientUrl
    App.prototype.setConfigValues = setConfigValues
    App.prototype.hookup = hookup
  })

  test('constructor', () => {
    expect.assertions(1609)

    const app = new App()

    const layers = app.map.getLayers().getArray()

    expect(app instanceof App).toBe(true)
    expect(app.geoclient instanceof Geoclient).toBe(true)
    expect(app.geoclient.url).toBe('mock-geoclient-url&input=')
    expect(app.census instanceof CensusGeocoder).toBe(true)
    expect(app.map instanceof Basemap).toBe(true)
    expect(app.base).toBe(app.map.getBaseLayers().base)
    expect(app.label).toBe(app.map.getBaseLayers().labels.base)
    
    expect(layers[15]).toBe(app.osm)
    expect(layers[16]).toBe(layer)
    
    expect(app.popup instanceof Popup).toBe(true)
    
    expect(app.sheetGeocoder instanceof SheetGeocoder).toBe(true)
    expect(app.sheetGeocoder.source).toBe(layer.getSource())
    
    expect(app.locationMgr instanceof LocationMgr).toBe(true)
    expect(app.locationMgr.locator.geocoder).toBe(app.census)
    expect(app.locationMgr.mapLocator.map).toBe(app.map)
    
    expect(app.geoApi instanceof Choice).toBe(true)
    expect(app.geoApi.val().length).toBe(1)
    expect(app.geoApi.val()[0].name).toBe('geo-api')
    expect(app.geoApi.val()[0].label).toBe('NYC Geoclient')
    expect(app.geoApi.val()[0].values.length).toBe(1)
    expect(app.geoApi.val()[0].values[0]).toBe('nyc')
    expect(app.geoApi.choices[0].values[0]).toBe(app.geoApi.val()[0].values[0])
    expect(app.geoApi.choices[1].values[0]).toBe('census')

    expect(app.onInterval instanceof Choice).toBe(true)
    expect(app.onInterval.val().length).toBe(0)

    expect(app.geoFields.choices.length).toBe(App.POSSIBLE_FIELDS.length)
    
    App.POSSIBLE_FIELDS.forEach((f, i) => {
      expect(app.geoFields.choices[i].name).toBe(f)
      expect(app.geoFields.choices[i].label).toBe(f)
      expect(app.geoFields.choices[i].values.length).toBe(1)
      expect(app.geoFields.choices[i].values[0]).toBe(f)
      expect($('#geo-fields label').get(i).title).toBe(f)
    })
    
    expect(app.tabs instanceof Tabs).toBe(true)
    expect(app.tabs.container.find('.tab').length).toBe(2)
    expect(app.tabs.container.find('.tab').length).toBe(2)
    expect(app.tabs.active.length).toBe(1)
    expect(app.tabs.active.get(0)).toBe($('#tab-conf').get(0))
  
    expect(app.setConfigValues).toHaveBeenCalledTimes(1)
    expect(app.setConfigValues.mock.calls[0][0]).toBe(Conf.get())
    
    expect(app.hookup).toHaveBeenCalledTimes(1)
  })
})

test('setConfigValues (called from constructor)', () => {
  expect.assertions(8)

  const app = new App()

  expect(app.geoFields.val().length).toBe(2)
  expect(app.geoFields.val()[0].values[0]).toBe(App.POSSIBLE_FIELDS[1])
  expect(app.geoFields.val()[1].values[0]).toBe(App.POSSIBLE_FIELDS[100])

  expect($('#template').val()).toBe('mock-template')
  expect($('#url').val()).toBe('mock-geoclient-url')
  expect($('#id').val()).toBe('mock-id')
  expect($('#key').val()).toBe('mock-key')
  
  expect(app.geoApi.val()[0].values[0]).toBe('nyc')
})

describe('hookup', () => {
  const update = App.prototype.update
  const review = App.prototype.review
  const download = App.prototype.download
  const setMapSize = App.prototype.setMapSize
  const showPopup = App.prototype.showPopup
  const opt = $('<option value="1"></option>')
  beforeEach(() => {
    App.prototype.update = jest.fn()
    App.prototype.review = jest.fn()
    App.prototype.download = jest.fn()
    App.prototype.setMapSize = jest.fn()
    App.prototype.showPopup = jest.fn()
  })
  afterEach(() => {
    App.prototype.update = update
    App.prototype.review = review
    App.prototype.download = download
    App.prototype.setMapSize = setMapSize
    App.prototype.showPopup = showPopup
    opt.remove()
  })

  test('hookup (called from constructor)', () => {
    expect.assertions(16)

    const app = new App()

    $('#review').append(opt)
    expect(app.review).toHaveBeenCalledTimes(0)

    app.sheetGeocoder.getData = jest.fn()
    app.sheetGeocoder.clear = jest.fn()

    app.geoFields.trigger('change')
    expect(app.update).toHaveBeenCalledTimes(2)
    
    app.geoApi.trigger('change')
    expect(app.update).toHaveBeenCalledTimes(3)

    $('#geocode').trigger('click')
    expect(app.sheetGeocoder.getData).toHaveBeenCalledTimes(1)
    expect(app.sheetGeocoder.getData.mock.calls[0][0]).toBe(true)

    $('#reset').trigger('click')
    expect(app.sheetGeocoder.clear).toHaveBeenCalledTimes(1)

    $('#review').trigger('change')
    expect(app.review).toHaveBeenCalledTimes(1)
    $('.pop .btn-x').trigger('click')
    expect(app.review).toHaveBeenCalledTimes(3) // why no 2

    expect($('#review option').length).toBe(2)
    app.sheetGeocoder.trigger('geocoded', {feature: {getId: () => {return 0}}})
    expect($('#review option').length).toBe(2)
    app.sheetGeocoder.trigger('geocoded', {feature: {getId: () => {return 1}}})
    expect($('#review option').length).toBe(1)
  
    $('#download').trigger('click')
    expect(app.download).toHaveBeenCalledTimes(1)

    $($('#tab-conf input').get(0)).trigger('keyup')
    expect(app.update).toHaveBeenCalledTimes(4)
  
    $(window).trigger('resize')
    expect(app.setMapSize).toHaveBeenCalledTimes(1)
  
    // why no call setMapSize
    // $(app.tabs).trigger('change')
    // expect(app.setMapSize).toHaveBeenCalledTimes(2)
  
    app.locationMgr.trigger('geocoded', 'mock-location')
    expect(app.showPopup).toHaveBeenCalledTimes(1)
    expect(app.showPopup.mock.calls[0][0]).toBe('mock-location')
  })
})

describe('setMapSize', () => {
  test('setMapSize has map', () => {
    expect.assertions(2)
  
    const app = new App()
  
    expect(app.map.getSize()).toEqual([NaN, NaN])
  
    $('#map').width(400)
    $('#map').height(600)
    app.setMapSize()
  
    expect(app.map.getSize()).toEqual([400, 600])
  })
  test('setMapSize no map', () => {
    expect.assertions(0)
    const app = new App()
    delete app.map
    app.setMapSize()
  })
})

describe('update', () => {
  const setup = App.prototype.setup
  beforeEach(() => {
    App.prototype.setup = jest.fn()
  })
  afterEach(() => {
    App.prototype.setup = setup
  })
  test('update', () => {
    expect.assertions(17)

    const app = new App()

    $('.gc').each((i, n) => {
      expect($(n).css('display')).not.toBe('none')
    })

    $('#template').val('diff-template').trigger('change')
    $('#url').val('diff-url').trigger('change')
    $('#id').val('diff-url').trigger('change')
    $('#url').val('diff-url').trigger('change')
    app.geoApi.val([app.geoApi.choices[1]])
    app.geoApi.trigger('change')
    app.geoFields.val([app.geoFields.choices[2], app.geoFields.choices[20]])
    app.geoFields.trigger('change')

    const conf = Conf.get()
    expect(conf.nyc).toBe(false)

    $('.gc').each((i, n) => {
      expect($(n).css('display')).toBe('none')
    })
  })
})

describe('setup', () => {
  const setup = App.prototype.setup
  const clear = SheetGeocoder.prototype.clear
  const conf = SheetGeocoder.prototype.conf

  beforeEach(() => {
    App.prototype.setup = jest.fn()
    SheetGeocoder.prototype.clear = jest.fn()
    SheetGeocoder.prototype.conf = jest.fn()
  })
  afterEach(() => {
    App.prototype.setup = setup
    SheetGeocoder.prototype.clear = clear
    SheetGeocoder.prototype.conf = conf
  })

  test('setup is valid and is nyc', () => {
    expect.assertions(9)

    const app = new App()
    
    expect(app.sheetGeocoder.clear).toHaveBeenCalledTimes(1)
    
    app.setup = setup
    app.setup()

    expect(app.base.getVisible()).toBe(true)
    expect(app.label.getVisible()).toBe(true)
    expect(app.osm.getVisible()).toBe(false)

    expect(app.sheetGeocoder.clear).toHaveBeenCalledTimes(2)
    expect(app.sheetGeocoder.projection).toBe('EPSG:2263')
    expect(app.sheetGeocoder.conf).toHaveBeenCalledTimes(1)
    expect(app.locationMgr.locator.geocoder).toBe(app.geoclient)
    expect(app.geoclient.url).toBe('mock-geoclient-url/search.json?app_id=mock-id&app_key=mock-key&input=')
  })

  test('setup is valid and is not nyc', () => {
    expect.assertions(9)

    Object.keys(confCensus).forEach(key => {
      Conf.set(key, confCensus[key])
    })
    
    const app = new App()
    
    expect(app.sheetGeocoder.clear).toHaveBeenCalledTimes(1)
    
    app.setup = setup
    app.setup()

    expect(app.base.getVisible()).toBe(false)
    expect(app.label.getVisible()).toBe(false)
    expect(app.osm.getVisible()).toBe(true)

    expect(app.sheetGeocoder.clear).toHaveBeenCalledTimes(2)
    expect(app.sheetGeocoder.projection).toBe('')
    expect(app.sheetGeocoder.conf).toHaveBeenCalledTimes(1)
    expect(app.locationMgr.locator.geocoder).toBe(app.census)
    expect(app.geoclient.url).toBe('/search.json?app_id=&app_key=&input=')
  })

  test('setup not valid', () => {
    expect.assertions(9)

    Conf.set('template', '')
    Conf.set('url', 'a-url')

    const app = new App()
    
    expect(app.sheetGeocoder.clear).toHaveBeenCalledTimes(1)
    
    app.setup = setup
    app.setup()

    expect(app.base.getVisible()).toBe(true)
    expect(app.label.getVisible()).toBe(true)
    expect(app.osm.getVisible()).toBe(false)

    expect(app.sheetGeocoder.clear).toHaveBeenCalledTimes(1)
    expect(app.sheetGeocoder.projection).toBeUndefined()
    expect(app.sheetGeocoder.conf).toHaveBeenCalledTimes(0)
    
    expect(app.locationMgr.locator.geocoder).toBe(app.census)
    expect(app.geoclient.url).toBe('a-url/search.json?app_id=mock-id&app_key=mock-key&input=&input=')
  })
})

describe('showPopup', () => {
  const correctSheet = App.prototype.correctSheet
  const show = Popup.prototype.show
  const hide = Popup.prototype.hide
  const feature = new Feature({_geocodeResp: {input: 'failed'}})
  let opt
  beforeEach(() => {
    opt = $('<option value="1"></option>').data('feature', feature)
    feature.setId(1)
    App.prototype.correctSheet = jest.fn()
    Popup.prototype.show = jest.fn()
    Popup.prototype.hide = jest.fn()
  })
  afterEach(() => {
    App.prototype.correctSheet = correctSheet
    Popup.prototype.show = show
    Popup.prototype.hide = hide
    opt.remove()
  })

  test('showPopup has feature with failed geocode', () => {
    expect.assertions(7)

    const data = {name: 'fred', coordinate: 'mock-coord'}
    
    const app = new App()

    $('#review').append(opt).val(1)
    $('.srch-ctl input').data('last-search', 'failed')
   
    app.showPopup(data)

    expect(app.popup.show).toHaveBeenCalledTimes(1)
    expect(app.popup.show.mock.calls[0][0].coordinate).toBe('mock-coord')
    expect(app.popup.show.mock.calls[0][0].html.html()).toBe('<h3>fred</h3><div></div><button class="update btn rad-all">Update row 2</button>')

    app.popup.show.mock.calls[0][0].html.find('button').trigger('click')

    expect(app.correctSheet).toHaveBeenCalledTimes(1)
    expect(app.correctSheet.mock.calls[0][0]).toBe(feature)
    expect(app.correctSheet.mock.calls[0][1]).toBe(data)

    expect(app.popup.hide).toHaveBeenCalledTimes(1)
  })

  test('showPopup has feature no failed geocode', () => {
    expect.assertions(3)

    const data = {name: 'fred', coordinate: 'mock-coord'}
    
    const app = new App()

    feature.set('_geocodeResp', {input: 'success'})
    $('#review').append(opt).val(1)    
    $('.srch-ctl input').data('last-search', 'something else')
   
    app.showPopup(data)

    expect(app.popup.show).toHaveBeenCalledTimes(0)
    expect(app.correctSheet).toHaveBeenCalledTimes(0)
    expect(app.popup.hide).toHaveBeenCalledTimes(0)
  })

  test('showPopup no feature', () => {
    expect.assertions(3)

    const data = {name: 'fred', coordinate: 'mock-coord'}
    
    const app = new App()

    $('#review').append(opt).val('not-the-one')
    $('.srch-ctl input').data('last-search', 'failed')
   
    app.showPopup(data)

    expect(app.popup.show).toHaveBeenCalledTimes(0)
    expect(app.correctSheet).toHaveBeenCalledTimes(0)
    expect(app.popup.hide).toHaveBeenCalledTimes(0)
  })
})

describe('requestedFields', () => {
  test('requestedFields is nyc', () => {
    expect.assertions(3)

    const app = new App()

    const fields = app.requestedFields()

    expect(fields.length).toBe(2)
    expect(fields[0]).toBe(App.POSSIBLE_FIELDS[1])
    expect(fields[1]).toBe(App.POSSIBLE_FIELDS[100])
  })
  test('requestedFields not nyc', () => {
    expect.assertions(1)

    Conf.set('nyc', false)

    const app = new App()

    const fields = app.requestedFields()

    expect(fields.length).toBe(0)
  })
})

describe('review', () => {
  const feature = new Feature({_geocodeResp: {input: 'failed'}})
  let opt
  beforeEach(() => {
    opt = $('<option value="1"></option>').data('feature', feature)
  })

  test('review has feature', () => {
    expect.assertions(5)

    const app = new App()
    
    app.locationMgr.locator.geocoder.search = jest.fn()

    $('#review').append(opt).val(1)

    expect($('.srch-ctl input').val()).toBe('')
    expect($('.srch-ctl input').data('last-search')).toBeUndefined()

    app.review()

    expect($('.srch-ctl input').val()).toBe('failed')
    expect($('.srch-ctl input').data('last-search')).toBe('failed')
    expect(app.locationMgr.locator.geocoder.search).toHaveBeenCalledTimes(1)
  })

  test('review no feature', () => {
    expect.assertions(5)

    const app = new App()
    
    app.locationMgr.locator.geocoder.search = jest.fn()

    $('#review').append(opt)

    expect($('.srch-ctl input').val()).toBe('')
    expect($('.srch-ctl input').data('last-search')).toBeUndefined()

    app.review()

    expect($('.srch-ctl input').val()).toBe('')
    expect($('.srch-ctl input').data('last-search')).toBeUndefined()
    expect(app.locationMgr.locator.geocoder.search).toHaveBeenCalledTimes(0)
  })
})

describe('download', () => {
  const saveGeoJson = LocalStorage.prototype.saveGeoJson
  const f0 = new Feature({_row_index: 0, X: 982037, Y: 197460, LNG: 40.70865853, LAT: -74.00798212, _input: '59 maiden', _geocodeResp: {}, _columns: [], _row_data: [], _source: {}})
  const f1 = new Feature({_row_index: 1, X: 986121, Y: 216099, LNG: 40.75981807, LAT: -73.99324627, _input: '433 w43, mn', _geocodeResp: {}, _columns: [], _row_data: [], _source: {}})
beforeEach(() => {
    f0.setGeometry(new Point(proj4('EPSG:2263', 'EPSG:3857', [f0.get('X'), f0.get('Y')])))
    f1.setGeometry(new Point(proj4('EPSG:2263', 'EPSG:3857', [f1.get('X'), f1.get('Y')])))
    LocalStorage.prototype.saveGeoJson = jest.fn()
  })
  afterEach(() => {
    LocalStorage.prototype.saveGeoJson = saveGeoJson
  })

  test('download', () => {
    expect.assertions(3)

    const app = new App()
    layer.getSource().addFeatures([f0, f1])

    app.download()

    expect(LocalStorage.prototype.saveGeoJson).toHaveBeenCalledTimes(1)
    expect(LocalStorage.prototype.saveGeoJson.mock.calls[0][0]).toBe('geocoded.json')
    expect(LocalStorage.prototype.saveGeoJson.mock.calls[0][1]).toBe('{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[-74.00798211500157,40.70865852585652]},"properties":{"SHEET_ROW_NUM":1}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-73.99324626841947,40.75981806867506]},"properties":{"SHEET_ROW_NUM":2}}]}')
  })
})
