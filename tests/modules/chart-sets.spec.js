'use strict';

let MongoClient = require('mongodb').MongoClient
let ObjectId = require('mongodb').ObjectId;
let should = require('should');

let dbClient = require('../../helpers/db');
let chartSets = require('../../modules/chart-sets');
let chartsFixtures = require('../fixtures/charts');
let chartSetsFixtures = require('../fixtures/chart-sets');

const CHART_SET_COLLECTION = dbClient.COLLECTION.CHART_SET;
const DB_CONNECTION_URI = process.env.DB_CONNECTION_URI;


describe('modules: chart-sets', function() {

  before(function () {
    return dbClient.connect();
  });

  beforeEach(function () {
    return dbClient.drop()
      .then(function () {
        return dbClient.fixtures(chartsFixtures);
      })
      .then(function () {
        return dbClient.fixtures(chartSetsFixtures);
      });
  });


  describe('create', function () {

    it('should be able to create a chart set', function (done) {
      let chartSet = {
        "title": "Chart set sample",
        "description": "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
        "charts": ["588edf0a60514b38109e7f41", "588edf0a60514b38109e7f43"]
      };

      chartSets.create(chartSet).then(function (newChartSet) {

        newChartSet.createdAt.should.be.type('string');
        newChartSet.updatedAt.should.be.type('string');
        newChartSet.createdAt.should.eql(newChartSet.updatedAt);

        newChartSet.title.should.eql(chartSet.title);
        newChartSet.description.should.eql(chartSet.description);
        newChartSet.charts.should.eql(chartSet.charts);

        MongoClient.connect(DB_CONNECTION_URI).then(function (db) {
          let collection = db.collection(CHART_SET_COLLECTION);

          collection.find({}).toArray().then(function (docs) {
            docs.length
              .should
              .eql(chartSetsFixtures.collections.chart_set.length + 1);
            
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
      chartSets.list().then(function (docs) {
        docs.length
          .should
          .eql(chartSetsFixtures.collections.chart_set.length);

        done();
      });
    });
    
    it('should sort on "createdAt" field in "asc" order', function (done) {
      chartSets.list({
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
      chartSets.list({
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
      chartSets.list({
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
      chartSets.list({
        skip: 1

      }).then(function (docs) {
        docs.length
          .should
          .eql(chartSetsFixtures.collections.chart_set.length - 1);

        docs[0]._id
          .should
          .eql(chartSetsFixtures.collections.chart_set[1]._id);

        done();

      }, function () {
        should.fail(null, null, 'Promise should be resolved.');
      })
        .catch(done);
    });

    it('should apply q query parameter on title field', function (done) {
      chartSets
        .list({
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
        .list({
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
        .list({
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
      let id = chartSetsFixtures.collections.chart_set[0]._id;

      chartSets.get(id)
        .then(function (doc) {
          let fixture = chartSetsFixtures.collections.chart_set[0];

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
      let id = chartSetsFixtures.collections.chart_set[0]._id;

      chartSets.get(id)
        .then(function (doc) {
          let fixture = chartSetsFixtures.collections.chart_set[0];

          doc.charts[0]
            .should
            .eql(chartsFixtures.collections.chart[0])

          doc.charts[1]
            .should
            .eql(chartsFixtures.collections.chart[2])

          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });

    it('should return error 404 if cannot find the chart set', function (done) {
      let id = '000000000000000000000000';

      chartSets.get(id)
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

      chartSets.get(id)
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
            .eql(chartSetsFixtures.collections.chart_set.length);

          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });
  });


  describe('deleteOne', function () {

    it('should delete one chart set with given id', function (done) {
      let id = chartSetsFixtures.collections.chart_set[0]._id;

      chartSets.delete(id)
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

      chartSets.delete(id)
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


  describe('updateOne', function () {

    it('should update an existing chart set', function (done) {
      let id = chartSetsFixtures.collections.chart_set[0]._id;
      let data = {
        description: 'An updated description.',
        title: 'Title',
        charts: []
      };

      chartSets.update(id, data)
        .then(function (doc) {
          doc._id.should.eql(id);
          should.equal(doc.title, data.title);
          should.equal(doc.description, data.description);
          doc.charts.should.eql(data.charts);

          // should update `updatedAt` field
          // use 1 second threshold
          (Date.now() - new Date(doc.updatedAt).getTime())
            .should
            .belowOrEqual(1000);

          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });

    it('should return error 404 if no record to update', function (done) {
      let id = '000000000000000000000000';
      let data = {
        description: 'An updated description.',
        title: 'Title',
        charts: []
      };

      chartSets.update(id, data)
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
      let data = {
        description: 'An updated description.',
        title: 'Title',
        charts: []
      };

      chartSets.update(id, data)
        .should
        .rejectedWith({
          status: 422,
          errors: [{
            "resource": "chart-sets",
            "field": "_id",
            "code": "invalid"
          }]
        })
        .then(function () {
          done();
        })
        .catch(done);
    });
  });


  describe('deleteChartInChartSets', function () {

    it('should delete the chart id from all chart sets', function (done) {
      let id = chartsFixtures.collections.chart[2]._id.toHexString();

      chartSets.deleteChartInChartSets(id)
        .then(function (result) {
          result.matchedCount.should.eql(2);
          result.modifiedCount.should.eql(2);
          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });

    it('should update "updatedAt" field of chart set if got modified', function (done) {
      let id = chartsFixtures.collections.chart[2]._id.toHexString();

      chartSets.deleteChartInChartSets(id)
        .then(function (result) {

          return MongoClient.connect(DB_CONNECTION_URI)
            .then(function (db) {
              let collection = db.collection(CHART_SET_COLLECTION);

              return collection
                .find({})
                .toArray()
                .then(function (docs) {
                  db.close(true);

                  try {
                    docs.forEach(function (doc) {
                      // should update `updatedAt` field
                      // use 1 second threshold
                      (Date.now() - new Date(doc.updatedAt).getTime())
                        .should
                        .belowOrEqual(1000);
                    });
                    done();

                  } catch (err) {
                    done(err);
                  }
                });
            });

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });
    
    it('should return error 422 when passing invalid id', function (done) {
      let id = '0';

      chartSets.deleteChartInChartSets(id)
        .should
        .rejectedWith({
          status: 422,
          errors: [{
            "resource": "charts",
            "field": "_id",
            "code": "invalid"
          }]
        })
        .then(function () {
          done();
        })
        .catch(done);
    });
  });
});
