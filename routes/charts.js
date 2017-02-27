'use strict';

let express = require('express');
let multiparty = require('multiparty');

let utils = require('../helpers/utils');
let chart = require('../modules/chart');
let dataTable = require('../modules/data-table');
let fileParser = require('../modules/file-parser');

let router = module.exports = express.Router();


// define routes
router.route('/charts')

  // read all charts
  .get(function getCharts(req, res, next) {
    chart.list(utils.getQueryParameters(req))
      .then(function (docs) {
        res.send(docs);
      })
      .catch(next);
  })

  // create a chart
  .post(function postCharts(req, res, next) {
    chart.create(req.body)
      .then(function (doc) {
        res.send(doc);
      })
      .catch(next);
  })

  // delete all charts
  .delete(function deleteCharts(req, res, next) {
    chart.deleteAll()
      .then(function () {
        res.status(204).send();
      })
      .catch(next);
  });


// define routes
router.route('/charts/:id')

  // read a single chart
  .get(function getChart(req, res, next) {
    let id = req.params.id;

    chart.get(id)
      .then(function (docs) {
        res.send(docs[0]);
      })
      .catch(next);
  })

  // update a single chart
  .post(function postChart(req, res, next) {
    let id = req.params.id;

    chart.update(id, req.body)
      .then(function (doc) {
        res.send(doc);
      })
      .catch(next);
  })

  // delete a single chart
  .delete(function deleteChart(req, res, next) {
    let id = req.params.id;

    chart.delete(id)
      .then(function () {
        res.status(204).send();
      })
      .catch(next);
  });


// define routes
router.route('/charts/:id/datatable')

  // update a single chart data table
  .put(function putChartDataTable(req, res, next) {
    let id = req.params.id;

    chart.update(id, { datatable: req.body })
      .then(function (doc) {
        res.send(doc);
      })
      .catch(next);
  })

  // get an asset
  .get(function getDataTable(req, res, next) {
    let id = req.params.id;
    let format = req.query.format || '';

    if (format === 'json') {
      chart.get(id)
        .then(function (docs) {
          res.send(docs[0].datatable);
        })
        .catch(next);

    } else if (format === 'xlsx') {
      chart.get(id)
        .then(function (docs) {
          res.setHeader('Content-disposition', 'attachment; filename=' + (docs[0]._id) + '.xlsx');
          res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

          dataTable.toXLSXStream(docs[0].datatable, res);
        })
        .catch(next);

    } else {
      let err = new Error();
      err.status = 404;
      next(err);
    }
  });


// define routes
router.route('/charts/:id/assets')

  // upload an asset
  .post(function postAssets(req, res, next) {
    let id = req.params.id;

    // .png and .jpeg image files
    const IMAGE_RE = /^image\/png|image\/jpeg$/;

    // Microsoft .xlsx file
    const XLSX_RE =
      /^application\/vnd\.openxmlformats\-officedocument\.spreadsheetml\.sheet$/;

    let form = new multiparty.Form();
    let actionPromise;

    form.on('part', function (part) {
      // You *must* act on the part by reading it
      // NOTE: if you want to ignore it, just call "part.resume()"

      part.on('error', next);

      if (part.name === 'file' && part.filename) {
        let contentType = part.headers['content-type'];

        if (XLSX_RE.test(contentType)) {
          actionPromise = dataTable
            .fromXLSXStream(part)
            .then(function (datatable) {
              return chart.update(id, {
                datatable: datatable
              });
            });

        } else if (IMAGE_RE.test(contentType)) {
          actionPromise = fileParser
            .readImageStream(part)
            .then(function (filename) {
              return chart.update(id, {
                browserDownloadUrl: {
                  image: filename
                }
              });
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
      if (actionPromise) {
        actionPromise
          .then(function (doc) {
            res.send(doc);
          })
          .catch(next);

      } else {
        let err = new Error();
        err.status = 400;
        err.customMessage = 'Problems parsing data';

        next(err);
      }
    });

    // begin parse form data
    form.parse(req);
  });
