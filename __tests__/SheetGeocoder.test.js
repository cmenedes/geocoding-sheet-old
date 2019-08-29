import SheetGeocoder from '../src/js/SheetGeocoder'
import EventHandling from 'nyc-lib/nyc/EventHandling'
import Source from 'ol/source/Vector'
import Conf from '../src/js/Conf'
import CsvAddr from 'nyc-lib/nyc/ol/format/CsvAddr'
import Feature from 'ol/Feature'
import google from './goog.mock'
import MockData from './Data.mock'
import SpreadsheetApp from './SpreadsheetApp.mock'

import CensusGeocoder from 'nyc-lib/nyc/CensusGeocoder'
import Geoclient from 'nyc-lib/nyc/Geoclient'
// jest.mock('nyc-lib/nyc/CensusGeocoder')
// jest.mock('nyc-lib/nyc/Geoclient')

const VALID_NYC_CONF = {
  nyc: true,
  url: 'mock-url',
  id: 'mock-id',
  key: 'mock-key',
  template: 'mock-template',
  requestedFields: []
}

beforeEach(() => {
  // CensusGeocoder.mockClear()
  // Geoclient.mockClear()
})

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

    geo.conf(VALID_NYC_CONF)

    expect(geo.format instanceof CsvAddr).toBe(true)
    expect(geo.format.geocoder instanceof Geoclient).toBe(true)
    expect(geo.format.geocoder.url).toBe('mock-url/search.json?app_id=mock-id&app_key=mock-key&input=&input=')
  })

  test('conf not nyc', () => {
    expect.assertions(2)

    Conf.set()
    const geo = new SheetGeocoder({source: new Source()})

    geo.conf({
      nyc: false,
      url: 'mock-url',
      template: 'mock-template',
      requestedFields: []
    })

    expect(geo.format instanceof CsvAddr).toBe(true)
    expect(geo.format.geocoder instanceof CensusGeocoder).toBe(true)
  })
})

test('clear', () => {
  expect.assertions(8)

  const source = {clear: jest.fn()}

  const geo = new SheetGeocoder({source: source})

  geo.geocodeAll = true
  geo.countDown = 100
  geo.geocodedBounds = 'mock-bounds'

  geo.clear()

  expect(geo.geocodeAll).toBe(false)
  expect(geo.countDown).toBe(0)
  expect(geo.geocodedBounds).toBeNull()
  expect(source.clear).toHaveBeenCalledTimes(2)

  geo.source = null

  geo.geocodeAll = true
  geo.countDown = 200
  geo.geocodedBounds = 'another-mock-bounds'

  geo.clear()

  expect(geo.geocodeAll).toBe(false)
  expect(geo.countDown).toBe(0)
  expect(geo.geocodedBounds).toBeNull()
  expect(source.clear).toHaveBeenCalledTimes(2)
})

test('doGeocode', () => {
  expect.assertions(3)

  const featureSource = {
    num: 2,
    street: 'broadway',
    boro: ''
  }
  const feature = new Feature({_input: '2 broadway, '})

  const geo = new SheetGeocoder({source: new Source()})

  geo.conf({nyc: false, template: '${num} ${street}, ${boro}'})

  expect(geo.doGeocode(featureSource)).toBe(true)

  expect(geo.doGeocode(featureSource, feature)).toBe(false)

  featureSource.boro = 1

  expect(geo.doGeocode(featureSource, feature)).toBe(true)
})

describe('getData', () => {
  const gotData = SheetGeocoder.prototype.gotData

  beforeEach(() => {
    SheetGeocoder.prototype.gotData = jest.fn()
  })
  afterEach(() => {
    SheetGeocoder.prototype.gotData = gotData
  })

  test('getData', () => {
    expect.assertions(8)
  
    google.returnData = MockData.NOT_GEOCODED_SHEET_PROJECT
  
    const geo = new SheetGeocoder({source: new Source()})
  
    geo.conf(VALID_NYC_CONF)
  
    geo.getData()
  
    expect(geo.geocodeAll).toBe(false)
    expect(google.script.run.withSuccessHandler).toHaveBeenCalledTimes(1)
    expect(geo.gotData).toHaveBeenCalledTimes(1)
    expect(geo.gotData.mock.calls[0][0]).toBe(MockData.NOT_GEOCODED_SHEET_PROJECT)
  
    geo.getData(true)

    expect(geo.geocodeAll).toBe(true)
    expect(google.script.run.withSuccessHandler).toHaveBeenCalledTimes(2)
    expect(geo.gotData).toHaveBeenCalledTimes(2)
    expect(geo.gotData.mock.calls[1][0]).toBe(MockData.NOT_GEOCODED_SHEET_PROJECT)
  })
})

describe('gotData', () => {
  const gsGeocoded = geocoded
  const sheetGeoGeocoded = SheetGeocoder.prototype.geocoded
  const setGeometry = CsvAddr.prototype.setGeometry
  beforeEach(() => {
    geocoded = jest.fn()
    SheetGeocoder.prototype.geocoded = jest.fn()
    CsvAddr.prototype.setGeometry = jest.fn().mockImplementation((feature, source) => {
      feature.dispatchEvent({type: 'change', target: feature})
    })
    afterEach(() => {
      geocoded = gsGeocoded
      SheetGeocoder.prototype.geocoded = sheetGeoGeocoded
      CsvAddr.prototype.setGeometry = setGeometry
    })
  })

  test('gotData geocodeAll is true', () => {
    expect.assertions(12)

    const sheet = MockData.NOT_GEOCODED_SHEET_PROJECT

    const geo = new SheetGeocoder({
      source: new Source({features: MockData.NOT_GEOCODED_FEATURES})
    })

    geo.conf(VALID_NYC_CONF)
    geo.geocodeAll = true

    geo.on('batch-start', data => {
      expect(data).toBe(MockData.NOT_GEOCODED_SHEET_PROJECT)
    })
    geo.gotData(MockData.NOT_GEOCODED_SHEET_PROJECT)

    expect(geo.format.setGeometry).toHaveBeenCalledTimes(3)
    geo.format.setGeometry.mock.calls.forEach((call, i) => {
      expect(call[0]).toBe(geo.source.getFeatureById(i + 1))
      expect(call[1]).toEqual({
        _columns: MockData.NOT_GEOCODED_SHEET_PROJECT[0],
        _row_data: MockData.NOT_GEOCODED_SHEET_PROJECT[i + 1],
        _row_index: i + 1
      })
    })

    expect(geo.geocoded).toHaveBeenCalledTimes(3)
    geo.geocoded.mock.calls.forEach((call, i) => {
      expect(call[0]).toEqual({
        type: 'change',
        target: geo.source.getFeatureById(i + 1)
      })  
    })
  })

})
