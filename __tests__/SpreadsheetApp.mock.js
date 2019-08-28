const menuItem = {}
const addonMenu = {}
const ui = {}
const range = {returnValues: null}
const sheet = {}

const SpreadsheetApp = {range}

const resetMocks = () => {
  menuItem.addToUi = jest.fn()
  addonMenu.addItem = jest.fn().mockImplementation((name, callback) => {
    return menuItem
  })
  ui.createAddonMenu = jest.fn().mockImplementation(() => {
    return addonMenu
  })
  range.returnValues = null
  range.getValues = jest.fn().mockImplementation(() => {
    return range.returnValues
  })
  sheet.getDataRange = jest.fn().mockImplementation(() => {
    return range
  })
  SpreadsheetApp.getUi = jest.fn().mockImplementation(() => {
    return ui
  })
  ui.showSidebar = jest.fn()
  SpreadsheetApp.getActiveSheet = jest.fn().mockImplementation(() => {
    return sheet
  })
}

resetMocks()

SpreadsheetApp.resetMocks = resetMocks

global.SpreadsheetApp = SpreadsheetApp

export default SpreadsheetApp