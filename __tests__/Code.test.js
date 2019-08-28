import $ from 'jquery'
import fs from 'fs'
import path from 'path'
import google from './goog.mock'
import HtmlService from './HtmlService.mock'
import SpreadsheetApp from './SpreadsheetApp.mock'
import goog from './goog.mock';
import Code from '../src/js/Code'

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