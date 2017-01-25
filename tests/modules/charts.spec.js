'use strict';

let MongoClient = require('mongodb').MongoClient
let should      = require('should');

let charts   = require('../../modules/charts');
let dbClient = require('../../helpers/dbHelper');
let fixtures = require('../fixtures/chartModule');
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
    }
  });

  it('create', function (done) {
    charts.create(chart).then(function (chart) {
      MongoClient.connect(settings.DB_CONNECTION_URI).then(function (db) {
        var collection = db.collection(CHART_COLLECTION_NAME);

        collection.find({}).toArray().then(function (docs) {
          docs.length.should.eql(3);

          done();
        });
      });
    });
  });

  it('all', function(done) {
    charts.all(function(err, docs) {
      docs.length.should.eql(2);
      done();
    });
  });

  it('clear', function(done) {
    charts.clearCollection(function(err, result) {
      charts.all(function(err, result) {
        result.length.should.eql(0);
        done();
      });
    });
  });

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

  it('remove', function(done) {
    charts.all(function(err, docs) {
      charts.remove(docs[0]._id, function(err) {
        charts.all(function(err, result) {
          result.length.should.eql(1);
          result[0]._id.should.not.eql(docs[0]._id);
          done();
        });
      });
    });
  });

});
