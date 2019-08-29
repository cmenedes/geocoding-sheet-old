import SheetGeocoder from '../src/js/SheetGeocoder'
import EventHandling from 'nyc-lib/nyc/EventHandling'
import Source from 'ol/source/Vector'
import Conf from '../src/js/Conf'
import Geoclient from 'nyc-lib/nyc/Geoclient'
import CsvAddr from 'nyc-lib/nyc/ol/format/CsvAddr'

describe('constructor', () => {
  const clear = SheetGeocoder.prototype.clear
  beforeEach(() => {
    SheetGeocoder.prototype.clear = jest.fn()
  })
  
  afterEach(() => {
    SheetGeocoder.prototype.clear = clear
  })

  test('constructor', () => {
    expect.assertions(5)

    const geo = new SheetGeocoder({source: 'mock-source', projection: 'mock-proj'})

    expect(geo instanceof SheetGeocoder).toBe(true)
    expect(geo instanceof EventHandling).toBe(true)
    expect(geo.source).toBe('mock-source')
    expect(geo.projection).toBe('mock-proj')
    expect(SheetGeocoder.prototype.clear).toHaveBeenCalledTimes(1)
  })
})

describe('conf', () => {
  test('conf is nyc', () => {
    expect.assertions(3)

    Conf.set()
    const geo = new SheetGeocoder({source: new Source()})

    geo.conf({
      nyc: true,
      url: 'mock-url',
      id: 'mock-id',
      key: 'mock-key',
      template: 'mock-template',
      requestedFields: []
    })

    expect(geo.format instanceof CsvAddr).toBe(true)
    expect(geo.format.geocoder instanceof Geoclient).toBe(true)
    expect(geo.format.geocoder.url).toBe('mock-url/search.json?app_id=mock-id&app_key=mock-key&input=&input=')
  })
})