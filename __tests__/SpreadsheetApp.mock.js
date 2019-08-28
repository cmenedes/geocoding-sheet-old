const menuItem = {}
const addonMenu = {}
const ui = {}
const range = {data: []}
const sheet = {data: []}

const SpreadsheetApp = {sheet, range}

const resetMocks = () => {
  sheet.data = []

  menuItem.addToUi = jest.fn()
  addonMenu.addItem = jest.fn().mockImplementation((name, callback) => {
    return menuItem
  })
  ui.createAddonMenu = jest.fn().mockImplementation(() => {
    return addonMenu
  })
  range.getValues = jest.fn().mockImplementation(() => {
    return range.data
  })
  range.setValue = jest.fn()
  sheet.getDataRange = jest.fn().mockImplementation(() => {
    range.data = sheet.data
    return range
  })
  sheet.getRange = jest.fn().mockImplementation((row, col, numRows, numCols) => {
    let data
    if (!isNaN(numCols)) {
      data = []
      for (var r = row - 1; r < row - 1 + numRows; r++) {
        data.push(sheet.data[r].slice(col - 1, col + numCols - 1))
      }
    } else if (!numRows) {
      data = []
      for (var r = row - 1; r < row - 1 + numRows; r++) {
        data.push(sheet.data[r][col - 1])
      }
    } else {
      data = sheet.data[row - 1][col - 1]
    } 
    range.data = data    
    return range
  })
  range.setBackground = jest.fn()
  sheet.getLastColumn = jest.fn().mockImplementation(() => {
    return sheet.data[0].length
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