'use strict';

let Promise = require('es6-promise').Promise;

let config = require('../../modules/config');

describe('modules: config', function () {

  it('should return a Promise', function () {
    let result = config.load();

    result.should.instanceOf(Promise);
  });

  it('should load configurations', function () {
    let configContent = {
      "port": 3000
    };
 
    config.load().then(function (config) {
      config.should.eql(configContent);

    }, function (reason) {
      reason.should.eql('An error occurred loading configuration file.');
    });
  });
});
