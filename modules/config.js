'use strict';

let Promise = require('es6-promise').Promise;
let fs      = require('fs');
let path    = require('path');
let q       = require('q');

let configFilePath = path.join(__dirname, '..', '/config.json');
let config;

exports.load = function () {

  return new Promise(function (resolve, reject) {
    if (config) {
      resolve(config);

    } else {
      fs.readFile(configFilePath, {
        encoding: 'utf-8'

      }, function (err, data) {
        if (err) {
          reject('An error occurred loading configuration file.');

        } else {
          config = JSON.parse(data);

          resolve(config);
        }
      });
    }
  });
};
