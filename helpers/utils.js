'use strict';

let os = require('os');

let config = require('../modules/config');

let protocol = 'http';

exports.getRestApiRootEndpoint = function() {
  let url = '';
  let port;

  return config.load()
    .then(function(config) {
      port = config.port || 3000;
      url = protocol + '://' + os.hostname() + ':' + port + '/api/v1';

      return url;
    });
};
