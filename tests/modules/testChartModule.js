/**
 * Created by MMo2 on 6/15/2016.
 */
'use strict';

let should = require('should'),
  DB = require('../../helpers/dbHelper'),
  fixtures = require('../fixtures/chartModule');

let chartModule = require('../../modules/chartModule');

describe('Model chart Tests', function() {
  let chart = {
    "chartType": "LineChart",
    "domainDataType": "string",
    "friendlyUrl": "c-eagleeye",
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
    DB.connect(DB.MODE_TEST, done);
  });

  beforeEach(function(done) {
    DB.drop(function(err) {
      if (err) {
        return done(err);
      }

      DB.fixtures(fixtures, done);
    });
  });

  it('all', function(done) {
    chartModule.all(function(err, docs) {
      docs.length.should.eql(2);
      done();
    });
  });

  it('clear', function(done) {
    chartModule.clearCollection(function(err, result) {
      chartModule.all(function(err, result) {
        result.length.should.eql(0);
        done();
      });
    });
  });

  it('create', function(done) {
    chartModule.create(chart, function(err, newChart) {
      chartModule.all(function(err, docs) {
        docs.length.should.eql(3);

        for (let key in fixtures.collections.chart_collection[0]) {
          docs[2][key].should.eql(chart[key]);
        }

        done();
      });
    });
  });

  it('getOne: id', function(done) {
    chartModule.create(chart, function(err, newChart) {
      let id = newChart._id;

      chartModule.getOne(id, function(err, docs) {
        docs.length.should.eql(1);

        for (let key in fixtures.collections.chart_collection[0]) {
          docs[0][key].should.eql(chart[key]);
        }

        done();
      });
    });
  });

  it('getOne: friendlyUrl', function(done) {
    chartModule.getOne(fixtures.collections.chart_collection[0].friendlyUrl, function(err, docs) {
      docs.length.should.eql(1);

      for (let key in fixtures.collections.chart_collection[0]) {
        docs[0][key].should.eql(fixtures.collections.chart_collection[0][key]);
      }

      done();
    });
  });

  it('updateOne', function(done) {
    chartModule.create(chart, function(err, newChart) {
      let id = newChart._id;

      chartModule.updateOne(id, {
        'friendlyUrl': 'c-updated-friendly-url'
      }, function(err, docs) {

        chartModule.getOne(id, function(err, docs) {
          docs.length.should.eql(1);
          docs[0].friendlyUrl.should.eql('c-updated-friendly-url');
          done();
        });
      });
    });
  });

  it('remove', function(done) {
    chartModule.all(function(err, docs) {
      chartModule.remove(docs[0]._id, function(err) {
        chartModule.all(function(err, result) {
          result.length.should.eql(1);
          result[0]._id.should.not.eql(docs[0]._id);
          done();
        });
      });
    });
  });

});
