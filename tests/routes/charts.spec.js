'use strict';

let request    = require('supertest');
let should     = require('should');
let express    = require('express');
let bodyParser = require('body-parser');

let chartsRoute = require('../../routes/charts');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/api/v1', chartsRoute);

let chart = {
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
};

// Doc:
// https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#create-a-chart
describe('POST /api/v1/charts', function () {

  it('should create a chart', function (done) {
    request(app)
      .post('/api/v1/charts')
      .set('Content-Type', 'application/json')
      .send(chart)
      .expect('Content-Type', /json/)
      .expect(function (res) {
        res.body._id.should.be.type('string');
        res.body.createdAt.should.be.type('string');
        res.body.updatedAt.should.be.type('string');
        res.body.description.should.eql(chart.description);
        res.body.chartType.should.eql(chart.chartType);
        res.body.datatable.should.eql(chart.datatable);
        //res.body.options.should.eql(chart.options);
        res.body.browserDownloadUrl.excel.should.endWith(res.body._id);
        should.equal(null, res.body.browserDownloadUrl.image);
      })
      .expect(200, done);
  });
});