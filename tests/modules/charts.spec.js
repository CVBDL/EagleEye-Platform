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
              if (ObjectId(chart._id).toHexString() === ObjectId(newChart._id).toHexString()) {
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
        ObjectId(docs[0]._id).toHexString().should.eql(fixtures.collections.chart_collection[1]._id);

        done();

      }, function (error) {
        should.fail(error);
        done();
      });
    });
  });


  //it('clear', function(done) {
  //  charts.clearCollection(function(err, result) {
  //    charts.all(function(err, result) {
  //      result.length.should.eql(0);
  //      done();
  //    });
  //  });
  //});

  //it('getOne: id', function(done) {
  //  charts.create(chart, function(err, newChart) {
  //    let id = newChart._id;

  //    charts.getOne(id, function(err, docs) {
  //      docs.length.should.eql(1);

  //      for (let key in fixtures.collections.chart_collection[0]) {
  //        docs[0][key].should.eql(chart[key]);
  //      }

  //      done();
  //    });
  //  });
  //});

  //it('updateOne', function(done) {
  //  charts.create(chart, function(err, newChart) {
  //    let id = newChart._id;

  //    charts.updateOne(id, {
  //      'test_key': 'test_value'
  //    }, function(err, docs) {

  //      charts.getOne(id, function(err, docs) {
  //        docs.length.should.eql(1);
  //        docs[0].test_key.should.eql('test_value');
  //        done();
  //      });
  //    });
  //  });
  //});

  //it('remove', function(done) {
  //  charts.all(function(err, docs) {
  //    charts.remove(docs[0]._id, function(err) {
  //      charts.all(function(err, result) {
  //        result.length.should.eql(1);
  //        result[0]._id.should.not.eql(docs[0]._id);
  //        done();
  //      });
  //    });
  //  });
  //});

});
