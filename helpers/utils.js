'use strict';

let os = require('os');

let validators = require('./validators');

const protocol = 'http';
const port = process.env.EAGLEEYE_PLATFORM_PORT || '3000';

exports.getRootEndpoint = function () {
  return protocol + '://' + os.hostname() + ':' + port;
};

exports.getRestApiRootEndpoint = function () {
  return protocol + '://' + os.hostname() + ':' + port + '/api/v1';
};

exports.getQueryParameters = function (req) {
  const queryParameters = ["sort", "order", "limit", "start", "q"];

  let params = {};
  let queryOption = {};

  queryParameters.forEach(function (queryParameter) {
    if (validators.isDefined(req.query[queryParameter])) {
      params[queryParameter] = req.query[queryParameter];
    }
  });

  if (!params.sort ||
    !new Set(["createdAt", "updatedAt"]).has(params.sort)) {

    params.sort = "createdAt";
  }

  if (!params.order ||
    !new Set(["asc", "desc"]).has(params.order.toLowerCase())) {

    params.order = "desc";
  }

  queryOption.sort = [];
  queryOption.sort.push([params.sort, params.order.toLowerCase()]);

  let start = parseInt(params.start, 10);

  if (!isNaN(start)) {
    queryOption.skip = start - 1;
  }

  let limit = parseInt(params.limit, 10);

  if (!isNaN(limit)) {
    queryOption.limit = limit;
  }

  if (params.q) {
    queryOption.query = params.q;
  }

  return queryOption;
};
