/**
 * Created by MMo2 on 6/15/2016.
 */
'use strict';

let should = require('should');

let chartSets = require('../../modules/chart-sets');
let DB = require('../../helpers/dbHelper');
let fixtures = require('../fixtures/chartSetModule');

describe('Model chart set tests', function() {
  let chartSet = {
    "title": "Chart set sample",
    "description": "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
    "friendlyUrl": "s-eagleeye-chart-set-three",
    "charts": []
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
    chartSets.all(function(err, docs) {
      docs.length.should.eql(2);
      done();
    });
  });

  it('clear', function(done) {
    chartSets.clearCollection(function(err) {
      chartSets.all(function(err, result) {
        result.length.should.eql(0);
        done();
      });
    });
  });

  it('create', function(done) {
    chartSets.create(chartSet, function(err, newChartSet) {
      chartSets.all(function(err, docs) {
        docs.length.should.eql(3);

        for (let key in fixtures.collections.chart_set_collection[0]) {
          docs[2][key].should.eql(chartSet[key]);
        }

        done();
      });
    });
  });

  it('getOne: id', function(done) {
    chartSets.create(chartSet, function(err, newChartSet) {
      let id = newChartSet._id;

      chartSets.getOne(id).then(function(doc) {
        for (let key in fixtures.collections.chart_set_collection[0]) {
          doc[key].should.eql(chartSet[key]);
        }

        done();
      })
    });
  });

  it('getOne: friendlyUrl', function(done) {
    chartSets.create(chartSet, function(err, newChartSet) {
      let id = newChartSet._id;

      chartSets.getOne(chartSet.friendlyUrl).then(function(doc) {
        for (let key in fixtures.collections.chart_set_collection[0]) {
          doc[key].should.eql(chartSet[key]);
        }

        done();
      })
    });
  });

  it('remove', function(done) {
    chartSets.all(function(err, docs) {
      chartSets.remove(docs[0]._id, function(err) {
        chartSets.all(function(err, result) {
          result.length.should.eql(1);
          result[0]._id.should.not.eql(docs[0]._id);
          done();
        });
      });
    });
  });

});
