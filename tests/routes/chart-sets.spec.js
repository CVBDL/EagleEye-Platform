'use strict';

let bodyParser = require('body-parser');
let express = require('express');
let fs = require('fs');
let path = require('path');
let request = require('supertest');
let should = require('should');

let app = require('../../app');
let dbClient = require('../../helpers/dbHelper');
let chartSetsFixtures = require('../fixtures/chart-sets');
let chartsFixtures = require('../fixtures/charts');

const chartSet = {
  "title": "Chart set sample",
  "description": "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
  "charts": ["588edf0a60514b38109e7f41", "588edf0a60514b38109e7f43"]
};

describe('routes: /chart-sets', function () {

  before(function (done) {
    dbClient.connect(dbClient.MODE_TEST, done);
  });

  beforeEach(function (done) {
    dbClient.drop(function (err) {
      if (err) {
        return done(err);
      }

      dbClient.fixtures(chartSetsFixtures, function () {
        dbClient.fixtures(chartsFixtures, done);
      });
    });
  });


  /**
   * List chart sets.
   * <https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#list-chart-sets>
   */
  describe('GET /api/v1/chart-sets', function () {

    const ENDPOINT = '/api/v1/chart-sets';

    it('should fetch all chart sets', function (done) {
      request(app)
        .get(ENDPOINT)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.length
            .should
            .eql(chartSetsFixtures.collections.chart_set_collection.length);
        })
        .expect(200, done);
    });

    it('should sort list by "createdAt" in "asc" desc by default', function (done) {
      request(app)
        .get(ENDPOINT)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.length
            .should
            .eql(chartSetsFixtures.collections.chart_set_collection.length);

          let chartSetA = res.body[0];
          let chartSetB = res.body[1];
          let timestampA = new Date(chartSetA.createdAt).getTime();
          let timestampB = new Date(chartSetB.createdAt).getTime();

          timestampA.should.be.aboveOrEqual(timestampB);
        })
        .expect(200, done);
    });

    it('should sort list by "updatedAt" in "asc" order', function (done) {
      let _endpoint = ENDPOINT + '?sort=updatedAt&order=asc';

      request(app)
        .get(_endpoint)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.length
            .should
            .eql(chartSetsFixtures.collections.chart_set_collection.length);

          let chartSetA = res.body[0];
          let chartSetB = res.body[1];
          let timestampA = new Date(chartSetA.updatedAt).getTime();
          let timestampB = new Date(chartSetB.updatedAt).getTime();

          timestampA.should.be.belowOrEqual(timestampB);
        })
        .expect(200, done);
    });

    it('should set limit on result list', function (done) {
      let _endpoint = ENDPOINT + '?limit=1';

      request(app)
        .get(_endpoint)
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
      let _endpoint = ENDPOINT + '?start=2&limit=1';

      request(app)
        .get(_endpoint)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.length
            .should
            .eql(1);

          res.body[0]._id
            .should
            .eql(chartSetsFixtures.collections.chart_set_collection[1]._id.toHexString())
        })
        .expect(200, done);
    });

    it('should set a query on result list', function (done) {
      let _endpoint = ENDPOINT + '?q=AAA LLL';

      request(app)
        .get(_endpoint)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.length
            .should
            .eql(2);
        })
        .expect(200, done);
    });
  });


  /**
   * Create a chart set.
   * <https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#create-a-chart-set>
   */
  describe('POST /api/v1/chart-sets', function () {

    const ENDPOINT = '/api/v1/chart-sets';

    it('should create a chart set', function (done) {
      request(app)
        .post(ENDPOINT)
        .set('Content-Type', 'application/json')
        .send(chartSet)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body._id.should.be.type('string');

          res.body.createdAt.should.be.type('string');
          res.body.updatedAt.should.be.type('string');
          res.body.createdAt.should.eql(res.body.updatedAt);

          res.body.title.should.eql(chartSet.title);
          res.body.description.should.eql(chartSet.description);
          res.body.charts.should.eql(chartSet.charts);
        })
        .expect(200, done);
    });

    it('should include blank fields as a null value', function (done) {
      let chartSet = {
        charts: []
      };

      request(app)
        .post(ENDPOINT)
        .set('Content-Type', 'application/json')
        .send(chartSet)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body._id.should.be.type('string');

          res.body.createdAt.should.be.type('string');
          res.body.updatedAt.should.be.type('string');
          res.body.createdAt.should.eql(res.body.updatedAt);

          should.equal(null, res.body.title);
          should.equal(null, res.body.description);

          res.body.charts.should.eql([]);
        })
        .expect(200, done);
    });
    
    it('should response 400 if sent invalid JSON', function (done) {
      let chartSet = 'invalid_json';

      request(app)
        .post(ENDPOINT)
        .set('Content-Type', 'application/json')
        .send(chartSet)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Problems parsing JSON');
        })
        .expect(400, done);
    });

    it('should response 422 if received unprocessable charts', function (done) {
      let chartSet = {
        charts: ''
      };

      request(app)
        .post(ENDPOINT)
        .set('Content-Type', 'application/json')
        .send(chartSet)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Validation Failed');
          res.body.errors.should.eql([
            {
              "resource": "chart-sets",
              "field": "charts",
              "code": "invalid"
            }
          ]);
        })
        .expect(422, done);
    });
  });


  /**
   * Delete all chart sets.
   * <https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#delete-all-chart-sets>
   */
  describe('DELETE /api/v1/chart-sets', function () {

    const ENDPOINT = '/api/v1/chart-sets';

    it('should delete all chart sets', function (done) {
      request(app)
        .delete(ENDPOINT)
        .send()
        .expect(204, done);
    });
  });
});


describe('routes: /chart-sets/:id', function () {

  before(function (done) {
    dbClient.connect(dbClient.MODE_TEST, done);
  });

  beforeEach(function (done) {
    dbClient.drop(function (err) {
      if (err) {
        return done(err);
      }

      dbClient.fixtures(chartSetsFixtures, function () {
        dbClient.fixtures(chartsFixtures, done);
      });
    });
  });


  /**
   * Get a single chart set.
   * <https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#get-a-single-chart-set>
   */
  describe('GET /api/v1/chart-sets/:_id', function () {

    it('should fetch a single chart set with the given id', function (done) {
      let id = chartSetsFixtures
        .collections.chart_set_collection[1]._id.toHexString();

      request(app)
        .get(`/api/v1/chart-sets/${id}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body._id.should.eql(id);
          res.body.charts.length
            .should
            .eql(chartSetsFixtures.collections.chart_set_collection[1].charts.length);

          let fixture = chartsFixtures.collections.chart_collection[1];

          res.body.charts[0]._id
            .should
            .eql(fixture._id.toHexString());
        })
        .expect(200, done);
    });

    it('should response 422 if sent invalid id', function (done) {
      let id = '0';

      request(app)
        .get(`/api/v1/chart-sets/${id}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Validation Failed');
          res.body.errors.should.eql([
            {
              "resource": "chart-sets",
              "field": "_id",
              "code": "invalid"
            }
          ]);
        })
        .expect(422, done);
    });

    it('should response 404 if cannot find the record', function (done) {
      let id = '000000000000000000000000';

      request(app)
        .get(`/api/v1/chart-sets/${id}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Not Found');
        })
        .expect(404, done);
    });
  });


  /**
   * Edit a chart set.
   * <https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#edit-a-chart-set>
   */
  describe('POST /api/v1/chart-sets/:_id', function () {

    it('should update chart description', function (done) {
      let fixture = chartSetsFixtures.collections.chart_set_collection[1]
      let id = fixture._id.toHexString();

      request(app)
        .post(`/api/v1/chart-sets/${id}`)
        .set('Content-Type', 'application/json')
        .send(chartSet)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body._id.should.eql(id);
          res.body.description.should.eql(chartSet.description);
          res.body.title.should.eql(chartSet.title);
          res.body.charts.should.eql(chartSet.charts);
          
          res.body.createdAt
            .should
            .eql(fixture.createdAt);

          // should update `updatedAt` field
          // use 1 second threshold
          (Date.now() - new Date(res.body.updatedAt).getTime())
            .should
            .belowOrEqual(1000);
        })
        .expect(200, done);
    });

    it('should not update fields other than title, description or charts',
      function (done) {
        let fixture = chartSetsFixtures.collections.chart_set_collection[0];
        let id = fixture._id.toHexString();
        let data = {
          custom: 'Some custom data'
        };

        request(app)
          .post(`/api/v1/chart-sets/${id}`)
          .set('Content-Type', 'application/json')
          .send(data)
          .expect('Content-Type', /json/)
          .expect(function (res) {
            res.body._id.should.eql(id);
            should.equal(res.body.custom, undefined);

            // should leave unchanged
            res.body.title
              .should
              .eql(fixture.title);

            res.body.description
              .should
              .eql(fixture.description);

            res.body.createdAt
              .should
              .eql(fixture.createdAt);

            // should update `updatedAt` field
            // use 1 second threshold
            (Date.now() - new Date(res.body.updatedAt).getTime())
              .should
              .belowOrEqual(1000);
          })
          .expect(200, done);
      });

    it('should response 422 if sent invalid id', function (done) {
      let id = '0';
      let data = {};

      request(app)
        .post(`/api/v1/chart-sets/${id}`)
        .set('Content-Type', 'application/json')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Validation Failed');
          res.body.errors.should.eql([
            {
              "resource": "chart-sets",
              "field": "_id",
              "code": "invalid"
            }
          ]);
        })
        .expect(422, done);
    });

    it('should response 404 if cannot find the record', function (done) {
      let id = '000000000000000000000000';
      let data = {};

      request(app)
        .post(`/api/v1/chart-sets/${id}`)
        .set('Content-Type', 'application/json')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Not Found');
        })
        .expect(404, done);
    });
  });


  /**
   * Delete a chart set.
   * <https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#delete-a-chart-set>
   */
  describe('DELETE /api/v1/charts/:_id', function () {

    it('should delete a chart set with given id', function (done) {
      let id = chartSetsFixtures.collections.chart_set_collection[0]._id.toHexString();

      request(app)
        .delete(`/api/v1/chart-sets/${id}`)
        .send()
        .expect(204, done);
    });

    it('should response 422 if sent invalid id', function (done) {
      let id = '0';

      request(app)
        .delete(`/api/v1/chart-sets/${id}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Validation Failed');
          res.body.errors.should.eql([
            {
              "resource": "chart-sets",
              "field": "_id",
              "code": "invalid"
            }
          ]);
        })
        .expect(422, done);
    });

    it('should response 404 cannot find the record', function (done) {
      let id = '000000000000000000000000';

      request(app)
        .delete(`/api/v1/chart-sets/${id}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Not Found');
        })
        .expect(404, done);
    });
  });
});
