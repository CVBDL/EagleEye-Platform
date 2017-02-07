'use strict';

let Exceljs = require('exceljs');
let MongoClient = require('mongodb').MongoClient
let ObjectId = require('mongodb').ObjectId;
let os = require('os');
let path = require('path');
let should = require('should');

let charts = require('../../modules/charts');
let dbClient = require('../../helpers/dbHelper');
let fixtures = require('../fixtures/charts');

const CHART_COLLECTION_NAME = "chart_collection";
const DB_CONNECTION_URI = process.env.DB_CONNECTION_URI;


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

  let chart;

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
        
        MongoClient.connect(DB_CONNECTION_URI).then(function (db) {
          let collection = db.collection(CHART_COLLECTION_NAME);

          collection.find({}).toArray().then(function (docs) {
            docs.length
              .should
              .eql(fixtures.collections.chart_collection.length + 1);

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
          .eql(fixtures.collections.chart_collection.length);

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
          .eql(fixtures.collections.chart_collection.length - 1);

        docs[0]._id
          .should
          .eql(fixtures.collections.chart_collection[1]._id);

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
          .eql(fixtures.collections.chart_collection[0]._id);

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
      let id = fixtures.collections.chart_collection[0]._id;

      charts.getOne(id)
        .then(function (docs) {
          let fixture = fixtures.collections.chart_collection[0];

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
            .eql(fixtures.collections.chart_collection.length);

          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });
  });


  describe('deleteOne', function () {

    it('should delete one chart with given id', function (done) {
      let id = fixtures.collections.chart_collection[0]._id;

      charts.deleteOne(id)
        .then(function (result) {
          result.deletedCount.should.eql(1);
          done();

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
        .catch(function (error) {
          should.fail(error);
          done();
        });
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


  describe('updateImageBrowserDownloadUrl', function () {

    it('should update image chart download URL', function (done) {
      let id = fixtures.collections.chart_collection[0]._id;

      charts.updateImageBrowserDownloadUrl(id, 'sample-image.png')
        .then(function (doc) {
          doc._id.should.eql(id);
          doc.browserDownloadUrl.image
            .should
            .eql('http://' + os.hostname() + ':3000/upload/sample-image.png');

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

      charts.updateImageBrowserDownloadUrl(nonexistentId, 'sample-image.png')
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

      charts.updateImageBrowserDownloadUrl(invalidId, 'sample-image.png')
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


  describe('updateDataTableFromXlsx', function () {

    it('should update chart data table from xlsx file', function (done) {
      let id = fixtures.collections.chart_collection[0]._id;
      let testXlsxFilePath = path.join(__dirname, '..', 'fixtures', 'datatable0.xlsx');
      let workbook = new Exceljs.Workbook();

      let datatable = {
        "cols": [{
          "label": "name(string)",
          "type": "string"
        }, {
            "label": "dept(string)",
            "type": "string"
          }, {
            "label": "lunchTime(timeofday)",
            "type": "timeofday"
          }, {
            "label": "salary(number)",
            "type": "number"
          }, {
            "label": "hireDate(date)",
            "type": "date"
          }, {
            "label": "age(number)",
            "type": "number"
          }, {
            "label": "isSenior(boolean)",
            "type": "boolean"
          }, {
            "label": "seniorityStartTime(datetime)",
            "type": "datetime"
          }],
        "rows": [{
          "c": [{
            "v": "John"
          }, {
              "v": "Eng"
            }, {
              "v": [12, 0, 0]
            }, {
              "v": 1000
            }, {
              "v": "Date(2005,2,19)"
            }, {
              "v": 35
            }, {
              "v": true
            }, {
              "v": "Date(2007,11,2,15,56,0)"
            }]
        }, {
            "c": [{
              "v": "Dave"
            }, {
                "v": "Eng"
              }, {
                "v": [13, 1, 30, 123]
              }, {
                "v": 500.5
              }, {
                "v": "Date(2006,3,19)"
              }, {
                "v": 27
              }, {
                "v": false
              }, {
                "v": "Date(2005,2,9,12,30,0,32)"
              }]
          }, {
            "c": [{
              "v": "Sally"
            }, {
                "v": "Eng"
              }, {
                "v": [9, 30, 5]
              }, {
                "v": 600
              }, {
                "v": "Date(2005,9,10)"
              }, {
                "v": 30
              }, {
                "v": false
              }, {
                "v": null
              }]
          }]
      };

      workbook.xlsx.readFile(testXlsxFilePath)
        .then(function (workbook) {
          return charts.updateDataTableFromXlsx(id, workbook);
        })
        .then(function (doc) {
          doc._id.should.eql(id);
          doc.datatable.should.eql(datatable);
          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });

    it('should determine column data type', function (done) {
      let id = fixtures.collections.chart_collection[0]._id;
      let testXlsxFilePath = path.join(__dirname, '..', 'fixtures', 'datatable1.xlsx');
      let workbook = new Exceljs.Workbook();

      let datatable = {
        "cols": [{
          "label": "name(string)",
          "type": "string"
        }, {
          "label": "salary(number)",
          "type": "number"
        }],
        "rows": [{
          "c": [{
            "v": "John"
          }, {
            "v": null
          }]
        }, {
          "c": [{
            "v": "Dave"
          }, {
            "v": null
          }]
        }, {
          "c": [{
            "v": "Sally"
          }, {
            "v": 600
          }]
        }]
      };

      workbook.xlsx.readFile(testXlsxFilePath)
        .then(function (workbook) {
          return charts.updateDataTableFromXlsx(id, workbook);
        })
        .then(function (doc) {
          doc._id.should.eql(id);
          doc.datatable.should.eql(datatable);
          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });

    it('should update chart with data table only has headers', function (done) {
      let id = fixtures.collections.chart_collection[0]._id;
      let testXlsxFilePath = path.join(__dirname, '..', 'fixtures', 'datatable3.xlsx');
      let workbook = new Exceljs.Workbook();

      let datatable = {
        "cols": [{
          "label": "name(string)",
          "type": "string"
        }, {
          "label": "salary(number)",
          "type": "number"
        }],
        "rows": []
      };

      workbook.xlsx.readFile(testXlsxFilePath)
        .then(function (workbook) {
          return charts.updateDataTableFromXlsx(id, workbook);
        })
        .then(function (doc) {
          doc._id.should.eql(id);
          doc.datatable.should.eql(datatable);
          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });

    it('should return error 404 if no record to update', function (done) {
      let nonexistentId = '000000000000000000000000';
      let testXlsxFilePath = path.join(__dirname, '..', 'fixtures', 'datatable0.xlsx');
      let workbook = new Exceljs.Workbook();

      workbook.xlsx.readFile(testXlsxFilePath)
        .then(function (workbook) {
          return charts.updateDataTableFromXlsx(nonexistentId, workbook);
        })
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
      let testXlsxFilePath = path.join(__dirname, '..', 'fixtures', 'datatable0.xlsx');
      let workbook = new Exceljs.Workbook();

      workbook.xlsx.readFile(testXlsxFilePath)
        .then(function (workbook) {
          return charts.updateDataTableFromXlsx(invalidId, workbook);
        })
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

    it('should return error 422 when passing invalid data table', function (done) {
      let id = fixtures.collections.chart_collection[0]._id;
      let testXlsxFilePath = path.join(__dirname, '..', 'fixtures', 'datatable2.xlsx');
      let workbook = new Exceljs.Workbook();

      workbook.xlsx.readFile(testXlsxFilePath)
        .then(function (workbook) {
          return charts.updateDataTableFromXlsx(id, workbook);
        })
        .should
        .rejectedWith({
          status: 422,
          errors: [{
            "resource": "chart",
            "field": "datatable",
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
