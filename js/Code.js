const NAME = 'Geocoder';
const ERROR_COLOR = '#FFA500'
const CORRECTED_COLOR = '#ADFF2F'

const onInstall = () => {
  onOpen();
}

const onOpen = () => {
  SpreadsheetApp.getUi().createAddonMenu().addItem(NAME, 'show').addToUi()
}

const show = () => {
  const html = HtmlService.createTemplateFromFile('index').evaluate().setTitle(NAME)
  SpreadsheetApp.getUi().showSidebar(html)
}

const getData = () => {
  return SpreadsheetApp.getActiveSheet().getDataRange().getValues()
}

const standardCols = (sheet, data) => {
  const length = data.cells.length
  const range = sheet.getRange(1, 1, 1, length)
  const columns = range.getValues()[0]
  let nameCol = columns.indexOf('LOCATION_NAME')
  let lngCol = columns.indexOf('LNG')
  let latCol = columns.indexOf('LAT')
  nameCol = (nameCol > -1) ? (nameCol + 1) : (length + 1)
  lngCol = (lngCol > -1) ? (lngCol + 1) : (length + 2)
  latCol = (latCol > -1) ? (latCol + 1) : (length + 3)
  sheet.getRange(1, nameCol).setValue('LOCATION_NAME')
  sheet.getRange(1, lngCol).setValue('LNG')
  sheet.getRange(1, latCol).setValue('LAT')
  return xyCols(sheet, data, {name: nameCol, lng: lngCol, lat: latCol})
}

const xyCols = (sheet, data, standardCols) => {
  if (data.projected) {
    const length = data.cells.length
    const range = sheet.getRange(1, 1, 1, length)
    const columns = range.getValues()[0]
    let xCol = columns.indexOf('X')
    let yCol = columns.indexOf('Y')
    xCol = (xCol > -1) ? (xCol + 1) : (length + 4)
    yCol = (yCol > -1) ? (yCol + 1) : (length + 5)
    sheet.getRange(1, xCol).setValue('X')
    sheet.getRange(1, yCol).setValue('Y')
    standardCols.x = xCol
    standardCols.y = yCol
  }
  return standardCols
}

const geoCols = (sheet, data) => {
  const fields = data.requestedFields
  const cols = standardCols(sheet, data)
  const dataCols = data.columns
  let last = cols.x || -1
  if (last < cols.y) last = cols.y || -1
  if (last < cols.lng) last = cols.lng
  if (last < cols.lat) last = cols.lat
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i]
    const exists = dataCols.indexOf(field)
    if (exists > -1) {
      cols[field] = exists + 1
    } else {
      last++
      sheet.getRange(1, last).setValue(field)
      cols[field] = last
    }
  }
  return cols
}

const setFields = (sheet, row, cols, data) => {  
  const fields = data.requestedFields
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i]
    sheet.getRange(row, cols[field]).setValue(data.geocodeResp.data[field] || '')
  }
}

const geocoded = (data) => {
  const row = data.row + 1
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  const cols = geoCols(sheet, data)
  if (!isNaN(data.lng)) {
    sheet.getRange(row, cols.name).setValue(data.geocodeResp.name)
    sheet.getRange(row, cols.lng).setValue(data.lng)
    sheet.getRange(row, cols.lat).setValue(data.lat)
    if (data.projected) {
      sheet.getRange(row, cols.x).setValue(data.x)
      sheet.getRange(row, cols.y).setValue(data.y)
    }
    if (data.interactive) {
      sheet.getRange(row, 1, 1, sheet.getLastColumn()).setBackground(CORRECTED_COLOR)
    }
    setFields(sheet, row, cols, data)
  } else {
    sheet.getRange(row, 1, 1, sheet.getLastColumn()).setBackground(ERROR_COLOR)
  }
  return {
    columns: sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0], 
    cells: sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0]
  }
}

export default {onInstall, onOpen, getData, geocoded}