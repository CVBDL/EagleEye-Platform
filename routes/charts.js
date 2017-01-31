'use strict';

let express = require('express');

let utils      = require('../helpers/utils');
let charts     = require('../modules/charts');
let errHandlers = require('../helpers/error-handlers');

let router = express.Router();


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
        if (docs[0] === undefined) {
          res.status(404).send('');

        } else {
          res.send(docs[0]);
        }
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


module.exports = router;
