'use strict';

let os = require('os');

let utils = require('../../helpers/utils');

describe('helpers: utils', function () {

  it('should return server root endpoint', function () {
    let protocol = 'http';
    let hostname = os.hostname();
    let port = 3000;

    utils.getRootEndpoint().then(function (endpoint) {
      endpoint.should.eql(protocol + '://' + os.hostname() + ':' + port);

    }, function (error) {
      throw new Error(error);
    });
  });

  it('should return API root endpoint', function () {
    let protocol = 'http';
    let hostname = os.hostname();
    let port = 3000;

    utils.getRestApiRootEndpoint().then(function (endpoint) {
      endpoint.should.eql(protocol + '://' + os.hostname() + ':' + port + '/api/v1');

    }, function (error) {
      throw new Error(error);
    });
  });

  it('should use default query options for charts router', function () {
    let params = utils.getQueryParameters({
      query: {}
    });

    params.should.eql({
      sort: [['createdAt', 'desc']]
    });
  });

  it('should be able to sort by `createdAt` in asc order', function () {
    let params = utils.getQueryParameters({
      query: {
        sort: 'createdAt',
        order: 'asc'
      }
    });

    params.should.eql({
      sort: [['createdAt', 'asc']]
    });
  });

  it('should be able to sort by `updatedAt` in asc order', function () {
    let params = utils.getQueryParameters({
      query: {
        sort: 'updatedAt',
        order: 'asc'
      }
    });

    params.should.eql({
      sort: [['updatedAt', 'asc']]
    });
  });

  it('should be able to set `limit` param', function () {
    let params = utils.getQueryParameters({
      query: {
        limit: 30
      }
    });

    params.should.eql({
      sort: [['createdAt', 'desc']],
      limit: 30
    });
  });

  it('should be able to set `start` param', function () {
    let params = utils.getQueryParameters({
      query: {
        limit: 30,
        start: 10
      }
    });

    params.should.eql({
      sort: [['createdAt', 'desc']],
      limit: 30,
      skip: 10
    });
  });

  it('should be able to set `q` param', function () {
    let params = utils.getQueryParameters({
      query: {
        limit: 30,
        start: 10,
        q: 'code ccollaborator'
      }
    });

    params.should.eql({
      sort: [['createdAt', 'desc']],
      limit: 30,
      skip: 10,
      query: 'code ccollaborator'
    });
  });
});
