'use strict';

let Exceljs = require('exceljs');
let Promise = require('es6-promise').Promise;
let fs = require('fs');
let path = require('path');

let charts = require('./charts');


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
exports.processXLSXStream = function (stream, id) {
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
exports.processImageStream = function (stream, id) {
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
