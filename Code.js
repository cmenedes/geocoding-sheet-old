var name = 'Geocoder';

var editHandler = null;

function onInstall() {
  onOpen();
}

function onOpen(event) {
  SpreadsheetApp.getUi().createAddonMenu().addItem(name, 'show').addToUi();
}

function show() {
  var html = HtmlService.createTemplateFromFile('index').evaluate().setTitle(name);
  SpreadsheetApp.getUi().showSidebar(html);
}

function getData() {
  return SpreadsheetApp.getActiveSheet().getDataRange().getValues();
}

function onEdit() {
  if (editHandler) {
    editHandler();
  }
}

function standardCols(sheet, data) {
  var length = data.cells.length;
  var range = sheet.getRange(1, 1, 1, length);
  var columns = range.getValues()[0];
  var nameCol = columns.indexOf('LOCATION_NAME');
  var lngCol = columns.indexOf('LNG');
  var latCol = columns.indexOf('LAT');
  nameCol = (nameCol > -1) ? (nameCol + 1) : (length + 1);
  lngCol = (lngCol > -1) ? (lngCol + 1) : (length + 2);
  latCol = (latCol > -1) ? (latCol + 1) : (length + 3);
  sheet.getRange(1, nameCol).setValue('LOCATION_NAME');
  sheet.getRange(1, lngCol).setValue('LNG');
  sheet.getRange(1, latCol).setValue('LAT');
  return xyCols(sheet, data, {name: nameCol, lng: lngCol, lat: latCol});
}

function xyCols(sheet, data, standardCols) {
  if (data.projected) {
    var length = data.cells.length;
    var range = sheet.getRange(1, 1, 1, length);
    var columns = range.getValues()[0];
    var xCol = columns.indexOf('X');
    var yCol = columns.indexOf('Y');
    xCol = (xCol > -1) ? (xCol + 1) : (length + 4);
    yCol = (yCol > -1) ? (yCol + 1) : (length + 5);
    sheet.getRange(1, xCol).setValue('X');
    sheet.getRange(1, yCol).setValue('Y');
    standardCols.x = xCol;
    standardCols.y = yCol;
  }
  return standardCols;
}

function geoCols(sheet, data) {
  var fields = data.requestedFields;
  var cols = standardCols(sheet, data);
  var dataCols = data.columns;
  var last = cols.x || -1;
  if (last < cols.y) last = cols.y || -1;
  if (last < cols.lng) last = cols.lng;
  if (last < cols.lat) last = cols.lat;
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    var exists = dataCols.indexOf(field);
    if (exists > -1) {
      cols[field] = exists + 1;
    } else {
      last++;
      sheet.getRange(1, last).setValue(field);
      cols[field] = last;
    }
  }
  return cols;
}

function setFields(sheet, row, cols, data) {  
  var fields = data.requestedFields;
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    sheet.getRange(row, cols[field]).setValue(data.geocodeResp.data[field] || '');
  }
}

function geocoded(data) {
  var row = data.row + 1;
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var cols = geoCols(sheet, data);
  if (!isNaN(data.lng)) {
    var color = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getBackground()
    sheet.getRange(row, cols.name).setValue(data.geocodeResp.name);
    sheet.getRange(row, cols.lng).setValue(data.lng);
    sheet.getRange(row, cols.lat).setValue(data.lat);
    if (data.projected) {
      sheet.getRange(row, cols.x).setValue(data.x);
      sheet.getRange(row, cols.y).setValue(data.y);
    }
    if (data.interactive) {
      sheet.getRange(row, 1, 1, sheet.getLastColumn()).setBackground('#ADFF2F');    
    }
    setFields(sheet, row, cols, data);
  } else {
    sheet.getRange(row, 1, 1, sheet.getLastColumn()).setBackground('#FFA500');
  }
  return {
    columns: sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0], 
    cells: sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0]
  };
}
