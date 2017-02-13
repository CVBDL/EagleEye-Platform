'use strict';

let Exceljs = require('exceljs');
let fs = require('fs');
let path = require('path');
let should = require('should');

let dataTable = require('../../modules/data-table');
let dataTableFixtures = require('../fixtures/datatable');


describe('modules: charts', function () {


  describe('fromXLSXStream', function () {

    it('should get data table from xlsx stream', function (done) {
      let filename = 'datatable0.xlsx';
      let testFilePath = path.join(__dirname, '..', 'fixtures', filename);
      let stream = fs.createReadStream(testFilePath);

      dataTable
        .fromXLSXStream(stream)
        .then(function (datatable) {
          datatable.should.eql(dataTableFixtures);
          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });
  });
  

  describe('toXLSXStream', function () {

    it('should write data table to an .xlsx file via stream', function (done) {
      let filename = 'temp.xlsx';
      let testFilePath = path.join(__dirname, '..', 'fixtures', filename);
      let stream = fs.createWriteStream(testFilePath);

      dataTable
        .toXLSXStream(dataTableFixtures, stream)
        .then(function (datatable) {
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

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });
  });
});
