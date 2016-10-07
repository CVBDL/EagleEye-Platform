'use strict';

let fs   = require('fs');
let path = require('path');
let q    = require('q');

let configFilePath = path.join(__dirname, '..', '/config.json');
let config;

exports.load = function() {
  let deferred = q.defer();

  if (config) {
    deferred.resolve(config);

  } else {
    fs.readFile(configFilePath, {
      encoding: 'utf-8'

    }, function(err, data) {
      if (err) {
        deferred.reject(new Error(err));

      } else {
        config = JSON.parse(data);

        deferred.resolve(config);
      }
    });
  }

  return deferred.promise;
};
