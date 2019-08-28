import Code from '../src/js/Code'

const GEOCODE_RESP = {
  input: '59 maiden, mn',
  data: {
    assemblyDistrict: 65,
    bbl: 1000670001
  }
}

export default {
  NOT_GEOCODED_SHEET: [
    ['num', 'street', 'city'],
    [59, 'maiden', 'mn'],
    ['102-25', '67 dr', 'qn'],
    [2, 'broadway', '']
  ],
  GEOCODED_SHEET: [
    ['num', 'street', 'boro', LOCATION_NAME_COL, LONGITUDE_COL, LATITUDE_COL, PROJECTED_X_COL, PROJECTED_Y_COL, 'assemblyDistrict', 'bbl'],
    [59, 'maiden', 'mn', '59 Maiden Lane, Manhattan, NY 10038', 40.70865853, -74.00798212, 982037, 197460, 65, 1000670001],
    ['102-25', '67 dr', 'qn', '102-25 67 Drive, Queens, NY 11375', 40.72673236, -73.85073033, 1025623, 204080, 28, 4021350059],
    [2, 'broadway', undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined]
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
    x: 982037,
    y: 197460,
    columns: ['num', 'street', 'city'],
    cells: [59, 'maiden', 'mn'],
    geocodeResp: GEOCODE_RESP,
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
  }
}
