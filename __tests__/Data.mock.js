import Code from '../src/js/Code'
import Feature from 'ol/Feature'
import proj4 from 'proj4'

const GEOCODE_RESP = {
  input: '59 maiden, mn',
  name: '59 Maiden Lane, Manhattan, NY 10038',
  data: {
    assemblyDistrict: 65,
    bbl: 1000670001
  }
}

const data = {
  NOT_GEOCODED_SHEET_PROJECT: [
    ['num', 'street', 'city'],
    [59, 'maiden', 'mn'],
    ['102-25', '67 dr', 'qn'],
    [2, 'broadway', '']
  ],
  GEOCODED_SHEET_PROJECT: [
    ['num', 'street', 'boro', LOCATION_NAME_COL, LONGITUDE_COL, LATITUDE_COL, PROJECTED_X_COL, PROJECTED_Y_COL, 'assemblyDistrict', 'bbl'],
    [59, 'maiden', 'mn', '59 Maiden Lane, Manhattan, NY 10038', 40.70865853, -74.00798212, 982037, 197460, 65, 1000670001],
    ['102-25', '67 dr', 'qn', '102-25 67 Drive, Queens, NY 11375', 40.72673236, -73.85073033, 1025623, 204080, 28, 4021350059],
    [2, 'broadway', undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined]
  ],
  GEOCODED_SHEET: [
    ['num', 'street', 'boro', LOCATION_NAME_COL, LONGITUDE_COL, LATITUDE_COL, 'assemblyDistrict', 'bbl'],
    [59, 'maiden', 'mn', '59 Maiden Lane, Manhattan, NY 10038', 40.70865853, -74.00798212, 65, 1000670001],
    ['102-25', '67 dr', 'qn', '102-25 67 Drive, Queens, NY 11375', 40.72673236, -73.85073033, 28, 4021350059],
    [2, 'broadway', undefined, undefined, undefined, undefined, undefined, undefined]
  ],
  GC_PROJECT_DATA_0: {
    projected: 'EPSG:2263',
    row: 1,
    lng: 40.70865853,
    lat: -74.00798212,
    x: 982037,
    y: 197460,
    name: '59 Maiden Lane, Manhattan, NY 10038',
    columns: ['num', 'street', 'city'],
    cells: [59, 'maiden', 'mn'],
    geocodeResp: GEOCODE_RESP,
    requestedFields: ['assemblyDistrict', 'bbl'],
    interactive: false
  },
  GC_PROJECT_DATA_1: {
    projected: 'EPSG:2263',
    row: 1,
    lng: 40.70865853,
    lat: -74.00798212,
    x: 982037,
    y: 197460,
    columns: ['num', 'street', 'boro', LOCATION_NAME_COL, LONGITUDE_COL, LATITUDE_COL, PROJECTED_X_COL, PROJECTED_Y_COL, 'assemblyDistrict', 'bbl'],
    cells: [59, 'maiden', 'mn', '59 Maiden Lane, Manhattan, NY 10038', 40.70865853, -74.00798212, 982037, 197460, 65, 1000670001],
    geocodeResp: GEOCODE_RESP,
    requestedFields: ['bbl', 'assemblyDistrict'],
    interactive: false
  },
  GC_DATA_0: {
    projected: '',
    row: 1,
    lng: 40.70865853,
    lat: -74.00798212,
    columns: ['num', 'street', 'city'],
    cells: [59, 'maiden', 'mn'],
    geocodeResp: GEOCODE_RESP,
    requestedFields: ['assemblyDistrict', 'bbl'],
    interactive: false
  },
  GC_DATA_NO_BBL: {
    projected: '',
    row: 1,
    lng: 40.70865853,
    lat: -74.00798212,
    columns: ['num', 'street', 'city'],
    cells: [59, 'maiden', 'mn'],
    geocodeResp: {
      input: '59 maiden, mn',
      name: '59 Maiden Lane, Manhattan, NY 10038',
      data: {assemblyDistrict: 65}
    },
    requestedFields: ['assemblyDistrict', 'bbl'],
    interactive: false
  },
  GC_DATA_AMBIGUOUS: {
    projected: '',
    row: 3,
    columns: ['num', 'street', 'city'],
    cells: [2, 'broadway', ''],
    requestedFields: ['assemblyDistrict', 'bbl'],
    interactive: false
  },
  GC_DATA_INTERACTIVE: {
    projected: '',
    row: 3,
    lng: 40.70865853,
    lat: -74.00798212,
    columns: ['num', 'street', 'boro', LOCATION_NAME_COL, LONGITUDE_COL, LATITUDE_COL, 'assemblyDistrict', 'bbl'],
    cells: [2, 'broadway', 'mn', undefined, undefined, undefined, undefined, undefined],
    geocodeResp: {
      input: '2 broadway, mn',
      name: '2 Broadway, Manhattan, NY 10004',
      data: {
        assemblyDistrict: 65,
        bbl: 1000110001
      }
    },
    requestedFields: ['assemblyDistrict', 'bbl'],
    interactive: true
  },
  FEATURES: []
}

const sheet = data.GEOCODED_SHEET
const header = sheet[0]
for (let i = 1; i < sheet.length; i++) {
  const props = {}
  const row = sheet[i]
  for (let j = 0; j < row.length; j++) {
    props[header[j]] = row[j]
  }
  const feature = new Feature(props)
  if (props.lng) feature.setGeometry(proj4('EPSG:4326', 'EPSG:3857', [props.lng, props.lat]))
  data.FEATURES.push(feature)
}

export default data