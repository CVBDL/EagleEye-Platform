'use strict';

let MongoClient = require('mongodb').MongoClient
let should      = require('should');

let charts   = require('../../modules/charts');
let dbClient = require('../../helpers/dbHelper');
let fixtures = require('../fixtures/chartModule');

describe('modules: charts', function () {

  let chart = {
    "chartType": "LineChart",
    "description": "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
    "options": {
      "title": "Fruits Overview",
      "hAxis": {
        "title": "Category"
      },
      "vAxis": {
        "title": "Inventory"
      }
    },
    "datatable": {
      "cols": [
        { "type": "string", "label": "Category" },
        { "type": "number", "label": "Apple" },
        { "type": "number", "label": "Orange" }
      ],
      "rows": [
        { "c": [{ "v": "Apple" }, { "v": 5 }, { "v": 9 }] },
        { "c": [{ "v": "Orange" }, { "v": 7 }, { "v": 3 }] }
      ]
    }
  };

  before(function(done) {
    dbClient.connect(dbClient.MODE_TEST, done);
  });

  beforeEach(function(done) {
    dbClient.drop(function(err) {
      if (err) {
        return done(err);
      }

      dbClient.fixtures(fixtures, done);
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

  it('create', function(done) {
    charts.create(chart, function(err, newChart) {
      charts.all(function(err, docs) {
        docs.length.should.eql(3);

        for (let key in fixtures.collections.chart_collection[0]) {
          docs[2][key].should.eql(chart[key]);
        }

        done();
      });
    });
  });

  it('getOne: id', function(done) {
    charts.create(chart, function(err, newChart) {
      let id = newChart._id;

      charts.getOne(id, function(err, docs) {
        docs.length.should.eql(1);

        for (let key in fixtures.collections.chart_collection[0]) {
          docs[0][key].should.eql(chart[key]);
        }

        done();
      });
    });
  });

  it('updateOne', function(done) {
    charts.create(chart, function(err, newChart) {
      let id = newChart._id;

      charts.updateOne(id, {
        'test_key': 'test_value'
      }, function(err, docs) {

        charts.getOne(id, function(err, docs) {
          docs.length.should.eql(1);
          docs[0].test_key.should.eql('test_value');
          done();
        });
      });
    });
  });

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
