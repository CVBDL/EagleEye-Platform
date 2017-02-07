'use strict';

let MongoClient = require('mongodb').MongoClient
let ObjectId = require('mongodb').ObjectId;
let should = require('should');

let chartSets = require('../../modules/chart-sets');
let dbClient = require('../../helpers/dbHelper');
let fixtures = require('../fixtures/chart-sets');

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

      dbClient.fixtures(fixtures, done);
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
              .eql(fixtures.collections.chart_set_collection.length + 1);
            
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
          .eql(fixtures.collections.chart_set_collection.length);

        done();
      });
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
        .eql(fixtures.collections.chart_set_collection.length - 1);

      docs[0]._id
        .should
        .eql(fixtures.collections.chart_set_collection[1]._id);

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

  //it('all', function(done) {
  //  chartSets.all(function(err, docs) {
  //    docs.length.should.eql(2);
  //    done();
  //  });
  //});

  //it('clear', function(done) {
  //  chartSets.clearCollection(function(err) {
  //    chartSets.all(function(err, result) {
  //      result.length.should.eql(0);
  //      done();
  //    });
  //  });
  //});

  //it('create', function(done) {
  //  chartSets.create(chartSet, function(err, newChartSet) {
  //    chartSets.all(function(err, docs) {
  //      docs.length.should.eql(3);

  //      for (let key in fixtures.collections.chart_set_collection[0]) {
  //        docs[2][key].should.eql(chartSet[key]);
  //      }

  //      done();
  //    });
  //  });
  //});

  //it('getOne: id', function(done) {
  //  chartSets.create(chartSet, function(err, newChartSet) {
  //    let id = newChartSet._id;

  //    chartSets.getOne(id).then(function(doc) {
  //      for (let key in fixtures.collections.chart_set_collection[0]) {
  //        doc[key].should.eql(chartSet[key]);
  //      }

  //      done();
  //    })
  //  });
  //});

  //it('remove', function(done) {
  //  chartSets.all(function(err, docs) {
  //    chartSets.remove(docs[0]._id, function(err) {
  //      chartSets.all(function(err, result) {
  //        result.length.should.eql(1);
  //        result[0]._id.should.not.eql(docs[0]._id);
  //        done();
  //      });
  //    });
  //  });
  //});

});
