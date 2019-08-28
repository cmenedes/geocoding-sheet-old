import google from './goog.mock'
import HtmlService from './HtmlService.mock'
import SpreadsheetApp from './SpreadsheetApp.mock'
import goog from './goog.mock';
import Code from '../src/js/Code'

const NOT_GEOCODED_SHEET = [
  ['num', 'street', 'city'],
  [59, 'mainden', 'mn'],
  ['102-25', '67 dr', 'qn'],
  [2, 'broadway', '']
]

const GEOCODED_SHEET = [
  ['num', 'street', 'boro', LOCATION_NAME_COL, LONGITUDE_COL, LATITUDE_COL, PROJECTED_X_COL, PROJECTED_Y_COL, 'assemblyDistrict', 'bbl'],
  [59, 'maiden', 'mn', '59 Maiden Lane, Manhattan, NY 10038', 40.70865853, -74.00798212, 982037, 197460, 65, 1000670001],
  ['102-25', '67 dr', 'qn', '102-25 67 Drive, Queens, NY 11375', 40.72673236, -73.85073033, 1025623, 204080, 28, 4021350059],
  [2, 'broadway', undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined]
]

const GC_PROJECT_DATA_0 = {
  projected: 'EPSG:2263',
  row: 0,
  columns: ['num', 'street', 'city'],
  cells: [59, 'maiden', 'mn'],
  geocodeResp: {input: '59 maiden, mn'},
  requestedFields: ['assemblyDistrict', 'bbl'],
  interactive: false
}

const GC_DATA_0 = {
  projected: '',
  row: 0,
  columns: ['num', 'street', 'city'],
  cells: [59, 'maiden', 'mn'],
  geocodeResp: {input: '59 maiden, mn'},
  requestedFields: ['assemblyDistrict', 'bbl'],
  interactive: false
}

const GC_PROJECT_DATA_1 = {
  projected: 'EPSG:2263',
  row: 0,
  columns: ['num', 'street', 'boro', LOCATION_NAME_COL, LONGITUDE_COL, LATITUDE_COL, PROJECTED_X_COL, PROJECTED_Y_COL, 'assemblyDistrict', 'bbl'],
  cells: [59, 'maiden', 'mn', '59 Maiden Lane, Manhattan, NY 10038', 40.70865853, -74.00798212, 982037, 197460, 65, 1000670001],
  geocodeResp: {input: '59 maiden, mn'},
  requestedFields: ['bbl', 'assemblyDistrict'],
  interactive: false
}

beforeEach(() => {
  HtmlService.resetMocks()
  SpreadsheetApp.resetMocks()
  google.resetMocks()
})

test('functions loaded', () => {
  expect.assertions(8)

  expect(typeof onInstall).toBe('function')
  expect(typeof onOpen).toBe('function')
  expect(typeof show).toBe('function')
  expect(typeof getData).toBe('function')
  expect(typeof standardCols).toBe('function')
  expect(typeof geoCols).toBe('function')
  expect(typeof setFields).toBe('function')
  expect(typeof geocoded).toBe('function')
})

test('onInstall', () => {
  expect.assertions(6)

  onInstall()

  expect(SpreadsheetApp.getUi).toHaveBeenCalledTimes(1)
  
  const ui = SpreadsheetApp.getUi.mock.results[0].value
  expect(ui.createAddonMenu).toHaveBeenCalledTimes(1)

  const menu = ui.createAddonMenu.mock.results[0].value
  expect(menu.addItem).toHaveBeenCalledTimes(1)
  expect(menu.addItem.mock.calls[0][0]).toBe(ADDON_NAME)
  expect(menu.addItem.mock.calls[0][1]).toBe('show')

  const item = menu.addItem.mock.results[0].value
  expect(item.addToUi).toHaveBeenCalledTimes(1)

})

test('show', () => {
  expect.assertions(8)

  show()

  expect(HtmlService.createTemplateFromFile).toHaveBeenCalledTimes(1)
  expect(HtmlService.createTemplateFromFile.mock.calls[0][0]).toBe('index')

  const templ = HtmlService.createTemplateFromFile.mock.results[0].value
  expect(templ.evaluate).toHaveBeenCalledTimes(1)

  const page = templ.evaluate.mock.results[0].value
  expect(page.setTitle).toHaveBeenCalledTimes(1)
  expect(page.setTitle.mock.calls[0][0]).toBe(ADDON_NAME)

  expect(SpreadsheetApp.getUi).toHaveBeenCalledTimes(1)

  const ui = SpreadsheetApp.getUi.mock.results[0].value
  expect(ui.showSidebar).toHaveBeenCalledTimes(1)
  expect(ui.showSidebar.mock.calls[0][0]).toBe(page)
})

test('getData', () => {
  expect.assertions(4)

  SpreadsheetApp.sheet.data = NOT_GEOCODED_SHEET

  expect(getData()).toBe(NOT_GEOCODED_SHEET)

  expect(SpreadsheetApp.getActiveSheet).toHaveBeenCalledTimes(1)

  const sheet = SpreadsheetApp.getActiveSheet.mock.results[0].value
  expect(sheet.getDataRange).toHaveBeenCalledTimes(1)

  const range = sheet.getDataRange.mock.results[0].value
  expect(range.getValues).toHaveBeenCalledTimes(1)
})

describe('geoCols', () => {

  const testGeoCols = (mockSheetData, mockGeocodeData) => {
    SpreadsheetApp.sheet.data = mockSheetData

    const sheet = SpreadsheetApp.getActiveSheet()
    
    const cols = geoCols(sheet, mockGeocodeData)
        
    expect(cols.name).toBe(4)
    expect(cols.lng).toBe(5)
    expect(cols.lat).toBe(6)
    if (mockGeocodeData.projected) {
      expect(cols.x).toBe(7)
      expect(cols.y).toBe(8)
      expect(cols.assemblyDistrict).toBe(9)
      expect(cols.bbl).toBe(10)
    } else {
      expect(cols.assemblyDistrict).toBe(7)
      expect(cols.bbl).toBe(8)
    }
    
    expect(sheet.getRange.mock.calls[0]).toEqual([1, 1, 1, mockGeocodeData.cells.length])
    
    expect(sheet.getRange.mock.calls[1]).toEqual([1, 4])
    expect(SpreadsheetApp.range.setValue.mock.calls[0]).toEqual([LOCATION_NAME_COL])
    
    expect(sheet.getRange.mock.calls[2]).toEqual([1, 5])
    expect(SpreadsheetApp.range.setValue.mock.calls[1]).toEqual([LONGITUDE_COL])
    
    expect(sheet.getRange.mock.calls[3]).toEqual([1, 6])
    expect(SpreadsheetApp.range.setValue.mock.calls[2]).toEqual([LATITUDE_COL])
    
    if (mockGeocodeData.projected) {
      expect(sheet.getRange.mock.calls[4]).toEqual([1, 1, 1, mockGeocodeData.cells.length])

      expect(sheet.getRange.mock.calls[5]).toEqual([1, 7])
      expect(SpreadsheetApp.range.setValue.mock.calls[3]).toEqual([PROJECTED_X_COL])
      
      expect(sheet.getRange.mock.calls[6]).toEqual([1, 8])
      expect(SpreadsheetApp.range.setValue.mock.calls[4]).toEqual([PROJECTED_Y_COL])
    }

    return sheet
  }

  test('geoCols - projected - not yet added to sheet', () => {
    expect.assertions(25)

    const sheet = testGeoCols(NOT_GEOCODED_SHEET, GC_PROJECT_DATA_0)

    expect(sheet.getRange).toHaveBeenCalledTimes(9)
    expect(SpreadsheetApp.range.setValue).toHaveBeenCalledTimes(7)
    
    expect(sheet.getRange.mock.calls[7]).toEqual([1, 9])
    expect(SpreadsheetApp.range.setValue.mock.calls[5]).toEqual([GC_PROJECT_DATA_0.requestedFields[0]])
    
    expect(sheet.getRange.mock.calls[8]).toEqual([1, 10])
    expect(SpreadsheetApp.range.setValue.mock.calls[6]).toEqual([GC_PROJECT_DATA_0.requestedFields[1]])    
  })

  test('geoCols - projected - previously added to sheet', () => {
    expect.assertions(21)

    const sheet = testGeoCols(GEOCODED_SHEET, GC_PROJECT_DATA_1)

    expect(sheet.getRange).toHaveBeenCalledTimes(7)
    expect(SpreadsheetApp.range.setValue).toHaveBeenCalledTimes(5)
  })

  test('geoCols - not projected - not yet added to sheet', () => {
    expect.assertions(14)

    const sheet = testGeoCols(NOT_GEOCODED_SHEET, GC_DATA_0)

    expect(sheet.getRange).toHaveBeenCalledTimes(6)
    expect(SpreadsheetApp.range.setValue).toHaveBeenCalledTimes(5)
  })

})