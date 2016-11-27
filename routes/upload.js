'use strict';

let express = require('express');
let fs      = require('fs');
let path    = require('path');

let charts      = require('../modules/charts');
let excelHelper = require('../helpers/excelHelper');
let excel       = require('../modules/excel');

let router  = express.Router();


// define routes
router.route('/upload/excels')

  // upload excel
  .post(function uploadExcel(req, multipartyMiddleware) {
    let file = req.files.file;
    let fileName = "";

    if (file.path.indexOf("/") > -1) {
      let pathArray = file.path.split("/");
      fileName = pathArray[pathArray.length - 1];
    } else {
      let pathArray = file.path.split("\\");
      fileName = pathArray[pathArray.length - 1];
    }

    charts.getOne(req.body.id, function(err, docs) {
      if (docs.length < 1) {
        multipartyMiddleware.send('failed');
        return;
      }

      excel.updateFromFileToDB(docs[0], { filename: fileName, worksheet: "Data" }, function(result) {
        multipartyMiddleware.send('ok');

        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    });
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
    let targetPath = path.join(__dirname, '../public/uploadChartImages/' + targetFileName)

    charts.updateImageChartFile(req.body.id, targetFileName, function(err, result) {
      if (err) {
        multipartyMiddleware.send('failed');
        return;
      } else
        multipartyMiddleware.send('ok');

      let stream = fs.createReadStream(file.path).pipe(fs.createWriteStream(targetPath));
      stream.on('finish', () => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    });
  });


module.exports = router;
