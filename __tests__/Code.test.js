import $ from 'jquery'
import fs from 'fs'
import path from 'path'
import google from './goog.mock'
import HtmlService from './HtmlService.mock'
import SpreadsheetApp from './SpreadsheetApp.mock'
import goog from './goog.mock';

const gs = fs.readFileSync(path.resolve(__dirname, '../src/js/Code.gs'), {encoding: 'utf-8'})

beforeAll(() => {
  $('body').append(`<script type="text/javascript">${gs}</script>`)
})

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

describe('onInstall', () => {
  let onOpen_
  beforeEach(() => {
    onOpen_ = onOpen
    onOpen = jest.fn()
  })
  afterEach(() => {
    onOpen = onOpen_
  })

  test('onInstall', () => {
    expect.assertions(1)

    onInstall()
    
    expect(onOpen).toHaveBeenCalledTimes(1)
  })
})

test('onOpen', () => {
  expect.assertions(6)

  onOpen()

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