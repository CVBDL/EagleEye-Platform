'use strict';

let os      = require('os');
let process = require('process');

const protocol = 'http';
const port = process.env.EAGLEEYE_PLATFORM_PORT;

exports.getRootEndpoint = function() {
  return protocol + '://' + os.hostname() + ':' + port;
};

exports.getRestApiRootEndpoint = function() {
  return protocol + '://' + os.hostname() + ':' + port + '/api/v1';;
};

exports.getQueryParameters = function (req) {
  let para = {};
  let queryOption = {};

  ["sort", "order", "limit", "start", "q"].forEach(
    (key) => (
      req.query[key] ? (para[key] = isNaN(req.query[key]) ? req.query[key] : parseInt(req.query[key])) : null
    )
  );

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
