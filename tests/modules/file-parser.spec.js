'use strict';

let Exceljs = require('exceljs');
let fs = require('fs');
let path = require('path');
let should = require('should');

let fileParser = require('../../modules/file-parser');
let dataTableFixtures = require('../fixtures/datatable');


describe('modules: file-parser', function () {


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

    it('should update chart imageUrl with image', function (done) {
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

          // delete test file
          fs.unlink(savedPath, done);
        })
        .catch(done);
    });
  });


  describe('writeXLSXStream', function () {

    it('should write data table to xlsx file', function (done) {
      let filename = 'temp.xlsx';
      let testFilePath = path.join(__dirname, '..', 'fixtures', filename);
      let stream = fs.createWriteStream(testFilePath);

      fileParser
        .writeXLSXStream(stream, dataTableFixtures)
        .then(function () {
          // check saved uploaded file on server
          should.equal(fs.existsSync(testFilePath), true);

          let workbook = new Exceljs.Workbook();

          return workbook.xlsx.readFile(testFilePath)
            .then(function () {
              workbook.should.be.instanceof(Exceljs.Workbook);
              workbook.getWorksheet(1).actualRowCount.should.eql(4);

              // delete test file
              fs.unlink(testFilePath, done);
            });
        })
        .catch(done);
    });
  });
});
