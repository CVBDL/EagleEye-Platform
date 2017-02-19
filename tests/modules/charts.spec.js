'use strict';

let MongoClient = require('mongodb').MongoClient
let ObjectId = require('mongodb').ObjectId;
let should = require('should');

let dbClient = require('../../helpers/dbHelper');
let charts = require('../../modules/charts');
let chartsFixtures = require('../fixtures/charts');
let chartSetsFixtures = require('../fixtures/chart-sets');

const CHART_COLLECTION = dbClient.COLLECTION.CHART;
const CHART_SET_COLLECTION = dbClient.COLLECTION.CHART_SET;

const DB_CONNECTION_URI = process.env.DB_CONNECTION_URI;


describe('modules: charts', function () {

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

    it('should be able to create a chart', function (done) {
      let chart = {
        "chartType": "BarChart",
        "description": "This is a bar chart.",
        "options": {
          "title": "Population"
        },
        "datatable": {
          "cols": [
            { "label": "City", "type": "string" },
            { "label": "2010 Population", "type": "number" },
            { "label": "2000 Population", "type": "number" }
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
            }
          ]
        }
      }

      charts.create(chart)
        .then(function (createdChart) {
          createdChart.createdAt.should.be.type('string');
          createdChart.updatedAt.should.be.type('string');
          createdChart.createdAt.should.eql(createdChart.updatedAt);

          createdChart.chartType.should.eql(chart.chartType);
          createdChart.description.should.eql(chart.description);
          createdChart.options.should.eql(chart.options);
          createdChart.datatable.should.eql(chart.datatable);
        
          return MongoClient.connect(DB_CONNECTION_URI)
            .then(function (db) {
              let collection = db.collection(CHART_COLLECTION);

              return collection
                .find({})
                .toArray()
                .then(function (docs) {
                  db.close(true);

                  try {
                    docs.length
                      .should
                      .eql(chartsFixtures.collections.chart.length + 1);

                    let found = false;

                    docs.forEach(function (chart) {
                      if (ObjectId(chart._id).toHexString() ===
                        ObjectId(createdChart._id).toHexString()) {

                        found = true;
                      }
                    });

                    should.equal(found, true);

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

    it('should return error if sent wrong chart type', function (done) {
      let chart = {
        chartType: 'unknown'
      };
      
      charts.create(chart)
        .should
        .rejectedWith({
          status: 422,
          errors: [{
            "resource": "chart",
            "field": "chartType",
            "code": "missing_field"
          }]
        })
        .then(function () {
          done();
        })
        .catch(done);
    });

    it('should contain all chart fields', function (done) {
      let chart = {
        chartType: 'LineChart'
      };

      charts.create(chart)
        .then(function (newChart) {
          should(newChart._id).not.be.undefined();
          should(newChart.chartType).equal('LineChart');
          should(newChart.description).be.null();
          should(newChart.datatable).be.null();
          should(newChart.options).be.null();
          should(newChart.browserDownloadUrl.image).be.null();
          should(newChart.createdAt).not.be.undefined();
          should(newChart.updatedAt).not.be.undefined();
          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });

    it('image chart has different fields values', function (done) {
      let chart = {
        chartType: 'ImageChart'
      };

      charts.create(chart)
        .then(function (newChart) {
          should(newChart._id).not.be.undefined();
          should(newChart.chartType).equal('ImageChart');
          should(newChart.description).be.null();
          should(newChart.datatable).be.null();
          should(newChart.options).be.null();
          should(newChart.browserDownloadUrl.image).be.null();
          should(newChart.createdAt).not.be.undefined();
          should(newChart.updatedAt).not.be.undefined();
          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });
  });


  describe('all', function () {

    it('should list all charts', function (done) {
      charts.all().then(function (docs) {
        docs.length
          .should
          .eql(chartsFixtures.collections.chart.length);

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

      }, function () {
        should.fail(null, null, 'Promise should be resolved.');
      })
      .catch(done);
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

      }, function () {
        should.fail(null, null, 'Promise should be resolved.');
      })
      .catch(done);
    });

    it('should apply limit option on result set', function (done) {
      charts.all({
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
      charts.all({
        skip: 1

      }).then(function (docs) {
        docs.length
          .should
          .eql(chartsFixtures.collections.chart.length - 1);

        docs[0]._id
          .should
          .eql(chartsFixtures.collections.chart[1]._id);

        done();

      }, function () {
        should.fail(null, null, 'Promise should be resolved.');
      })
      .catch(done);
    });

    it('should apply q query parameter on options.title field', function (done) {
      charts.all({
        query: 'Population'

      }).then(function (docs) {
        docs.length.should.eql(1);
        docs[0]._id
          .should
          .eql(chartsFixtures.collections.chart[0]._id);

        done();

      }, function () {
        should.fail(null, null, 'Promise should be resolved.');
      })
      .catch(done);
    });

    it('should apply q query parameter on description field', function (done) {
      charts.all({
        query: 'chart'

      }).then(function (docs) {
        docs.length.should.eql(3);
        done();

      }, function () {
        should.fail(null, null, 'Promise should be resolved.');
      })
      .catch(done);
    });

    it('should not query on stop words', function (done) {
      charts.all({
        query: 'is'

      }).then(function (docs) {
        docs.length.should.eql(0);
        done();

      }, function () {
        should.fail(null, null, 'Promise should be resolved.');
      })
      .catch(done);
    });
  });


  describe('getOne', function () {

    it('should select one chart by _id', function (done) {
      let id = chartsFixtures.collections.chart[0]._id;

      charts.getOne(id)
        .then(function (docs) {
          let fixture = chartsFixtures.collections.chart[0];

          docs.length.should.eql(1);

          docs[0]._id
            .should
            .eql(fixture._id);
          docs[0].chartType
            .should
            .eql(fixture.chartType);
          docs[0].description
            .should
            .eql(fixture.description);

          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });

    it('should return error 404 if cannot find the record', function (done) {
      let id = '000000000000000000000000';

      charts.getOne(id)
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

      charts.getOne(id)
        .then(function (docs) {
          should.fail(null, null, 'Promise should be resolved.');

        }, function (error) {
          error.should.eql({
            status: 422,
            errors: [{
              "resource": "chart",
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

    it('should delete all charts', function (done) {
      charts.deleteAll()
        .then(function (result) {
          result.deletedCount
            .should
            .eql(chartsFixtures.collections.chart.length);

          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });
  });


  describe('deleteOne', function () {
    
    it('should delete one chart with given id', function (done) {
      let id = chartsFixtures.collections.chart[0]._id;

      charts.deleteOne(id)
        .then(function (result) {
          result.deletedCount.should.eql(1);

          // delete it in chart sets
          return MongoClient.connect(DB_CONNECTION_URI)
            .then(function (db) {
              let collection = db.collection(CHART_SET_COLLECTION);

              return collection
                .find({
                  "charts": id
                })
                .toArray()
                .then(function (docs) {
                  db.close(true);

                  try {
                    docs.length.should.eql(0);
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

    it('should return error 404 if no record to delete', function (done) {
      let nonexistentId = '000000000000000000000000';

      charts.deleteOne(nonexistentId)
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

    it('should update an existing chart', function (done) {
      let id = chartsFixtures.collections.chart[0]._id;
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
        })
        .then(function () {
          done();
        })
        .catch(done);
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
        })
        .then(function () {
          done();
        })
        .catch(done);
    });
  });
  
});
