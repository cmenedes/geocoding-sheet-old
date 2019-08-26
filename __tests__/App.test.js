import App from '../src/js/App'
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
  key: 'mock-key'
}

describe('constructor', () => {
  beforeEach(() => {
    Object.keys(confNyc).forEach(key => {
      Conf.set('key')
    })
  })
  afterEach(() => {
    
  })
})

test('constructor', () => {
  expect.assertions(15)

  App.prototype.geoclientUrl = () => {return 'mock-geoclient-url'}

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
})