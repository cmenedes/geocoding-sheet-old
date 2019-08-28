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

const GEOCLIENT_GEOCODED_DATA = {
  projected: 'EPSG:2263',
  row: 0,
  columns: ['num', 'street', 'city'],
  cells: [59, 'maiden', 'mn'],
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
  expect(menu.addItem.mock.calls[0][0]).toBe('Geocoder')
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
  expect(page.setTitle.mock.calls[0][0]).toBe('Geocoder')

  expect(SpreadsheetApp.getUi).toHaveBeenCalledTimes(1)

  const ui = SpreadsheetApp.getUi.mock.results[0].value
  expect(ui.showSidebar).toHaveBeenCalledTimes(1)
  expect(ui.showSidebar.mock.calls[0][0]).toBe(page)
})

test('getData', () => {
  expect.assertions(4)

  SpreadsheetApp.range.returnValues = ['mock-values']

  expect(getData()).toBe('mock-values')

  expect(SpreadsheetApp.getActiveSheet).toHaveBeenCalledTimes(1)

  const sheet = SpreadsheetApp.getActiveSheet.mock.results[0].value
  expect(sheet.getDataRange).toHaveBeenCalledTimes(1)

  const range = sheet.getDataRange.mock.results[0].value
  expect(range.getValues).toHaveBeenCalledTimes(1)
})


describe('standardCols', () => {
  const _xyCols = global.xyCols
  beforeEach(() => {
    global.xyCols = jest.fn()
  })
  afterEach(() => {
    global.xyCols = _xyCols
  })

  test('standardCols no geocode cols', () => {
    expect.assertions(1)

    SpreadsheetApp.returnRangeDatas.push(NOT_GEOCODED_SHEET)

    const sheet = SpreadsheetApp.getActiveSheet()
    const data = GEOCLIENT_GEOCODED_DATA

    const cols = standardCols(sheet, data)

    expect (sheet.getRange).toHaveBeenCalledTimes(4)
  })
})