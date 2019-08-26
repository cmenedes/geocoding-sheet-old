const menuItem = {}
const addonMenu = {}
const ui = {}
const range = {}
const sheet = {}

const SpreadsheetApp = {}

const resetMocks = () => {
  menuItem.addToUi = jest.fn()
  addonMenu.addItem = jest.fn().mockImplementation((name, callback) => {
    return menuItem
  })
  ui.createAddonMenu = jest.fn().mockImplementation(() => {
    return addonMenu
  })
  range.getValues = jest.fn()
  sheet.getDataRange = jest.fn().mockImplementation(() => {
    return range
  })
  SpreadsheetApp.getUi = jest.fn().mockImplementation(() => {
    return ui
  })
  SpreadsheetApp.showSidebar = jest.fn()
  SpreadsheetApp.getActiveSheet = jest.fn().mockImplementation(() => {
    return sheet
  })
}

resetMocks()

SpreadsheetApp.resetMocks = resetMocks

global.SpreadsheetApp = SpreadsheetApp

export SpreadsheetApp