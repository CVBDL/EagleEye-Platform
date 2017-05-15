'use strict';

let express = require('express');

let utils   = require('../helpers/utils');

let router = module.exports = express.Router();


// define routes
router.route('/')

  // list all the endpoint categories
  .get(function getRootEndpoint(req, res) {
    const rootEndpoint = utils.getRestApiRootEndpoint();

    res.send({
      "root_endpoint_url": rootEndpoint,
      "charts_url": rootEndpoint + '/charts',
      "chart_file_upload": rootEndpoint + '/charts/:_id/files',
      "chart_sets_url": rootEndpoint + '/chart-sets',
      "search_url": rootEndpoint + '/search',
      "search_charts_url": rootEndpoint + '/search/charts',
      "search_chart_sets_url": rootEndpoint + '/search/chart-sets',
      "jobs_url": rootEndpoint + '/jobs',
      "tasks_url": rootEndpoint + '/tasks'
    });
  });
