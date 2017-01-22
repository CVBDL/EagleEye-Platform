'use strict';

let express = require('express');
let utils   = require('../helpers/utils');
let charts  = require('../modules/charts');

let router = express.Router();


// define routes
router.route('/charts')

  // read all charts
  .get(function getCharts(req, res) {
    charts.all(utils.getChartParameter(req), function(err, docs) {
      res.send(docs);
    });
  })

  // create a chart
  .post(function postCharts(req, res) {
    charts.create(req.body, function(err, result) {
      err ? utils.handleError(err, res) : res.send(result);
    });
  })

  // delete all charts
  .delete(function deleteCharts(req, res) {
    charts.clearCollection(function(err, result) {
      res.status(204).send('');
    });
  });


// define routes
router.route('/charts/:id')

  // read a single chart
  .get(function getChart(req, res) {
    let id = req.params.id;

    charts.getOne(id, function(err, docs) {
      if (docs[0] === undefined) {
        res.status(404).send('');

      } else {
        res.send(docs[0]);
      }
    });
  })

  // update a single chart
  .post(function putChart(req, res) {
    let id = req.params.id;

    charts.updateOne(id, req.body, function(err, doc) {
      return err ? utils.handleError(err, res) : res.send(doc.value);
    });
  })

  // delete a single chart
  .delete(function deleteChart(req, res) {
    let id = req.params.id;

    charts.remove(id, function(err, result) {
      res.status(204).send('');
    });
  });


// define routes
router.route('/charts/:id/datatable')

  // update a single chart data table
  .put(function putChartDataTable(req, res) {
    let id = req.params.id;

    charts.updateDataTable(id, req.body, function(err, result) {
      return err ? utils.handleError(err, res) : res.send(result.value);
    });
  });


module.exports = router;
