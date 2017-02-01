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
      
      if (!part.filename) {
        part.resume();
      }

      if (part.filename) {
        let workbook = new Exceljs.Workbook();

        readFilePromise = workbook.xlsx.read(part);
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
  .post(function uploadImage(req, multipartyMiddleware) {
    let file = req.files.file;
    let fileName = "";

    if (file.path.indexOf("/") > -1) {
      let pathArray = file.path.split("/");
      fileName = pathArray[pathArray.length - 1];
    } else {
      let pathArray = file.path.split("\\");
      fileName = pathArray[pathArray.length - 1];
    }

    let targetFileName = 'IC_' + Math.ceil(Math.random() * 1000000) + fileName;
    let targetPath = path.join(
      __dirname, '../public/uploadChartImages/' + targetFileName);
    
    charts.updateImageBrowserDownloadUrl(req.body.id, targetFileName)
      .then(function (doc) {
        multipartyMiddleware.send('ok');

        let stream = fs.createReadStream(file.path)
          .pipe(fs.createWriteStream(targetPath));

        stream.on('finish', function () {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      })
      .catch(function (error) {
        multipartyMiddleware.send('failed');
      });
  });


module.exports = router;
