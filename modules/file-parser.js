'use strict';

let Exceljs = require('exceljs');
let Promise = require('es6-promise').Promise;
let fs = require('fs');
let path = require('path');

let charts = require('./charts');
let columnTypes = require('../helpers/column-types');


/**
 * Read data table from a readable xlsx stream.
 * And then update the chart.
 * @method
 *
 * @param {stream.Readable} stream A readable stream represents an .xlsx file.
 * @param {string} id The chart's '_id' property. Its 'datatable' will be updated.
 * @returns {Promise} It will be resolved with the updated chart document.
 *                    Or rejected with defined errors.
 */
exports.readXLSXStream = function (stream, id) {
  let workbook = new Exceljs.Workbook();

  return workbook.xlsx.read(stream)
    .then(function (workbook) {
      return charts.updateDataTableFromXlsx(id, workbook);
    });
};


/**
 * Read the upload chart from a readable stream.
 * And then save the chart on server, update the chart's 'image' URL.
 *
 * Allowed image formats:
 *
 * 1. .png (Content-Type: image/png)
 * 2. .jpg or .jpeg (Content-Type: image/jpeg)
 *
 * @method
 *
 * @param {stream.Readable} stream A readable stream represents an acceptable image.
 * @param {string} id The chart's '_id' property. Its 'datatable' will be updated.
 * @returns {Promise} It will be resolved with the updated chart document.
 *                    Or rejected with defined errors.
 */
exports.readImageStream = function (stream, id) {
  let savedFilename = id + '_' + Date.now() + '_' + stream.filename;
  let savedPath = path.join(
    __dirname, '../public/upload/' + savedFilename);

  return new Promise(function (resolve, reject) {
    let fileStream = stream.pipe(fs.createWriteStream(savedPath));

    fileStream.on('finish', function () {
      charts.updateImageBrowserDownloadUrl(id, savedFilename)
        .then(function (doc) {
          resolve(doc);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  });
};


/**
 * Write data table object to an .xlsx file.
 *
 * @method
 * @param {Stream} stream An output writable stream.
 * @param {Object} datatable Chart data table object.
 * @returns {Promise} A promise will be resolved when finish writing stream.
 *                    Or rejected if an error occurred.
 */
exports.writeXLSXStream = function (stream, datatable) {
  datatable = datatable || {};

  let columns = datatable.cols || [];
  let rows = datatable.rows || [];
  let data = [];

  for (let i = 0; i < columns.length; i++) {
    columns[i].header = columns[i].label;
    columns[i].key = "col" + (i + 1);
  }
  
  for (let i = 0; i < rows.length; i++) {
    let row = {};
    for (let j = 0; j < columns.length; j++) {
      row[columns[j].key] =
        columnTypes.convertDataTableToFile(rows[i].c[j].v,
                                           datatable.cols[j].type);
    }
    data.push(row);
  }
  
  let workbook = new Exceljs.Workbook();
  let worksheet = workbook.addWorksheet();

  worksheet.columns = columns;
  worksheet.addRows(data);

  return workbook.xlsx.write(stream);
  //return workbook.xlsx.writeFile(settings.path + "/" + settings.filename);
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
