'use strict';

let express = require('express');

let charts = require('../modules/charts');
let excel = require('../modules/excel');
let errHandlers = require('../helpers/error-handlers');

let router = module.exports = express.Router();


// define routes
router.route('/download/excels/:id')

  // download an Excel
  .get(function downloadExcel(req, res) {
    let id = req.params.id;
    
    charts.getOne(req.params.id)
      .then(function (docs) {
        if (docs.length > 0) {
          res.setHeader('Content-disposition', 'attachment; filename=' + (docs[0]._id) + '.xlsx');
          res.setHeader('Content-type', 'application/vnd.ms-excel');
          excel.writeOne(docs[0], {
            "outStream": res,
            "worksheet": "Data",
          }, () => console.log());
        }
      })
      .catch(function (err) {
        errHandlers.handle(err, req, res);
      });
  });
