'use strict';

let fs = require('fs');
let path = require('path');
let request = require('supertest');
let should = require('should');

let app = require('../../app');
let dbClient = require('../../helpers/dbHelper');
let fixtures = require('../fixtures/charts');

let chart = {
  "chartType": "LineChart",
  "description": "This is a line chart.",
  "options": {
    "title": "Years"
  },
  "datatable": {
    "cols": [
      {
        "label": "Year",
        "type": "string"
      }
    ],
    "rows": [
      {
        "c": [
          { "v": "2016" }
        ]
      },
      {
        "c": [
          { "v": "2017" }
        ]
      }
    ]
  }
};


describe('routes: /charts', function () {

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


  /**
   * List charts.
   * <https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#list-charts>
   */
  describe('GET /api/v1/charts', function () {

    it('should fetch all charts', function (done) {
      request(app)
        .get('/api/v1/charts')
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.length
            .should
            .eql(fixtures.collections.chart_collection.length);
        })
        .expect(200, done);
    });

    it('should sort list by "createdAt" in "asc" desc by default', function (done) {
      request(app)
        .get('/api/v1/charts')
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.length
            .should
            .eql(fixtures.collections.chart_collection.length);

          let chartA = res.body[0];
          let chartB = res.body[1];
          let timestampA = new Date(chartA.createdAt).getTime();
          let timestampB = new Date(chartB.createdAt).getTime();

          timestampA.should.be.aboveOrEqual(timestampB);
        })
        .expect(200, done);
    });

    it('should sort list by "updatedAt" in "asc" order', function (done) {
      request(app)
        .get('/api/v1/charts?sort=updatedAt&order=asc')
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.length
            .should
            .eql(fixtures.collections.chart_collection.length);

          let chartA = res.body[0];
          let chartB = res.body[1];
          let timestampA = new Date(chartA.updatedAt).getTime();
          let timestampB = new Date(chartB.updatedAt).getTime();

          timestampA.should.be.belowOrEqual(timestampB);
        })
        .expect(200, done);
    });

    it('should set limit on result list', function (done) {
      request(app)
        .get('/api/v1/charts?limit=1')
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.length
            .should
            .eql(1);
        })
        .expect(200, done);
    });

    it('should set start and limit on result list', function (done) {
      request(app)
        .get('/api/v1/charts?start=2&limit=1')
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.length
            .should
            .eql(1);

          res.body[0]._id
            .should
            .eql(fixtures.collections.chart_collection[1]._id.toHexString())
        })
        .expect(200, done);
    });

    it('should set a query on result list', function (done) {
      request(app)
        .get('/api/v1/charts?q=Work')
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.length
            .should
            .eql(1);

          res.body[0]._id
            .should
            .eql(fixtures.collections.chart_collection[1]._id.toHexString())
        })
        .expect(200, done);
    });
  });


  /**
   * Create a chart.
   * <https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#create-a-chart>
   */
  describe('POST /api/v1/charts', function () {

    it('should create a normal google chart', function (done) {
      request(app)
        .post('/api/v1/charts')
        .set('Content-Type', 'application/json')
        .send(chart)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body._id.should.be.type('string');

          res.body.createdAt.should.be.type('string');
          res.body.updatedAt.should.be.type('string');
          res.body.createdAt.should.eql(res.body.updatedAt);

          res.body.chartType.should.eql(chart.chartType);
          res.body.description.should.eql(chart.description);
          res.body.datatable.should.eql(chart.datatable);
          res.body.options.should.eql(chart.options);
          
          should.equal(null, res.body.browserDownloadUrl.image);
        })
        .expect(200, done);
    });

    it('should create a custom image chart', function (done) {
      let chart = {
        "chartType": "ImageChart",
        "description": "This is an image chart."
      };

      request(app)
        .post('/api/v1/charts')
        .set('Content-Type', 'application/json')
        .send(chart)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body._id.should.be.type('string');

          res.body.createdAt.should.be.type('string');
          res.body.updatedAt.should.be.type('string');
          res.body.createdAt.should.eql(res.body.updatedAt);

          res.body.chartType.should.eql(chart.chartType);
          res.body.description.should.eql(chart.description);
          
          should.equal(null, res.body.browserDownloadUrl.image);
        })
        .expect(200, done);
    });

    it('should include blank fields as a null value', function (done) {
      let chart = {
        chartType: "BarChart"
      };

      request(app)
        .post('/api/v1/charts')
        .set('Content-Type', 'application/json')
        .send(chart)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body._id.should.be.type('string');

          res.body.createdAt.should.be.type('string');
          res.body.updatedAt.should.be.type('string');
          res.body.createdAt.should.eql(res.body.updatedAt);

          res.body.chartType.should.eql(chart.chartType);
          should.equal(null, res.body.description);
          should.equal(null, res.body.datatable);
          should.equal(null, res.body.options);
          
          should.equal(null, res.body.browserDownloadUrl.image);
        })
        .expect(200, done);
    });

    it('should response 400 if sent invalid JSON', function (done) {
      let chart = 'invalid_json';

      request(app)
        .post('/api/v1/charts')
        .set('Content-Type', 'application/json')
        .send(chart)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Problems parsing JSON');
        })
        .expect(400, done);
    });

    it('should response 422 if received unprocessable entity', function (done) {
      let chart = {};

      request(app)
        .post('/api/v1/charts')
        .set('Content-Type', 'application/json')
        .send(chart)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Validation Failed');
          res.body.errors.should.eql([
            {
              "resource": "chart",
              "field": "chartType",
              "code": "missing_field"
            }
          ]);
        })
        .expect(422, done);
    });
  });


  /**
   * Delete all charts.
   * <https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#delete-a-chart>
   */
  describe('DELETE /api/v1/charts', function () {

    it('should delete all charts', function (done) {
      request(app)
        .delete('/api/v1/charts')
        .send()
        .expect(204, done);
    });
  });

});


describe('routes: /charts/:id', function () {

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


  /**
   * Get a single chart.
   * <https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#get-a-single-chart>
   */
  describe('GET /api/v1/charts/:_id', function () {

    it('should fetch a single chart with the given id', function (done) {
      let id = fixtures.collections.chart_collection[0]._id.toHexString();

      request(app)
        .get(`/api/v1/charts/${id}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body._id.should.eql(id);
        })
        .expect(200, done);
    });

    it('should response 422 if sent invalid id', function (done) {
      let id = '0';

      request(app)
        .get(`/api/v1/charts/${id}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Validation Failed');
          res.body.errors.should.eql([
            {
              "resource": "chart",
              "field": "_id",
              "code": "invalid"
            }
          ]);
        })
        .expect(422, done);
    });

    it('should response 404 if cannot find the record', function (done) {
      let id = '000000000000000000000000';

      request(app)
        .get(`/api/v1/charts/${id}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Not Found');
        })
        .expect(404, done);
    });
  });


  /**
   * Edit a chart.
   * <https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#edit-a-chart>
   */
  describe('POST /api/v1/charts/:_id', function () {

    it('should update chart description', function (done) {
      let id = fixtures.collections.chart_collection[0]._id.toHexString();
      let chart = {
        description: 'Year 2016',
        options: {
          title: 'Population of Largest U.S. Cities in 2016',
          legend: {
            position: 'bottom'
          }
        },
        datatable: null
      };

      request(app)
        .post(`/api/v1/charts/${id}`)
        .set('Content-Type', 'application/json')
        .send(chart)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body._id.should.eql(id);
          res.body.description.should.eql(chart.description);
          res.body.options.should.eql(chart.options);
          should.equal(chart.datatable, null);

          // should leave unchanged
          res.body.chartType
            .should
            .eql(fixtures.collections.chart_collection[0].chartType);

          res.body.browserDownloadUrl
            .should
            .eql(fixtures.collections.chart_collection[0].browserDownloadUrl);

          res.body.createdAt
            .should
            .eql(fixtures.collections.chart_collection[0].createdAt);

          // should update `updatedAt` field
          // use 1 second threshold
          (Date.now() - new Date(res.body.updatedAt).getTime())
            .should
            .belowOrEqual(1000);
        })
        .expect(200, done);
    });

    it('should not update fields other than description, datatable or options',
      function (done) {

      let id = fixtures.collections.chart_collection[0]._id.toHexString();
      let chart = {
        custom: 'Some custom data'
      };

      request(app)
        .post(`/api/v1/charts/${id}`)
        .set('Content-Type', 'application/json')
        .send(chart)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body._id.should.eql(id);
          should.equal(res.body.custom, undefined);

          // should leave unchanged
          res.body.chartType
            .should
            .eql(fixtures.collections.chart_collection[0].chartType);

          res.body.browserDownloadUrl
            .should
            .eql(fixtures.collections.chart_collection[0].browserDownloadUrl);

          res.body.createdAt
            .should
            .eql(fixtures.collections.chart_collection[0].createdAt);

          // should update `updatedAt` field
          // use 1 second threshold
          (Date.now() - new Date(res.body.updatedAt).getTime())
            .should
            .belowOrEqual(1000);
        })
        .expect(200, done);
    });

    it('should response 422 if sent invalid id', function (done) {
      let invalidId = '0';
      let chart = {
        datatable: null
      };

      request(app)
        .post(`/api/v1/charts/${invalidId}`)
        .set('Content-Type', 'application/json')
        .send(chart)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Validation Failed');
          res.body.errors.should.eql([
            {
              "resource": "chart",
              "field": "_id",
              "code": "invalid"
            }
          ]);
        })
        .expect(422, done);
    });

    it('should response 404 if cannot find the record', function (done) {
      let nonexistentId = '000000000000000000000000';
      let chart = {
        datatable: null
      };

      request(app)
        .post(`/api/v1/charts/${nonexistentId}`)
        .set('Content-Type', 'application/json')
        .send(chart)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Not Found');
        })
        .expect(404, done);
    });
  });


  /**
   * Delete a chart.
   * <https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#delete-a-chart>
   */
  describe('DELETE /api/v1/charts/:_id', function () {

    it('should delete a chart by _id', function (done) {
      let id = fixtures.collections.chart_collection[0]._id.toHexString();

      request(app)
        .delete(`/api/v1/charts/${id}`)
        .send()
        .expect(204, done);
    });

    it('should response 422 if sent invalid id', function (done) {
      let invalidId = '0';

      request(app)
        .delete(`/api/v1/charts/${invalidId}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Validation Failed');
          res.body.errors.should.eql([
            {
              "resource": "chart",
              "field": "_id",
              "code": "invalid"
            }
          ]);
        })
        .expect(422, done);
    });

    it('should response 404 cannot find the record', function (done) {
      let nonexistentId = '000000000000000000000000';

      request(app)
        .delete(`/api/v1/charts/${nonexistentId}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Not Found');
        })
        .expect(404, done);
    });
  });


  /**
   * Edit chart data table.
   * <https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#edit-data-table>
   */
  describe('PUT /api/v1/charts/:id/datatable', function () {

    it('should replace chart data table', function (done) {
      let id = fixtures.collections.chart_collection[0]._id.toHexString();
      let datatable = chart.datatable;
      
      request(app)
        .put(`/api/v1/charts/${id}/datatable`)
        .set('Content-Type', 'application/json')
        .send(datatable)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body._id.should.eql(id);
          res.body.datatable.should.eql(datatable);
        })
        .expect(200, done);
    });

    it('should response 422 if sent invalid id', function (done) {
      let invalidId = '0';
      let datatable = chart.datatable;

      request(app)
        .put(`/api/v1/charts/${invalidId}/datatable`)
        .send(datatable)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Validation Failed');
          res.body.errors.should.eql([
            {
              "resource": "chart",
              "field": "_id",
              "code": "invalid"
            }
          ]);
        })
        .expect(422, done);
    });

    it('should response 404 if cannot find the record', function (done) {
      let nonexistentId = '000000000000000000000000';
      let datatable = chart.datatable;

      request(app)
        .put(`/api/v1/charts/${nonexistentId}/datatable`)
        .send(datatable)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Not Found');
        })
        .expect(404, done);
    });
  });


  /**
   * Get chart data table.
   * <https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#get-data-table>
   */
  describe('GET /api/v1/charts/:id/datatable', function () {

    it('should get chart data table in JSON format', function (done) {
      let id = fixtures.collections.chart_collection[0]._id.toHexString();

      request(app)
        .get(`/api/v1/charts/${id}/datatable?format=json`)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body
            .should
            .eql(fixtures.collections.chart_collection[0].datatable);
        })
        .expect(200, done);
    });

    it('should download chart data table to a .xlsx file', function (done) {
      let id = fixtures.collections.chart_collection[0]._id.toHexString();

      request(app)
        .get(`/api/v1/charts/${id}/datatable?format=xlsx`)
        .send()
        .expect('Content-disposition', /attachment;/)
        .expect('Content-Type',
          /^application\/vnd\.openxmlformats\-officedocument\.spreadsheetml\.sheet$/)
        .expect(200, done);
    });

    it('should response 404 if cannot process format query parameter', function (done) {
      let id = fixtures.collections.chart_collection[0]._id.toHexString();

      request(app)
        .get(`/api/v1/charts/${id}/datatable?format=unknown`)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Not Found');
        })
        .expect(404, done);
    });
  });

  /**
   * Process uploaded chart assets.
   * <https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#upload-a-chart-asset>
   */
  describe('POST /api/v1/charts/:id/assets', function () {

    it('should process uploaded .xlsx file', function (done) {
      let id = fixtures.collections.chart_collection[0]._id.toHexString();
      let filename = 'datatable0.xlsx';
      let testXlsxFilePath = path.join(__dirname, '..', 'fixtures', filename);

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

      request(app)
        .post(`/api/v1/charts/${id}/assets`)
        .attach('file', testXlsxFilePath)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body._id.should.eql(id);
          res.body.datatable.should.eql(datatable);
        })
        .expect(200, done);
    });

    it('should process uploaded .png file', function (done) {
      let id = fixtures.collections.chart_collection[0]._id.toHexString();
      let filename = 'sample.png';
      let testPNGFile = path.join(__dirname, '..', 'fixtures', filename);

      request(app)
        .post(`/api/v1/charts/${id}/assets`)
        .attach('file', testPNGFile)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body._id.should.eql(id);
          res.body.browserDownloadUrl.image.should.endWith(filename);

          // check save file on server
          let imageURL = res.body.browserDownloadUrl.image;
          let savedFilename = imageURL.substring(imageURL.lastIndexOf('/') + 1);
          let savedPath = path.join(
            __dirname, '..', '..', 'public', 'upload', savedFilename);

          // check saved uploaded file on server
          should.equal(fs.existsSync(savedPath), true);

          // delete test file
          fs.unlinkSync(savedPath);

          /** @todo */
          //should.equal(res.body.datatable, null);
        })
        .expect(200, done);
    });

    it('should process uploaded .jpg file', function (done) {
      let id = fixtures.collections.chart_collection[0]._id.toHexString();
      let filename = 'sample.jpg';
      let testPNGFile = path.join(__dirname, '..', 'fixtures', filename);

      request(app)
        .post(`/api/v1/charts/${id}/assets`)
        .attach('file', testPNGFile)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body._id.should.eql(id);
          res.body.browserDownloadUrl.image.should.endWith(filename);

          // check save file on server
          let imageURL = res.body.browserDownloadUrl.image;
          let savedFilename = imageURL.substring(imageURL.lastIndexOf('/') + 1);
          let savedPath = path.join(
            __dirname, '..', '..', 'public', 'upload', savedFilename);

          // check saved uploaded file on server
          should.equal(fs.existsSync(savedPath), true);

          // delete test file
          fs.unlinkSync(savedPath);

          /** @todo */
          //should.equal(res.body.datatable, null);
        })
        .expect(200, done);
    });

    it('should process uploaded .jpeg file', function (done) {
      let id = fixtures.collections.chart_collection[0]._id.toHexString();
      let filename = 'sample.jpeg';
      let testPNGFile = path.join(__dirname, '..', 'fixtures', filename);

      request(app)
        .post(`/api/v1/charts/${id}/assets`)
        .attach('file', testPNGFile)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body._id.should.eql(id);
          res.body.browserDownloadUrl.image.should.endWith(filename);

          // check save file on server
          let imageURL = res.body.browserDownloadUrl.image;
          let savedFilename = imageURL.substring(imageURL.lastIndexOf('/') + 1);
          let savedPath = path.join(
            __dirname, '..', '..', 'public', 'upload', savedFilename);

          // check saved uploaded file on server
          should.equal(fs.existsSync(savedPath), true);

          // delete test file
          fs.unlinkSync(savedPath);

          /** @todo */
          //should.equal(res.body.datatable, null);
        })
        .expect(200, done);
    });

    it('should ignore unexpected form fields', function (done) {
      let id = fixtures.collections.chart_collection[0]._id.toHexString();
      let filename = 'datatable0.xlsx';
      let testXlsxFilePath = path.join(__dirname, '..', 'fixtures', filename);

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

      request(app)
        .post(`/api/v1/charts/${id}/assets`)
        .field('name', 'unexpected')
        .attach('file', testXlsxFilePath)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body._id.should.eql(id);
          res.body.datatable.should.eql(datatable);
        })
        .expect(200, done);
    });

    it('should response 400 if uploaded an invalid file format', function (done) {
      let id = fixtures.collections.chart_collection[0]._id.toHexString();
      let filename = 'charts.json';
      let invalidFile = path.join(__dirname, '..', 'fixtures', filename);

      request(app)
        .post(`/api/v1/charts/${id}/assets`)
        .attach('file', invalidFile)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Problems parsing data');
        })
        .expect(400, done);
    });

    it('should response 422 if sent invalid id', function (done) {
      let invalidId = '0';
      let filename = 'datatable0.xlsx';
      let testXlsxFilePath = path.join(__dirname, '..', 'fixtures', filename);

      request(app)
        .post(`/api/v1/charts/${invalidId}/assets`)
        .attach('file', testXlsxFilePath)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Validation Failed');
          res.body.errors.should.eql([
            {
              "resource": "chart",
              "field": "_id",
              "code": "invalid"
            }
          ]);
        })
        .expect(422, done);
    });

    it('should response 404 if cannot find the record', function (done) {
      let nonexistentId = '000000000000000000000000';
      let filename = 'datatable0.xlsx';
      let testXlsxFilePath = path.join(__dirname, '..', 'fixtures', filename);

      request(app)
        .post(`/api/v1/charts/${nonexistentId}/assets`)
        .attach('file', testXlsxFilePath)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Not Found');
        })
        .expect(404, done);
    });
  });

});
