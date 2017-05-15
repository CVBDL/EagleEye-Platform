'use strict';

let express = require('express');
let request = require('supertest');
let should = require('should');
let sinon = require('sinon');

require('should-sinon');

let utils = require('../../helpers/utils');
let app = require('../../app');

describe('routes: /', function () {

  /**
   * List all endpoints.
   */
  describe('GET /api/v1/', function () {

    const rootEndpoint = '/api/v1';

    beforeEach(function () {
      utils.getRestApiRootEndpoint = sinon.stub().returns(rootEndpoint);
    });

    it('should list all endpoints', function (done) {
      let endpoints = {
        "root_endpoint_url": rootEndpoint,
        "charts_url": rootEndpoint + '/charts',
        "chart_file_upload": rootEndpoint + '/charts/:_id/files',
        "chart_sets_url": rootEndpoint + '/chart-sets',
        "search_url": rootEndpoint + '/search',
        "search_charts_url": rootEndpoint + '/search/charts',
        "search_chart_sets_url": rootEndpoint + '/search/chart-sets',
        "jobs_url": rootEndpoint + '/jobs',
        "tasks_url": rootEndpoint + '/tasks'
      };

      request(app)
        .get('/api/v1/')
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.should.eql(endpoints);
        })
        .expect(200, done);
    });
  });
});
