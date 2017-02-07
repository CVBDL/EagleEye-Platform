'use strict';

let MongoClient = require('mongodb').MongoClient
let ObjectId = require('mongodb').ObjectId;
let should = require('should');

let chartSets = require('../../modules/chart-sets');
let dbClient = require('../../helpers/dbHelper');
let chartSetsFixtures = require('../fixtures/chart-sets');
let chartsFixtures = require('../fixtures/charts');

const DB_CONNECTION_URI = process.env.DB_CONNECTION_URI;
const CHART_SET_COLLECTION_NAME = "chart_set_collection";


describe('modules: chart-sets', function() {

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

  let chartSet;

  beforeEach(function () {
    chartSet = {
      "title": "Chart set sample",
      "description": "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
      "charts": ["588edf0a60514b38109e7f41", "588edf0a60514b38109e7f43"]
    };
  });


  describe('create', function () {

    it('should be able to create a chart set', function (done) {
      chartSets.create(chartSet).then(function (newChartSet) {

        newChartSet.createdAt.should.be.type('string');
        newChartSet.updatedAt.should.be.type('string');
        newChartSet.createdAt.should.eql(newChartSet.updatedAt);

        newChartSet.title.should.eql(chartSet.title);
        newChartSet.description.should.eql(chartSet.description);
        newChartSet.charts.should.eql(chartSet.charts);

        MongoClient.connect(DB_CONNECTION_URI).then(function (db) {
          let collection = db.collection(CHART_SET_COLLECTION_NAME);

          collection.find({}).toArray().then(function (docs) {
            docs.length
              .should
              .eql(chartSetsFixtures.collections.chart_set_collection.length + 1);
            
            let found = false;
            
            docs.forEach(function (chartSet) {
              if (ObjectId(chartSet._id).toHexString() ===
                ObjectId(newChartSet._id).toHexString()) {

                found = true;
              }
            });

            should.equal(found, true);

            db.close(true, done);
          });
        });
      });
    });
    
    it('should contain all chart set fields', function (done) {
      let emptyChartSet = {
        charts: []
      };

      chartSets.create(emptyChartSet).then(function (newChartSet) {
        should(newChartSet._id).not.be.undefined();
        should(newChartSet.title).be.null();
        should(newChartSet.description).be.null();
        should(newChartSet.createdAt).not.be.undefined();
        should(newChartSet.updatedAt).not.be.undefined();
        newChartSet.charts.should.eql([]);
        done();

      }, function (error) {
        should.fail(error);
        done();
      });
    });

    it('should return error 422 when passing invalid charts', function (done) {
      let chartSet = {
        charts: ['0']
      };

      chartSets.create(chartSet)
        .should
        .rejectedWith({
          status: 422,
          errors: [{
            "resource": "chart-sets",
            "field": "charts",
            "code": "invalid"
          }]
        })

      done();
    });
  });


  describe('all', function () {

    it('should list all chart sets', function (done) {
      chartSets.all().then(function (docs) {
        docs.length
          .should
          .eql(chartSetsFixtures.collections.chart_set_collection.length);

        done();
      });
    });
    
    it('should sort on "createdAt" field in "asc" order', function (done) {
      chartSets.all({
        sort: [
          ['createdAt', 'asc']
        ]

      }).then(function (docs) {
        let chartSetA = docs[0];
        let chartSetB = docs[1];
        let timestampA = new Date(chartSetA.createdAt).getTime();
        let timestampB = new Date(chartSetB.createdAt).getTime();

        timestampA.should.be.belowOrEqual(timestampB);

        done();

      }, function () {
        should.fail(null, null, 'Promise should be resolved.');
      })
        .catch(done);
    });

    it('should sort on "updatedAt" field in "desc" order', function (done) {
      chartSets.all({
        sort: [
          ['updatedAt', 'desc']
        ]

      }).then(function (docs) {
        let chartSetA = docs[0];
        let chartSetB = docs[1];
        let timestampA = new Date(chartSetA.updatedAt).getTime();
        let timestampB = new Date(chartSetB.updatedAt).getTime();

        timestampA.should.be.aboveOrEqual(timestampB);

        done();

      }, function () {
        should.fail(null, null, 'Promise should be resolved.');
      })
        .catch(done);
    });

    it('should apply limit option on result set', function (done) {
      chartSets.all({
        limit: 1

      }).then(function (docs) {
        docs.length.should.eql(1);
        done();

      }, function () {
        should.fail(null, null, 'Promise should be resolved.');
      })
        .catch(done);
    });

    it('should apply skip option on result set', function (done) {
      chartSets.all({
        skip: 1

      }).then(function (docs) {
        docs.length
          .should
          .eql(chartSetsFixtures.collections.chart_set_collection.length - 1);

        docs[0]._id
          .should
          .eql(chartSetsFixtures.collections.chart_set_collection[1]._id);

        done();

      }, function () {
        should.fail(null, null, 'Promise should be resolved.');
      })
        .catch(done);
    });

    it('should apply q query parameter on title field', function (done) {
      chartSets
        .all({
          query: 'CCC'
        })
        .then(function (docs) {
          docs.length.should.eql(2);
          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });

    it('should apply q query parameter on description field', function (done) {
      chartSets
        .all({
          query: 'JJJ'
        })
        .then(function (docs) {
          docs.length.should.eql(2);
          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });

    // Ref: <https://docs.mongodb.com/manual/tutorial/specify-language-for-text-index/>
    it('should not query on stop words', function (done) {
      chartSets
        .all({
          query: 'J'
        })
        .then(function (docs) {
          docs.length.should.eql(0);
          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });

  });
  

  describe('getOne', function () {

    it('should select one chart set by _id', function (done) {
      let id = chartSetsFixtures.collections.chart_set_collection[0]._id;

      chartSets.getOne(id)
        .then(function (doc) {
          let fixture = chartSetsFixtures.collections.chart_set_collection[0];

          doc._id
            .should
            .eql(fixture._id);
          doc.title
            .should
            .eql(fixture.title);
          doc.description
            .should
            .eql(fixture.description);

          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });

    it('should contain chart details in "charts" field', function (done) {
      let id = chartSetsFixtures.collections.chart_set_collection[0]._id;

      chartSets.getOne(id)
        .then(function (doc) {
          let fixture = chartSetsFixtures.collections.chart_set_collection[0];

          doc.charts[0]
            .should
            .eql(chartsFixtures.collections.chart_collection[0])

          doc.charts[1]
            .should
            .eql(chartsFixtures.collections.chart_collection[2])

          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });

    it('should return error 404 if cannot find the chart set', function (done) {
      let id = '000000000000000000000000';

      chartSets.getOne(id)
        .should
        .rejectedWith({
          status: 404
        })
        .then(function () {
          done();
        })
        .catch(done);
    });

    it('should return error 422 when passing invalid id', function (done) {
      let id = '0';

      chartSets.getOne(id)
        .then(function (docs) {
          should.fail(null, null, 'Promise should be resolved.');

        }, function (error) {
          error.should.eql({
            status: 422,
            errors: [{
              "resource": "chart-sets",
              "field": "_id",
              "code": "invalid"
            }]
          });

          done();
        })
        .catch(done);
    });





  });


  describe('deleteAll', function () {

    it('should delete all chart sets', function (done) {
      chartSets.deleteAll()
        .then(function (result) {
          result.deletedCount
            .should
            .eql(chartSetsFixtures.collections.chart_set_collection.length);

          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });
  });


  describe('deleteOne', function () {

    it('should delete one chart set with given id', function (done) {
      let id = chartSetsFixtures.collections.chart_set_collection[0]._id;

      chartSets.deleteOne(id)
        .then(function (result) {
          result.deletedCount.should.eql(1);
          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });

    it('should return error 404 if no record to delete', function (done) {
      let id = '000000000000000000000000';

      chartSets.deleteOne(id)
        .should
        .rejectedWith({
          status: 404
        })
        .then(function () {
          done();
        })
        .catch(done);
    });
  });
});
