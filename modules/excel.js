'use strict';

let Exceljs = require('exceljs');
let Promise = require('es6-promise').Promise;
let fs = require('fs');
let path = require('path');

let columnTypes = require('../helpers/column-types');


exports.writeOne = function (doc, settings) {
  settings.columns = doc.datatable.cols;

  for (var i = 0; i < settings.columns.length; i++) {
    settings.columns[i].header = settings.columns[i].label;
    settings.columns[i].key = "col" + (i + 1);
  }

  let data = [];

  for (var i = 0; i < doc.datatable.rows.length; i++) {
    var row = {};
    for (var j = 0; j < settings.columns.length; j++) {
      row[settings.columns[j].key] =
        columnTypes.convertDataTableToFile(doc.datatable.rows[i].c[j].v, doc.datatable.cols[j].type)
    }
    data.push(row);
  }
  
  if (!settings || !settings.columns || (!settings.filename && !settings.outStream)) {
    return Promise.reject();
  }
  
  let workbook = new Exceljs.Workbook();  
  let worksheet = workbook.addWorksheet();

  worksheet.columns = settings.columns;
  worksheet.addRows(data);
  
  if (settings.outStream) {
    return workbook.xlsx.write(settings.outStream);

  } else if (settings.path && settings.filename) {
    return workbook.xlsx.writeFile(settings.path + "/" + settings.filename);

  } else {
    return Promise.reject();
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
