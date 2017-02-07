'use strict';

let express   = require('express');
let utils     = require('../helpers/utils');
let chartSets = require('../modules/chart-sets');
let errHandlers = require('../helpers/error-handlers');

let router = module.exports = express.Router();


// define routes
router.route('/chart-sets')

  // read all chart sets
  .get(function getChartSets(req, res) {
    chartSets.all(utils.getQueryParameters(req))
      .then(function (docs) {
        res.send(docs);
      })
      .catch(function (err) {
        errHandlers.handle(err, req, res);
      });
  })

  // create a chart set
  .post(function postChartSets(req, res) {
    chartSets.create(req.body)
      .then(function (result) {
        res.send(result);
      })
      .catch(function (err) {
        errHandlers.handle(err, req, res);
      });
  })

  // delete all chart sets
  .delete(function deleteChartSets(req, res) {
    chartSets.clearCollection(function(err, result) {
      res.status(204).send('');
    });
  });


// define routes
router.route('/chart-sets/:id')

  // read a single chart set
  .get(function getSingleChartSet(req, res) {
    let id = req.params.id;

    chartSets.getOne(id).then(function(doc) {
      doc ? res.send(doc) : res.status(404).send('');
    });
  })

  // update a single chart set
  .post(function putSingleChartSet(req, res) {
    let id = req.params.id;

    chartSets.updateOne(id, req.body, function(err, doc) {
      err ? errHandlers.handleInternalServerError(err, req, res) : res.send(doc.value);
    });
  })

  // delete a single chart set
  .delete(function deleteSingleChartSet(req, res) {
    let id = req.params.id;

    chartSets.remove(id, function(err, result) {
      res.status(204).send('');
    });
  });
