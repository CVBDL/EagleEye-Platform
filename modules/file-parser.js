'use strict';

let Exceljs = require('exceljs');
let ObjectId = require('mongodb').ObjectId;
let Promise = require('es6-promise').Promise;
let fs = require('fs');
let path = require('path');

let chart = require('./chart');
let columnType = require('./column-type');


/**
 * Read data table from a readable xlsx stream.
 * And then update the chart.
 * @method
 *
 * @param {stream.Readable} stream A readable stream represents an .xlsx file.
 * @returns {Promise} It will be resolved with the updated chart document.
 *                    Or rejected with defined errors.
 */
exports.readXLSXStream = function (stream) {
  let workbook = new Exceljs.Workbook();

  return workbook.xlsx.read(stream);
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
 * @returns {Promise} It will be resolved with the updated chart document.
 *                    Or rejected with defined errors.
 */
exports.readImageStream = function (stream) {
  let uid = ObjectId().toHexString();
  let savedFilename = uid + '_' + stream.filename;
  let savedPath = path.join(
    __dirname, '..', 'public', 'upload', savedFilename);

  return new Promise(function (resolve, reject) {
    let fileStream = stream.pipe(fs.createWriteStream(savedPath));

    fileStream.on('finish', function () {
      resolve(savedFilename);
    });

    fileStream.on('error', function (err) {
      reject(err);
    });
  });
};


/**
 * Write data table object to an .xlsx file.
 * <https://github.com/guyonroche/exceljs#streaming-xlsx>
 *
 * @method
 * @param {Stream} stream An output writable stream.
 * @param {Object} datatable Chart data table object.
 * @returns {Promise} A promise will be resolved when finish writing stream.
 *                    Or rejected if an error occurred.
 */
exports.writeXLSXStream = function (stream, datatable) {
  datatable = datatable || {};

  let cols = datatable.cols || [];
  let rows = datatable.rows || [];

  let workbook = new Exceljs.stream.xlsx.WorkbookWriter({
    stream: stream
  });
  let worksheet = workbook.addWorksheet('datatable');

  let columns = [];
  cols.forEach(function (col, index) {
    columns.push({
      header: col.label || '',
      key: 'col' + (index + 1)
    });
  });

  worksheet.columns = columns;

  rows.forEach(function (row) {
    let worksheetRow = [];

    cols.forEach(function (col, colIndex) {
      let cellValue = columnType.convertDataTableToFile(
        row.c[colIndex].v, cols[colIndex].type);

      worksheetRow.push(cellValue);
    });

    worksheet.addRow(worksheetRow).commit();
  });

  worksheet.commit();

  return workbook.commit();
};
