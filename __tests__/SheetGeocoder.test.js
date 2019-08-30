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

const getGeocodeResp = (props, interactive) => {
  return {
    input: `${props.num || ''} ${props.street || ''}, ${interactive ? 1 : ''}`,
    data: {
      assemblyDistrict: props.assemblyDistrict,
      bbl: props.bbl
    }
  }
}

const getGeocodedFeatures = interactive => {
  const features = []
  MockData.GEOCODED_FEATURES.forEach((f, i) => {
    const props = f.getProperties()
    const feature = new Feature(props)
    const geom = f.getGeometry()
    feature.setId(f.getId())
    if (geom) {
      feature.setGeometry(new Point(geom.getCoordinates()))
    } else {
      feature.set('boro', interactive ? 1 : '')
      feature.set('_input', `${props.num || ''} ${props.street || ''}, `)
      feature.set('_geocodeResp', getGeocodeResp(props, interactive))
      feature.set('_row_index', i) 
      feature.set('_columns', MockData.GEOCODED_SHEET_PROJECT[0]) 
      feature.set('_row_data', MockData.GEOCODED_SHEET_PROJECT[i + 1])
      feature.set('_interactive', true)
    }
    features.push(feature)
  })
  return features
}

const VALID_NYC_CONF = {
  nyc: true,
  url: 'mock-url',
  id: 'mock-id',
  key: 'mock-key',
  template: '${num} ${street}, ${boro}',
  requestedFields: []
}

beforeEach(() => {
  // CensusGeocoder.mockClear()
  // Geoclient.mockClear()
  MockData.resetMocks()
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
  const testSetGeometry = (geo, sheet, times) => {
    expect(geo.format.setGeometry).toHaveBeenCalledTimes(times)
    geo.format.setGeometry.mock.calls.forEach((call, i) => {
      const feature = geo.source.getFeatureById(i)
      expect(call[0]).toBe(feature)
      expect(call[1]).toEqual({
        num: feature.get('num'),
        street: feature.get('street'),
        boro: feature.get('boro'),
        LOCATION_NAME: feature.get('LOCATION_NAME'),
        LNG: feature.get('LNG'),
        LAT: feature.get('LAT'),
        X: feature.get('X'),
        Y: feature.get('Y'),
        assemblyDistrict: feature.get('assemblyDistrict'),
        bbl: feature.get('bbl'),
        _columns: sheet[0],
        _row_data: sheet[i + 1],
        _row_index: i + 1
      })
    })
  }
  
  const testFeatureChangeRunsGeocoded = (geo, times) => {
    expect(geo.geocoded).toHaveBeenCalledTimes(times)
    geo.geocoded.mock.calls.forEach((call, i) => {
      expect(call[0]).toEqual({
        type: 'change',
        target: geo.source.getFeatureById(i)
      })  
    })  
  }

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

    const geo = new SheetGeocoder({source: new Source()})

    geo.conf(VALID_NYC_CONF)
    geo.geocodeAll = true

    geo.on('batch-start', data => {
      expect(data).toBe(MockData.NOT_GEOCODED_SHEET_PROJECT)
    })

    geo.gotData(MockData.NOT_GEOCODED_SHEET_PROJECT)

    testSetGeometry(geo, MockData.NOT_GEOCODED_SHEET_PROJECT, 3)
    testFeatureChangeRunsGeocoded(geo, 3)
  })

  test('gotData geocodeAll is false', () => {
    expect.assertions(11)

    const sheet = MockData.GEOCODED_SHEET_PROJECT

    const geo = new SheetGeocoder({
      source: new Source({
        /* will not be cleared because geocodeAll === false */
        features: MockData.GEOCODED_FEATURES 
      })
    })

    geo.conf(VALID_NYC_CONF)
    geo.geocodeAll = false

    geo.on('batch-start', data => {
      fail('no batch should be started')
    })

    geo.gotData(MockData.GEOCODED_SHEET_PROJECT)

    testSetGeometry(geo, MockData.GEOCODED_SHEET_PROJECT, 3)
    testFeatureChangeRunsGeocoded(geo, 3)
  })

  test('gotData geocodeAll is false - one interactive changed', () => {
    expect.assertions(8)

    const sheet = MockData.GEOCODED_SHEET_PROJECT

    const geo = new SheetGeocoder({source: new Source()})

    geo.conf(VALID_NYC_CONF)
    geo.geocodeAll = false
    geo.source.addFeatures(getGeocodedFeatures(true))

    geo.on('batch-start', data => {
      fail('no batch should be started')
    })

    geo.gotData(MockData.GEOCODED_SHEET_PROJECT)

    testSetGeometry(geo, MockData.GEOCODED_SHEET_PROJECT, 2)
    testFeatureChangeRunsGeocoded(geo, 2)
  })

  test('gotData geocodeAll is false - one interactive unchanged', () => {
    expect.assertions(8)

    const sheet = MockData.GEOCODED_SHEET_PROJECT

    const geo = new SheetGeocoder({source: new Source()})

    geo.conf(VALID_NYC_CONF)
    geo.geocodeAll = false
    geo.source.addFeatures(getGeocodedFeatures())

    geo.on('batch-start', data => {
      fail('no batch should be started')
    })

    geo.gotData(MockData.GEOCODED_SHEET_PROJECT)

    testSetGeometry(geo, MockData.GEOCODED_SHEET_PROJECT, 2)
    testFeatureChangeRunsGeocoded(geo, 2)
  })

})

describe('geocoded', () => {
  beforeEach(() => {

  })
  afterEach(() => {

  })

  test('geocoded - geocodeAll is true - geocode successful - not done', () => {
    expect.assertions(1)

    google.returnData = {
      row: 2,
      columns: MockData.GEOCODED_SHEET_PROJECT[0], 
      cells: MockData.GEOCODED_SHEET_PROJECT[1]
    }

    const features = getGeocodedFeatures()
    const feature = features[0]

    const geo = new SheetGeocoder({source: new Source()})

    geo.conf(VALID_NYC_CONF)
    geo.geocodeAll = true
    geo.source.addFeatures(features)

    geo.geocoded({target: feature})

    expect(true).toBe(true)
  })
})