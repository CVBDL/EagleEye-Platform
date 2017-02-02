/**
 * Created by MMo2 on 6/20/2016.
 */
"use strict";

var Exceljs = require('exceljs');
var fs = require('fs');
var path = require('path');

var defaultSetting = {
  creator: "EagleEye-Platform",
  lastModifiedBy: "EagleEye-Platform",
  worksheet: "Chart data"
};

var PRODUCTION_PATH = path.join(__dirname, '../excelPath/prod'),
  TEST_PATH = path.join(__dirname, '../excelPath/test');

exports.MODE_TEST = 'mode_test'
exports.MODE_PRODUCTION = 'mode_production'

var createWorkbook = function (setting) {
  var workbook = new Exceljs.Workbook();

  if (setting.creator)
    workbook.creator = setting.creator;
  else
    workbook.creator = defaultSetting.creator;
  if (setting.lastModifiedBy)
    workbook.lastModifiedBy = setting.lastModifiedBy;
  else
    workbook.lastModifiedBy = defaultSetting.lastModifiedBy;

  if (setting.created)
    workbook.created = created;
  else
    workbook.created = new Date();

  workbook.modified = new Date();

  return workbook;
}

var workbookToJSObject = function (worksheet, done) {
  var result = [];
  worksheet.eachRow(function (row, rowNumber) {
    var line = [];
    row.eachCell(function (cell, colNumber) {
      line.push(cell.value);
    });
    result.push(line);
  });
  done(result);
}

exports.writeXlsx = function (setting, data, done, mode) {
  if (!setting || !setting.columns || (!setting.filename && !setting.outStream)) {
    return;
  }
  mode = typeof mode !== 'undefined' ? mode : exports.MODE_PRODUCTION;

  var workbook = createWorkbook(setting);

  var worksheet = workbook.addWorksheet(setting.worksheet ? setting.worksheet : defaultSetting.worksheet, { properties: { tabColor: { argb: "FFC0000" } } });

  worksheet.columns = setting.columns;

  // data.forEach(line => worksheet.addRow(line));
  worksheet.addRows(data);

  var path = mode === exports.MODE_TEST ? TEST_PATH : PRODUCTION_PATH;

  if (setting.outStream) {
    workbook.xlsx.write(setting.outStream).then(done);
  } else {
    workbook.xlsx.writeFile(path + "/" + setting.filename).then(done);
  }
};


/**
 * Only read the first worksheet of a given {Exceljs.Workbook} workbook.
 * Parse the worksheet content into a 2D array.
 *
 * @method
 * @param {Excel.Workbook} workbook An instance of Exceljs Workbook class.
 * @returns {Array<Array>} Worksheet content in 2D array format.
 */
exports.readWorkbook = function (workbook) {
  // use the first work sheet
  let worksheet = workbook.getWorksheet(1);

  var result = [];
  worksheet.eachRow(function (row, rowNumber) {
    var line = [];
    row.eachCell(function (cell, colNumber) {
      line.push(cell.value);
    });
    result.push(line);
  });

  return result;
};
