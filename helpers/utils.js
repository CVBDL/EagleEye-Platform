'use strict';

let os = require('os');

let config = require('../modules/config');

let protocol = 'http';

exports.getRootEndpoint = function() {
  let url = '';
  let port;

  return config.load().then(function(config) {
    port = config.port || 3000;
    url = protocol + '://' + os.hostname() + ':' + port;

    return url;
  });
};

exports.getRestApiRootEndpoint = function() {
  let url = '';
  let port;

  return config.load().then(function(config) {
    port = config.port || 3000;
    url = protocol + '://' + os.hostname() + ':' + port + '/api/v1';

    return url;
  });
};

exports.getChartParameter = function(req) {
  let para = {};
  ["sort", "order", "limit", "start", "q"].forEach((key) => (req.query[key] ? (para[key] = isNaN(req.query[key]) ? req.query[key] : parseInt(req.query[key])) : null));
  let queryOption = {};

  if (!para.sort || !new Set(["createdAt", "updatedAt", "chartType"]).has(para.sort)) {
    para.sort = "createdAt";
  }
  if (!para.order || !new Set(["asc", "desc"]).has(para.order.toLowerCase())) {
    para.order = "desc";
  }
  queryOption.sort = [];
  queryOption.sort.push([para.sort, para.order.toLowerCase()]);

  if (para.start) {
    queryOption.skip = para.start;
  }
  if (para.limit) {
    queryOption.limit = para.limit;
  }
  if (para.q) {
    queryOption.query = para.q;
  }
  return queryOption;
};

exports.getChartSetParameter = function(req) {
  let para = {};
  ["sort", "order", "limit", "start", "q"].forEach((key) => (req.query[key] ? (para[key] = isNaN(req.query[key]) ? req.query[key] : parseInt(req.query[key])) : null));

  let queryOption = {};

  if (!para.sort || !new Set(["createdAt", "updatedAt"]).has(para.sort)) {
    para.sort = "createdAt";
  }
  if (!para.order || !new Set(["asc", "desc"]).has(para.order.toLowerCase())) {
    para.order = "desc";
  }
  queryOption.sort = [];
  queryOption.sort.push([para.sort, para.order.toLowerCase()]);

  if (para.start) {
    queryOption.skip = para.start;
  }
  if (para.limit) {
    queryOption.limit = para.limit;
  }
  if (para.q) {
    queryOption.query = para.q;
  }
  return queryOption;
};

exports.handleError = function(err, res) {
  res.status(400).send({
    "message": err.message,
    "errors": [err]
  });
};

