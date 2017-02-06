'use strict';

let Exceljs = require('exceljs');
let express = require('express');
let fs = require('fs');
let multiparty = require('multiparty');
let path = require('path');

let charts = require('../modules/charts');
let excelHelper = require('../helpers/excelHelper');
let errHandlers = require('../helpers/error-handlers');

let router = express.Router();


// define routes
router.route('/upload/excels')

  // upload excel
  .post(function uploadExcel(req, res) {
    let form = new multiparty.Form();
    let readFilePromise;
    let id;

    form.on('field', function (name, value) {
      if (name === 'id') {
        id = value;
      }
    });
    
    form.on('part', function (part) {
      // You *must* act on the part by reading it
      // NOTE: if you want to ignore it, just call "part.resume()"

      part.on('error', function (err) {
        console.log(err);
      });
      
      if (part.name === 'file' && part.filename) {
        let workbook = new Exceljs.Workbook();

        readFilePromise = workbook.xlsx.read(part);

      } else {
        part.resume();
      }
    });

    // Close emitted after form parsed
    form.on('close', function () {
      readFilePromise
        .then(function (workbook) {
          return charts.updateDataTableFromXlsx(id, workbook);
        })
        .then(function (doc) {
          res.send(doc);
        })
        .catch(function (err) {
          errHandlers.handle(err, req, res);
        });
    });
    
    form.parse(req);
  });


// define routes
router.route('/upload/images')

  // upload image
  .post(function uploadImage(req, res) {
    let form = new multiparty.Form();
    let savedFilename = '';
    let savedPath = '';
    let fileStream;
    let id;

    form.on('field', function (name, value) {
      if (name === 'id') {
        id = value;
      }
    });

    form.on('part', function (part) {
      // You *must* act on the part by reading it
      // NOTE: if you want to ignore it, just call "part.resume()"

      part.on('error', function (err) {
        console.log(err);
      });

      if (part.name === 'file' && part.filename) {
        savedFilename = Math.ceil(Math.random() * 1000000) + '_' + part.filename;
        savedPath = path.join(
          __dirname, '../public/upload/' + savedFilename);

        fileStream = part.pipe(fs.createWriteStream(savedPath));

      } else {
        part.resume();
      }
    });

    // Close emitted after form parsed
    form.on('close', function () {
      fileStream.on('finish', function () {
        charts.updateImageBrowserDownloadUrl(id, savedFilename)
          .then(function (doc) {
            res.send(doc);
          })
          .catch(function (err) {
            errHandlers.handle(err, req, res);
          });
      });
    });

    form.parse(req);
  });


module.exports = router;
