'use strict';

let MongoClient = require('mongodb').MongoClient
let ObjectId = require('mongodb').ObjectId;
let should = require('should');

let charts = require('../../modules/charts');
let dbClient = require('../../helpers/dbHelper');
let fixtures = require('../fixtures/charts');
let settings = require('../unit.settings');

const CHART_COLLECTION_NAME = "chart_collection";

let chart;

describe('modules: charts', function () {

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
  
  beforeEach(function() {
    chart = {
      "chartType": "BarChart",
      "description": "This is a bar chart.",
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
    }
  });


  describe('create', function () {

    it('should be able to create a chart', function (done) {
      charts.create(chart).then(function (newChart) {

        newChart.createdAt.should.be.type('string');
        newChart.updatedAt.should.be.type('string');
        newChart.createdAt.should.eql(newChart.updatedAt);

        newChart.chartType.should.eql(chart.chartType);
        newChart.description.should.eql(chart.description);
        newChart.options.should.eql(chart.options);
        newChart.datatable.should.eql(chart.datatable);
        
        MongoClient.connect(settings.DB_CONNECTION_URI).then(function (db) {
          let collection = db.collection(CHART_COLLECTION_NAME);

          collection.find({}).toArray().then(function (docs) {
            docs.length.should.eql(3);

            let found = false;
            
            docs.forEach(function (chart) {
              if (ObjectId(chart._id).toHexString() ===
                  ObjectId(newChart._id).toHexString()) {

                found = true;
              }
            });
            
            should.equal(found, true);
            
            db.close(true, done);
          });
        });
      });
    });

    it('should return error if sent wrong chart type', function (done) {
      let chart = {
        chartType: 'unknown'
      };
      
      charts.create(chart).should.be.rejectedWith({
        status: 422,
        errors: [{
          "resource": "chart",
          "field": "chartType",
          "code": "missing_field"
        }]
      });

      done();
    });

    it('should contain all chart fields', function (done) {
      let chart = {
        chartType: 'LineChart'
      };

      charts.create(chart).then(function (newChart) {
        should(newChart._id).not.be.undefined();
        should(newChart.chartType).equal('LineChart');
        should(newChart.description).be.null();
        should(newChart.datatable).be.null();
        should(newChart.options).be.null();
        should(newChart.browserDownloadUrl.excel).be.endWith(newChart._id);
        should(newChart.browserDownloadUrl.image).be.null();
        should(newChart.createdAt).not.be.undefined();
        should(newChart.updatedAt).not.be.undefined();
        done();

      }, function () {
        should.fail();
        done();
      });
    });

    it('image chart has different fields values', function (done) {
      let chart = {
        chartType: 'ImageChart'
      };

      charts.create(chart).then(function (newChart) {
        should(newChart._id).not.be.undefined();
        should(newChart.chartType).equal('ImageChart');
        should(newChart.description).be.null();
        should(newChart.datatable).be.null();
        should(newChart.options).be.null();
        should(newChart.browserDownloadUrl.image).be.null();
        should(newChart.browserDownloadUrl.image).be.null();
        should(newChart.createdAt).not.be.undefined();
        should(newChart.updatedAt).not.be.undefined();
        done();

      }, function () {
        should.fail();
        done();
      });
    });
  });


  describe('all', function () {

    it('should list all charts', function (done) {
      charts.all().then(function (docs) {
        docs.length.should.eql(2);
        done();
      });
    });

    it('should sort on "createdAt" field in "asc" order', function (done) {
      charts.all({
        sort: [
          ['createdAt', 'asc']
        ]

      }).then(function (docs) {
        let chartA = docs[0];
        let chartB = docs[1];
        let timestampA = new Date(chartA.createdAt).getTime();
        let timestampB = new Date(chartB.createdAt).getTime();

        timestampA.should.be.belowOrEqual(timestampB);

        done();

      }, function (error) {
        should.fail(error);
        done();
      });
    });

    it('should sort on "updatedAt" field in "desc" order', function (done) {
      charts.all({
        sort: [
          ['updatedAt', 'desc']
        ]

      }).then(function (docs) {
        let chartA = docs[0];
        let chartB = docs[1];
        let timestampA = new Date(chartA.updatedAt).getTime();
        let timestampB = new Date(chartB.updatedAt).getTime();

        timestampA.should.be.aboveOrEqual(timestampB);

        done();

      }, function (error) {
        should.fail(error);
        done();
      });
    });

    it('should apply limit option on result set', function (done) {
      charts.all({
        limit: 1

      }).then(function (docs) {
        docs.length.should.eql(1);

        done();

      }, function (error) {
        should.fail(error);
        done();
      });
    });

    it('should apply skip option on result set', function (done) {
      charts.all({
        skip: 1

      }).then(function (docs) {
        docs.length.should.eql(1);
        docs[0]._id
          .should
          .eql(fixtures.collections.chart_collection[1]._id);

        done();

      }, function (error) {
        should.fail(error);
        done();
      });
    });

    it('should apply q query parameter', function (done) {
      charts.all({
        query: 'Population'

      }).then(function (docs) {
        docs.length.should.eql(1);
        docs[0]._id
          .should
          .eql(fixtures.collections.chart_collection[0]._id);

        done();

      }, function (error) {
        should.fail(error);
        done();
      });
    });
  });


  describe('getOne', function () {

    it('should select one chart by _id', function (done) {
      charts.getOne(fixtures.collections.chart_collection[0]._id)
        .then(function (docs) {
          docs.length.should.eql(1);
          docs[0]._id
            .should
            .eql(fixtures.collections.chart_collection[0]._id);
          docs[0].chartType
            .should
            .eql(fixtures.collections.chart_collection[0].chartType);
          docs[0].description
            .should
            .eql(fixtures.collections.chart_collection[0].description);

          done();
        });
    });

    it('should return empty list if cannot find a record', function (done) {
      let nonexistentId = '000000000000000000000000';

      charts.getOne(nonexistentId)
        .then(function (docs) {
          docs.length.should.eql(0);
          done();
        });
    });

    it('should return error 422 when passing invalid id', function (done) {
      let invalidId = '0';

      charts.getOne(invalidId)
        .then(function (docs) {
          should.fail();
          done();
        })
        .catch(function (error) {
          error.should.eql({
            status: 422,
            errors: [{
              "resource": "chart",
              "field": "_id",
              "code": "invalid"
            }]
          });

          done();
        });
    });
  });


  describe('deleteAll', function () {

    it('should delete all charts', function (done) {
      charts.deleteAll()
        .then(function (result) {
          result.deletedCount.should.eql(2);
          done();
        })
        .catch(function () {
          should.fail();
          done();
        });
    });
  });


  describe('deleteOne', function () {

    it('should delete one chart according to id', function (done) {
      let id = fixtures.collections.chart_collection[0]._id;

      charts.deleteOne(id)
        .then(function (result) {
          result.deletedCount.should.eql(1);
          done();
        })
        .catch(function () {
          should.fail();
          done();
        });
    });

    it('should return error 404 if no record to delete', function (done) {
      let nonexistentId = '000000000000000000000000';

      charts.deleteOne(nonexistentId)
        .should
        .rejectedWith({
          status: 404
        });

      done();
    });
  });


  describe('updateOne', function () {

    it('should update an existing chart', function (done) {
      let id = fixtures.collections.chart_collection[0]._id;
      let data = {
        description: 'An updated description.',
        datatable: null,
        options: null
      };

      charts.updateOne(id, data)
        .then(function (doc) {
          doc._id.should.eql(id);
          should.equal(doc.description, data.description);
          should.equal(doc.datatable, data.datatable);
          should.equal(doc.options, data.options);
          new Date(doc.updatedAt).getTime()
            .should
            .be
            .aboveOrEqual(Date.now() - 1000);

          done();
        })
        .catch(function () {
          should.fail();
        });
    });

    it('should return error 404 if no record to update', function (done) {
      let nonexistentId = '000000000000000000000000';
      let data = {
        description: 'An updated description.',
        datatable: null,
        options: null
      };

      charts.updateOne(nonexistentId, data)
        .should
        .rejectedWith({
          status: 404
        });

      done();
    });

    it('should return error 422 when passing invalid id', function (done) {
      let invalidId = '0';
      let data = {
        description: 'An updated description.',
        datatable: null,
        options: null
      };

      charts.updateOne(invalidId, data)
        .should
        .rejectedWith({
          status: 422,
          errors: [{
            "resource": "chart",
            "field": "_id",
            "code": "invalid"
          }]
        });

      done();
    });
  });
});
