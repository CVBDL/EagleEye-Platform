'use strict';

let express = require('express');
let multiparty = require('multiparty');

let utils = require('../helpers/utils');
let errHandlers = require('../helpers/error-handlers');
let charts = require('../modules/charts');
let upload = require('../modules/upload');

let router = module.exports = express.Router();


// define routes
router.route('/charts')

  // read all charts
  .get(function getCharts(req, res) {
    charts.all(utils.getQueryParameters(req))
      .then(function (docs) {
        res.send(docs);
      })
      .catch(function (err) {
        errHandlers.handle(err, req, res);
      });
  })

  // create a chart
  .post(function postCharts(req, res) {
    charts.create(req.body)
      .then(function (result) {
        res.send(result);
      })
      .catch(function (err) {
        errHandlers.handle(err, req, res);
      });
  })

  // delete all charts
  .delete(function deleteCharts(req, res) {
    charts.deleteAll()
      .then(function () {
        res.status(204).send();
      })
      .catch(function (err) {
        errHandlers.handle(err, req, res);
      });
  });


// define routes
router.route('/charts/:id')

  // read a single chart
  .get(function getChart(req, res) {
    let id = req.params.id;
    
    charts.getOne(id)
      .then(function (docs) {
        res.send(docs[0]);
      })
      .catch(function (err) {
        errHandlers.handle(err, req, res);
      });
  })

  // update a single chart
  .post(function putChart(req, res) {
    let id = req.params.id;

    charts.updateOne(id, req.body)
      .then(function (doc) {
        res.send(doc);
      })
      .catch(function (err) {
        errHandlers.handle(err, req, res);
      });
  })

  // delete a single chart
  .delete(function deleteChart(req, res) {
    let id = req.params.id;
    
    charts.deleteOne(id)
      .then(function () {
        res.status(204).send();
      })
      .catch(function (err) {
        errHandlers.handle(err, req, res);
      });
  });


// define routes
router.route('/charts/:id/datatable')

  // update a single chart data table
  .put(function putChartDataTable(req, res) {
    let id = req.params.id;
    
    charts.updateOne(id, { datatable: req.body })
      .then(function (doc) {
        res.send(doc);
      })
      .catch(function (err) {
        errHandlers.handle(err, req, res);
      });
  });


// define routes
router.route('/charts/:id/assets')

  // upload an asset
  .post(function postAssets(req, res) {
    let id = req.params.id;

    // .png and .jpeg image files
    const IMAGE_RE = /^image\/png|image\/jpeg$/;

    // Microsoft .xlsx file
    const XLSX_RE =
      /^application\/vnd\.openxmlformats\-officedocument\.spreadsheetml\.sheet$/;

    let form = new multiparty.Form();
    let processPromise;
    
    form.on('part', function (part) {
      // You *must* act on the part by reading it
      // NOTE: if you want to ignore it, just call "part.resume()"

      part.on('error', function (err) {
        errHandlers.handle(err, req, res);
      });
      
      if (part.name === 'file' && part.filename) {
        let contentType = part.headers['content-type'];

        if (XLSX_RE.test(contentType)) {
          processPromise = upload.processXLSXStream(part, id)
            .then(function (doc) {
              res.send(doc);
            })
            .catch(function (err) {
              errHandlers.handle(err, req, res);
            });

        } else if (IMAGE_RE.test(contentType)) {
          processPromise = upload.processImageStream(part, id)
            .then(function (doc) {
              res.send(doc);
            })
            .catch(function (err) {
              errHandlers.handle(err, req, res);
            });

        } else {
          // ignore the chunk of data
          part.resume();
        }

      } else {
        // ignore the chunk of data
        part.resume();
      }
    });

    form.on('close', function () {
      if (processPromise) {
        processPromise
          .then(function (doc) {
            res.send(doc);
          })
          .catch(function (err) {
            errHandlers.handle(err, req, res);
          });

      } else {
        let err = new Error();
        err.status = 400;
        err.customMessage = 'Problems parsing data';

        errHandlers.handle(err, req, res);
      }
    });

    // begin parse form data
    form.parse(req);
  });
