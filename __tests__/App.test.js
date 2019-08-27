import App from '../src/js/App'
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

const confNyc = {
  nyc: true,
  template: 'mock-template',
  url: 'mock-geoclient-url',
  id: 'mock-id',
  key: 'mock-key',
  requestedFields: [App.POSSIBLE_FIELDS[1], App.POSSIBLE_FIELDS[100]]
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
    expect(app.sheetGeocoder.source).toBe(layer.source)
    
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

test('setConfigValues', () => {
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
