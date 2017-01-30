/**
 * @todo Result limit to 100.
 */

'use strict';

let express    = require('express');
let utils      = require('../helpers/utils');
let charts     = require('../modules/charts');
let chartSets  = require('../modules/chart-sets');

let router = express.Router();


// define routes
router.route('/search')
  .get(function search(req, res) {
    charts.all(utils.getQueryParameters(req))
      .then(function (chartDocs) {
        chartSets.all(utils.getQueryParameters(req), function (err, chartSetDocs) {
          var totalCount = chartDocs.length + chartSetDocs.length;
          var items = chartSetDocs.concat(chartDocs);

          res.send({
            total_count: totalCount,
            items: items
          });
        });
      })
      .catch(function (err) {
        errHandlers.handle(err, req, res);
      });
  });


// define routes
router.route('/search/charts')
  .get(function searchCharts(req, res) {
    charts.all(utils.getQueryParameters(req))
      .then(function (docs) {
        res.send({
          total_count: docs.length,
          items: docs
        });
      })
      .catch(function (err) {
        errHandlers.handle(err, req, res);
      });
  });


// define routes
router.route('/search/chart-sets')
  .get(function searchChartSets(req, res) {
    chartSets.all(utils.getQueryParameters(req), function(err, docs) {
      res.send({
        total_count: docs.length,
        items: docs
      });
    });
  });


module.exports = router;
