'use strict';

let express = require('express');
let utils = require('../helpers/utils');
let chartSets = require('../modules/chart-sets');

let router = module.exports = express.Router();


// define routes
router.route('/chart-sets')

  // read all chart sets
  .get(function getChartSets(req, res, next) {
    chartSets.list(utils.getQueryParameters(req))
      .then(function (docs) {
        res.send(docs);
      })
      .catch(next);
  })

  // create a chart set
  .post(function postChartSets(req, res, next) {
    chartSets.create(req.body)
      .then(function (result) {
        res.send(result);
      })
      .catch(next);
  })

  // delete all chart sets
  .delete(function deleteChartSets(req, res, next) {
    chartSets.deleteAll()
      .then(function () {
        res.status(204).send();
      })
      .catch(next);
  });


// define routes
router.route('/chart-sets/:id')

  // read a single chart set
  .get(function getSingleChartSet(req, res, next) {
    let id = req.params.id;

    chartSets.get(id)
      .then(function (doc) {
        res.send(doc);
      })
      .catch(next);
  })

  // update a single chart set
  .post(function postChartSet(req, res, next) {
    let id = req.params.id;

    chartSets.update(id, req.body)
      .then(function (doc) {
        res.send(doc);
      })
      .catch(next);
  })

  // delete a single chart set
  .delete(function deleteSingleChartSet(req, res, next) {
    let id = req.params.id;
    
    chartSets.delete(id)
      .then(function () {
        res.status(204).send();
      })
      .catch(next);
  });
