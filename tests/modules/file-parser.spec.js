'use strict';

let Exceljs = require('exceljs');
let MongoClient = require('mongodb').MongoClient
let ObjectId = require('mongodb').ObjectId;
let fs = require('fs');
let path = require('path');
let should = require('should');

let dbClient = require('../../helpers/dbHelper');
let fileParser = require('../../modules/file-parser');
let chartsFixtures = require('../fixtures/charts');
let chartSetsFixtures = require('../fixtures/chart-sets');
let dataTableFixtures = require('../fixtures/datatable');

const CHART_COLLECTION_NAME = "chart_collection";
const CHART_SET_COLLECTION_NAME = "chart_set_collection";
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

      dbClient.fixtures(chartsFixtures, done);
    });
  });


  describe('readXLSXStream', function () {

    it('should return workbook from an xlsx file stream', function (done) {
      let filename = 'datatable0.xlsx';
      let testFilePath = path.join(__dirname, '..', 'fixtures', filename);
      let stream = fs.createReadStream(testFilePath);

      fileParser
        .readXLSXStream(stream)
        .then(function (workbook) {
          workbook.should.be.instanceof(Exceljs.Workbook);
          workbook.getWorksheet(1).actualRowCount.should.eql(4);
          done();
        })
        .catch(done);
    });
  });


  describe('readImageStream', function () {

    it('should update chart browserDownloadUrl with image', function (done) {
      let filename = 'sample.png';
      let testFilePath = path.join(__dirname, '..', 'fixtures', filename);
      let stream = fs.createReadStream(testFilePath);

      // mock multiparty behavior
      stream.filename = filename;

      fileParser
        .readImageStream(stream)
        .then(function (savedFilename) {
          savedFilename.should.be.endWith(filename);

          let savedPath = path.join(
            __dirname, '..', '..', 'public', 'upload', savedFilename);

          // check saved uploaded file on server
          should.equal(fs.existsSync(savedPath), true);

          done();
        })
        .catch(done);
    });
  });


  describe('writeXLSXStream', function () {

    //it('should write data table to xlsx file', function (done) {
    //  let filename = 'temp.xlsx';
    //  let testFilePath = path.join(__dirname, '..', 'fixtures', filename);
    //  let stream = fs.createWriteStream(testFilePath);

    //  fileParser
    //    .readImageStream(writeXLSXStream, dataTableFixtures)
    //    .then(function () {
    //      let savedPath = path.join(
    //        __dirname, '..', '..', 'public', 'upload', filename);

    //      // check saved uploaded file on server
    //      should.equal(fs.existsSync(savedPath), true);

    //      done();
    //    })
    //    .catch(done);
    //});
  });
});
