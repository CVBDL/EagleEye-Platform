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
      "charts_url": rootEndpoint + '/charts',
      "chart_sets_url": rootEndpoint + '/chart-sets',
      "search_url": rootEndpoint + '/search',
      "search_charts_url": rootEndpoint + '/search/charts',
      "search_chart_sets_url": rootEndpoint + '/search/chart-sets',
      "upload_excels_url": rootEndpoint + '/upload/excels',
      "upload_images_url": rootEndpoint + '/upload/images',
      "download_excels_url": rootEndpoint + '/download/excels/:id',
      "jobs_url": rootEndpoint + '/jobs',
      "tasks_url": rootEndpoint + '/tasks'
    });
  });
