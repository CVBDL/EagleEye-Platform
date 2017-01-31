'use strict';

let bodyParser = require('body-parser');
let express = require('express');
let request = require('supertest');
let should = require('should');

let app = require('../../app');
let dbClient = require('../../helpers/dbHelper');
let fixtures = require('../fixtures/charts');

let chart = {
  "chartType": "LineChart",
  "description": "This is a line chart.",
  "options": {
    "title": "Population"
  },
  "datatable": {
    "cols": [
      {
        "label": "City",
        "type": "string"
      },
      {
        "label": "2010 Population",
        "type": "number"
      },
      {
        "label": "2000 Population",
        "type": "number"
      }
    ],
    "rows": [
      {
        "c": [
          { "v": "New York City, NY" },
          { "v": 8175000 },
          { "v": 8008000 }
        ]
      },
      {
        "c": [
          { "v": "Los Angeles, CA" },
          { "v": 3792000 },
          { "v": 3694000 }
        ]
      },
      {
        "c": [
          { "v": "Chicago, IL" },
          { "v": 2695000 },
          { "v": 2896000 }
        ]
      },
      {
        "c": [
          { "v": "Houston, TX" },
          { "v": 2099000 },
          { "v": 1953000 }
        ]
      },
      {
        "c": [
          { "v": "Philadelphia, PA" },
          { "v": 1526000 },
          { "v": 1517000 }
        ]
      }
    ]
  }
};


describe('routes: /charts', function () {

  before(function (done) {
    dbClient.connect(dbClient.MODE_TEST, done);
  });

  beforeEach(function (done) {
    dbClient.drop(function (err) {
      if (err) {
        return done(err);
      }

      dbClient.fixtures(fixtures, done);
    });
  });


  /**
   * List charts.
   * <https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#list-charts>
   */
  describe('GET /api/v1/charts', function () {

    it('should fetch all charts', function (done) {
      request(app)
        .get('/api/v1/charts')
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.length
            .should
            .eql(fixtures.collections.chart_collection.length);
        })
        .expect(200, done);
    });

    it('should sort list by "createdAt" in "asc" desc by default', function (done) {
      request(app)
        .get('/api/v1/charts')
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.length
            .should
            .eql(fixtures.collections.chart_collection.length);

          let chartA = res.body[0];
          let chartB = res.body[1];
          let timestampA = new Date(chartA.createdAt).getTime();
          let timestampB = new Date(chartB.createdAt).getTime();

          timestampA.should.be.aboveOrEqual(timestampB);
        })
        .expect(200, done);
    });

    it('should sort list by "updatedAt" in "asc" order', function (done) {
      request(app)
        .get('/api/v1/charts?sort=updatedAt&order=asc')
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.length
            .should
            .eql(fixtures.collections.chart_collection.length);

          let chartA = res.body[0];
          let chartB = res.body[1];
          let timestampA = new Date(chartA.updatedAt).getTime();
          let timestampB = new Date(chartB.updatedAt).getTime();

          timestampA.should.be.belowOrEqual(timestampB);
        })
        .expect(200, done);
    });

    it('should set limit on result list', function (done) {
      request(app)
        .get('/api/v1/charts?limit=1')
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.length
            .should
            .eql(1);
        })
        .expect(200, done);
    });

    it('should set start and limit on result list', function (done) {
      request(app)
        .get('/api/v1/charts?start=2&limit=1')
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.length
            .should
            .eql(1);

          res.body[0]._id
            .should
            .eql(fixtures.collections.chart_collection[1]._id.toHexString())
        })
        .expect(200, done);
    });

    it('should set a query on result list', function (done) {
      request(app)
        .get('/api/v1/charts?q=Work')
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.length
            .should
            .eql(1);

          res.body[0]._id
            .should
            .eql(fixtures.collections.chart_collection[1]._id.toHexString())
        })
        .expect(200, done);
    });
  });


  /**
   * Create a chart.
   * <https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#create-a-chart>
   */
  describe('POST /api/v1/charts', function () {

    it('should create a normal google chart', function (done) {
      request(app)
        .post('/api/v1/charts')
        .set('Content-Type', 'application/json')
        .send(chart)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body._id.should.be.type('string');

          res.body.createdAt.should.be.type('string');
          res.body.updatedAt.should.be.type('string');
          res.body.createdAt.should.eql(res.body.updatedAt);

          res.body.chartType.should.eql(chart.chartType);
          res.body.description.should.eql(chart.description);
          res.body.datatable.should.eql(chart.datatable);
          res.body.options.should.eql(chart.options);

          res.body.browserDownloadUrl.excel.should.endWith(res.body._id);
          should.equal(null, res.body.browserDownloadUrl.image);
        })
        .expect(200, done);
    });

    it('should create a custom image chart', function (done) {
      let chart = {
        "chartType": "ImageChart",
        "description": "This is an image chart."
      };

      request(app)
        .post('/api/v1/charts')
        .set('Content-Type', 'application/json')
        .send(chart)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body._id.should.be.type('string');

          res.body.createdAt.should.be.type('string');
          res.body.updatedAt.should.be.type('string');
          res.body.createdAt.should.eql(res.body.updatedAt);

          res.body.chartType.should.eql(chart.chartType);
          res.body.description.should.eql(chart.description);

          should.equal(null, res.body.browserDownloadUrl.excel);
          should.equal(null, res.body.browserDownloadUrl.image);
        })
        .expect(200, done);
    });

    it('should include blank fields as a null value', function (done) {
      let chart = {
        chartType: "BarChart"
      };

      request(app)
        .post('/api/v1/charts')
        .set('Content-Type', 'application/json')
        .send(chart)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body._id.should.be.type('string');

          res.body.createdAt.should.be.type('string');
          res.body.updatedAt.should.be.type('string');
          res.body.createdAt.should.eql(res.body.updatedAt);

          res.body.chartType.should.eql(chart.chartType);
          should.equal(null, res.body.description);
          should.equal(null, res.body.datatable);
          should.equal(null, res.body.options);

          res.body.browserDownloadUrl.excel.should.endWith(res.body._id);
          should.equal(null, res.body.browserDownloadUrl.image);
        })
        .expect(200, done);
    });

    it('should response 400 if sent invalid JSON', function (done) {
      let chart = 'invalid_json';

      request(app)
        .post('/api/v1/charts')
        .set('Content-Type', 'application/json')
        .send(chart)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Problems parsing JSON');
        })
        .expect(400, done);
    });

    it('should response 422 if received unprocessable entity', function (done) {
      let chart = {};

      request(app)
        .post('/api/v1/charts')
        .set('Content-Type', 'application/json')
        .send(chart)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Validation Failed');
          res.body.errors.should.eql([
            {
              "resource": "chart",
              "field": "chartType",
              "code": "missing_field"
            }
          ]);
        })
        .expect(422, done);
    });
  });


  /**
   * Delete all charts.
   * <https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#delete-a-chart>
   */
  describe('DELETE /api/v1/charts', function () {

    it('should delete all charts', function (done) {
      request(app)
        .delete('/api/v1/charts')
        .send()
        .expect(204, done);
    });
  });

});
