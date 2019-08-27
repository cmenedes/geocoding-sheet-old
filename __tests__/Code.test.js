import $ from 'jquery'
import fs from 'fs'
import path from 'path'
import google from './goog.mock'
import HtmlService from './HtmlService.mock'
import SpreadsheetApp from './SpreadsheetApp.mock'

const codeJs = fs.readFileSync(path.resolve(__dirname, '../src/js/Code.gs'), {encoding: 'utf-8'})

beforeAll(() => {
  $('body').append(`<script type="text/javascript">${codeJs}</script>`)
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