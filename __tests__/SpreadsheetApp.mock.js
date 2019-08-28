const menuItem = {}
const addonMenu = {}
const ui = {}
const range = {returnValues: []}
const sheet = {}

const SpreadsheetApp = {returnRangeDatas: [], range}

const resetMocks = () => {
  SpreadsheetApp.returnRangeDatas = []
  
  menuItem.addToUi = jest.fn()
  addonMenu.addItem = jest.fn().mockImplementation((name, callback) => {
    return menuItem
  })
  ui.createAddonMenu = jest.fn().mockImplementation(() => {
    return addonMenu
  })
  range.returnValues = []
  range.getValues = jest.fn().mockImplementation(() => {
    return range.returnValues.shift()
  })
  range.setValue = jest.fn()
  sheet.getDataRange = jest.fn().mockImplementation(() => {
    return range
  })
  sheet.getRange = jest.fn().mockImplementation(() => {
    range.rangeData = SpreadsheetApp.returnRangeDatas.shift()
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